"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function TestUploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setResult(null)
            setError(null)
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        setError(null)
        setResult(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            console.log('Отправляем файл:', file.name)

            const response = await fetch('/api/upload-test', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || data.details || `HTTP ${response.status}`)
            }

            setResult(data)
            console.log('Файл успешно загружен:', data)
        } catch (error) {
            console.error('Ошибка загрузки:', error)
            setError(error instanceof Error ? error.message : 'Неизвестная ошибка')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Тест загрузки файлов</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Выберите файл для тестирования:
                            </label>
                            <input
                                type="file"
                                onChange={handleFileSelect}
                                accept=".txt,.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        {file && (
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-medium mb-2">Выбранный файл:</h3>
                                    <p><strong>Имя:</strong> {file.name}</p>
                                    <p><strong>Размер:</strong> {(file.size / 1024).toFixed(2)} KB</p>
                                    <p><strong>Тип:</strong> {file.type}</p>
                                </CardContent>
                            </Card>
                        )}

                        <Button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="w-full"
                        >
                            {uploading ? 'Загрузка...' : 'Загрузить файл'}
                        </Button>

                        {uploading && (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">Обрабатываем файл...</p>
                                <Progress value={50} className="w-full" />
                            </div>
                        )}

                        {error && (
                            <Card className="border-red-200 bg-red-50">
                                <CardContent className="p-4">
                                    <h3 className="font-medium text-red-800 mb-2">Ошибка:</h3>
                                    <p className="text-red-700">{error}</p>
                                </CardContent>
                            </Card>
                        )}

                        {result && (
                            <Card className="border-green-200 bg-green-50">
                                <CardContent className="p-4">
                                    <h3 className="font-medium text-green-800 mb-2">Успех!</h3>
                                    <p className="text-green-700 mb-2">{result.message}</p>
                                    {result.file && (
                                        <div className="text-sm text-green-600">
                                            <p><strong>Обработанный файл:</strong> {result.file.name}</p>
                                            <p><strong>Длина контента:</strong> {result.file.contentLength} символов</p>
                                            <p><strong>Превью:</strong></p>
                                            <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                                                {result.file.contentPreview}
                                            </pre>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardContent className="p-4 text-sm text-gray-600">
                                <h3 className="font-medium mb-2">Поддерживаемые форматы:</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Текстовые файлы (.txt)</li>
                                    <li>Word документы (.doc, .docx)</li>
                                    <li>PDF файлы (.pdf)</li>
                                    <li>Excel таблицы (.xls, .xlsx)</li>
                                    <li>PowerPoint презентации (.ppt, .pptx)</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
