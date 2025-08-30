"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Upload,
    File,
    FileText,
    FileSpreadsheet,
    Presentation,
    AlertCircle,
    CheckCircle,
    X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSupportedFileTypes, isFileTypeSupported, getFileIcon, formatFileSize } from '@/lib/file-utils'

interface FileUploadProps {
    onFileUploaded: (document: any) => void
    className?: string
}

interface UploadingFile {
    file: File
    progress: number
    status: 'uploading' | 'success' | 'error'
    error?: string
}

export function FileUpload({ onFileUploaded, className }: FileUploadProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])

    const getFileIconComponent = (fileName: string) => {
        const iconType = getFileIcon(fileName)

        switch (iconType) {
            case 'word':
                return <FileText className="h-6 w-6 text-blue-600" />
            case 'excel':
                return <FileSpreadsheet className="h-6 w-6 text-green-600" />
            case 'powerpoint':
                return <Presentation className="h-6 w-6 text-orange-600" />
            case 'pdf':
                return <File className="h-6 w-6 text-red-600" />
            case 'text':
                return <FileText className="h-6 w-6 text-gray-600" />
            default:
                return <File className="h-6 w-6 text-gray-600" />
        }
    }

    const uploadFile = async (file: File) => {
        const fileUpload: UploadingFile = {
            file,
            progress: 0,
            status: 'uploading'
        }

        setUploadingFiles(prev => [...prev, fileUpload])

        try {
            const formData = new FormData()
            formData.append('file', file)

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadingFiles(prev =>
                    prev.map(f =>
                        f.file === file && f.progress < 90
                            ? { ...f, progress: f.progress + 10 }
                            : f
                    )
                )
            }, 200)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            clearInterval(progressInterval)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Ошибка загрузки')
            }

            const data = await response.json()

            setUploadingFiles(prev =>
                prev.map(f =>
                    f.file === file
                        ? { ...f, progress: 100, status: 'success' }
                        : f
                )
            )

            // Call callback with uploaded document
            onFileUploaded(data.document)

            // Remove from uploading list after delay
            setTimeout(() => {
                setUploadingFiles(prev => prev.filter(f => f.file !== file))
            }, 2000)

        } catch (error) {
            setUploadingFiles(prev =>
                prev.map(f =>
                    f.file === file
                        ? {
                            ...f,
                            status: 'error',
                            error: error instanceof Error ? error.message : 'Ошибка загрузки'
                        }
                        : f
                )
            )
        }
    }

    const onDrop = useCallback((acceptedFiles: File[]) => {
        acceptedFiles.forEach(uploadFile)
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'application/vnd.ms-powerpoint': ['.ppt'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
    })

    const removeUploadingFile = (file: File) => {
        setUploadingFiles(prev => prev.filter(f => f.file !== file))
    }

    return (
        <div className={cn("space-y-4", className)}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <Upload className="h-5 w-5 mr-2" />
                        Загрузить документ
                    </CardTitle>
                    <CardDescription>
                        Поддерживаемые форматы: Word, PowerPoint, Excel, PDF, Text
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                            isDragActive
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                                : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                        )}
                    >
                        <input {...getInputProps()} />
                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        {isDragActive ? (
                            <p className="text-blue-600 font-medium">
                                Отпустите файл для загрузки...
                            </p>
                        ) : (
                            <div>
                                <p className="text-lg font-medium mb-2">
                                    Перетащите файл сюда или нажмите для выбора
                                </p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Максимальный размер файла: 10MB
                                </p>
                                <Button variant="outline">
                                    Выбрать файл
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 text-xs text-muted-foreground">
                        <p className="font-medium mb-1">Поддерживаемые форматы:</p>
                        <p>{getSupportedFileTypes().join(', ')}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Uploading Files */}
            {uploadingFiles.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Загрузка файлов</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {uploadingFiles.map((uploadingFile, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {getFileIconComponent(uploadingFile.file.name)}
                                        <div>
                                            <p className="text-sm font-medium">
                                                {uploadingFile.file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(uploadingFile.file.size)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {uploadingFile.status === 'success' && (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        )}
                                        {uploadingFile.status === 'error' && (
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeUploadingFile(uploadingFile.file)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {uploadingFile.status === 'uploading' && (
                                    <Progress value={uploadingFile.progress} className="h-2" />
                                )}

                                {uploadingFile.status === 'error' && (
                                    <p className="text-xs text-red-500">
                                        {uploadingFile.error}
                                    </p>
                                )}

                                {uploadingFile.status === 'success' && (
                                    <p className="text-xs text-green-600">
                                        Файл успешно загружен!
                                    </p>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
