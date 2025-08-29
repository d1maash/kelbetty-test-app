'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSimpleUploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setResult(null)
            setError(null)
        }
    }

    const handleUpload = async () => {
        if (!file) {
            setError('Выберите файл для загрузки')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/test-upload-simple', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (response.ok) {
                setResult(data)
            } else {
                setError(data.error || 'Ошибка при загрузке')
            }
        } catch (err) {
            setError('Ошибка сети: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>🧪 Простое тестирование загрузки файлов</CardTitle>
                    <p className="text-muted-foreground">
                        Тестирование парсинга файлов без авторизации и базы данных
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* File Upload */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Выберите файл для тестирования:
                            </label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".docx,.pptx,.xlsx,.pdf"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        {file && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p><strong>Файл:</strong> {file.name}</p>
                                <p><strong>Тип:</strong> {file.type}</p>
                                <p><strong>Размер:</strong> {(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        )}

                        <Button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className="w-full"
                        >
                            {loading ? 'Тестируем...' : 'Протестировать загрузку'}
                        </Button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h3 className="font-semibold text-red-800">Ошибка:</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Result Display */}
                    {result && (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h3 className="font-semibold text-green-800 mb-3">✅ Успешно обработано!</h3>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p><strong>Файл:</strong> {result.fileName}</p>
                                        <p><strong>Тип:</strong> {result.fileType}</p>
                                        <p><strong>Размер:</strong> {(result.fileSize / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <div>
                                        <p><strong>Текст:</strong> {result.contentLength} символов</p>
                                        <p><strong>HTML:</strong> {result.htmlContentLength} символов</p>
                                        <p><strong>Форматирование:</strong> {result.hasHtml ? '✅ Есть' : '❌ Нет'}</p>
                                    </div>
                                </div>

                                {result.metadata && (
                                    <div className="mb-4">
                                        <strong>Метаданные:</strong>
                                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                                            {JSON.stringify(result.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                <div>
                                    <strong>Предварительный просмотр текста:</strong>
                                    <pre className="text-xs bg-gray-100 p-3 rounded mt-1 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                        {result.contentPreview}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">📋 Инструкции:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Поддерживаются файлы: .docx, .pptx, .xlsx, .pdf</li>
                            <li>• Тест проверяет только парсинг файлов</li>
                            <li>• Файлы не сохраняются в базу данных</li>
                            <li>• Авторизация не требуется</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
