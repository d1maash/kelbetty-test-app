'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getPDFInfo, attemptPDFRecovery } from '@/lib/pdf-validator'

export default function TestPDFValidation() {
    const [file, setFile] = useState<File | null>(null)
    const [diagnostics, setDiagnostics] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setDiagnostics(null)
            setError(null)
        }
    }

    const analyzeFile = async () => {
        if (!file) return

        setLoading(true)
        setError(null)
        setDiagnostics(null)

        try {
            const arrayBuffer = await file.arrayBuffer()
            const result = await getPDFInfo(arrayBuffer)
            setDiagnostics(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
        } finally {
            setLoading(false)
        }
    }

    const attemptRecovery = async () => {
        if (!file) return

        setLoading(true)
        try {
            const arrayBuffer = await file.arrayBuffer()
            const result = await attemptPDFRecovery(arrayBuffer)
            console.log('Recovery result:', result)
            alert(result.message)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка восстановления')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>Тестирование PDF валидации</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Выберите PDF файл для анализа:
                        </label>
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="mb-4"
                        />
                        
                        {file && (
                            <div className="text-sm text-gray-600 mb-4">
                                <p><strong>Имя файла:</strong> {file.name}</p>
                                <p><strong>Размер:</strong> {Math.round(file.size / 1024)} КБ</p>
                                <p><strong>Тип:</strong> {file.type || 'Не определен'}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-4">
                        <Button
                            onClick={analyzeFile}
                            disabled={!file || loading}
                            className="flex-1"
                        >
                            {loading ? 'Анализирую...' : 'Анализировать PDF'}
                        </Button>
                        
                        {file && (
                            <Button
                                onClick={attemptRecovery}
                                disabled={loading}
                                variant="outline"
                                className="flex-1"
                            >
                                Попытаться восстановить
                            </Button>
                        )}
                    </div>

                    {error && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-6">
                                <p className="text-red-800 font-medium">Ошибка:</p>
                                <p className="text-red-700">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {diagnostics && (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-blue-800 mb-4">
                                    Результаты анализа PDF
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <span className="font-medium">Статус:</span>
                                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                            diagnostics.isValid 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {diagnostics.isValid ? 'Валиден' : 'Невалиден'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Размер:</span>
                                        <span className="ml-2 font-mono">
                                            {Math.round(diagnostics.technicalDetails.fileSize / 1024)} КБ
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Версия PDF:</span>
                                        <span className="ml-2 font-mono">
                                            {diagnostics.technicalDetails.version || 'Неизвестно'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Страниц:</span>
                                        <span className="ml-2 font-mono">
                                            {diagnostics.technicalDetails.pageCount || 'Неизвестно'}
                                        </span>
                                    </div>
                                </div>

                                {diagnostics.error && (
                                    <div className="mb-4 p-3 bg-red-100 rounded">
                                        <p className="font-medium text-red-800">Ошибка:</p>
                                        <p className="text-red-700 text-sm">{diagnostics.error}</p>
                                    </div>
                                )}

                                {diagnostics.suggestions.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-medium text-blue-800 mb-2">Рекомендации:</h4>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            {diagnostics.suggestions.map((suggestion: string, index: number) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-blue-500 mr-2">•</span>
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="text-xs text-gray-600">
                                    <p><strong>Заголовок файла:</strong> {diagnostics.technicalDetails.headerBytes}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
