'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
    Download, 
    FileText, 
    Presentation, 
    FileSpreadsheet, 
    FileImage, 
    Edit, 
    Bot,
    Eye,
    Maximize2,
    RotateCcw
} from 'lucide-react'
import { Document } from '@/types/document'
import { DocumentAnalysisInfo } from './document-analysis-info'
import dynamic from 'next/dynamic'

// Динамический импорт компонентов для избежания SSR проблем
const PDFViewer = dynamic(() => import('./pdf-viewer'), { ssr: false })
const WordViewer = dynamic(() => import('./word-viewer'), { ssr: false })
const ExcelViewer = dynamic(() => import('./excel-viewer'), { ssr: false })
const PowerPointViewer = dynamic(() => import('./powerpoint-viewer'), { ssr: false })

interface UniversalDocumentViewerProps {
    document: Document | null
    onEdit?: () => void
    onDownload?: () => void
}

export function UniversalDocumentViewer({
    document,
    onEdit,
    onDownload
}: UniversalDocumentViewerProps) {
    const [viewMode, setViewMode] = useState<'original' | 'formatted' | 'text'>('original')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [rotation, setRotation] = useState(0)

    if (!document) {
        return (
            <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                        <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>Выберите документ для просмотра</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const getFileIcon = () => {
        // Используем автоматически определенный тип документа
        const documentType = document.detectedType || document.fileType || ''
        
        if (!documentType) return <FileText className="h-5 w-5" />

        switch (documentType) {
            case 'pdf':
                return <FileImage className="h-5 w-5 text-red-600" />
            case 'word':
                return <FileText className="h-5 w-5 text-blue-600" />
            case 'excel':
                return <FileSpreadsheet className="h-5 w-5 text-green-600" />
            case 'powerpoint':
                return <Presentation className="h-5 w-5 text-orange-600" />
            case 'text':
                return <FileText className="h-5 w-5 text-gray-600" />
            case 'code':
                return <FileText className="h-5 w-5 text-purple-600" />
            case 'image':
                return <FileImage className="h-5 w-5 text-pink-600" />
            default:
                return <FileText className="h-5 w-5" />
        }
    }

    const getFileTypeBadge = () => {
        // Используем автоматически определенный тип документа
        const documentType = document.detectedType || document.fileType || ''
        
        if (!documentType) return 'Документ'

        switch (documentType) {
            case 'pdf': return 'PDF'
            case 'word': return 'Word'
            case 'excel': return 'Excel'
            case 'powerpoint': return 'PowerPoint'
            case 'text': return 'Текст'
            case 'code': return 'Код'
            case 'image': return 'Изображение'
            default: return 'Документ'
        }
    }

    const formatFileSize = (bytes?: number | null) => {
        if (!bytes) return 'Неизвестно'

        if (bytes < 1024) return `${bytes} Б`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
        return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
    }

    const getDocumentViewer = () => {
        // Используем автоматически определенный тип документа
        const documentType = document.detectedType || document.fileType || ''
        
        if (!documentType) {
            // Для других форматов показываем текстовое содержимое
            return (
                <div className="p-6">
                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {document.content.replace(/<[^>]*>/g, '')}
                    </pre>
                </div>
            )
        }

        if (documentType === 'pdf') {
            return (
                <PDFViewer 
                    filePath={document.filePath || document.originalUrl || ''}
                    rotation={rotation}
                    isFullscreen={isFullscreen}
                />
            )
        }

        if (documentType === 'word') {
            return (
                <WordViewer 
                    filePath={document.filePath || document.originalUrl || ''}
                    isFullscreen={isFullscreen}
                />
            )
        }

        if (documentType === 'excel') {
            return (
                <ExcelViewer 
                    filePath={document.filePath || document.originalUrl || ''}
                    isFullscreen={isFullscreen}
                />
            )
        }

        if (documentType === 'powerpoint') {
            return (
                <PowerPointViewer 
                    filePath={document.filePath || document.originalUrl || ''}
                    isFullscreen={isFullscreen}
                />
            )
        }

        if (documentType === 'text' || documentType === 'code') {
            return (
                <div className="p-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {documentType === 'code' ? 'Исходный код' : 'Текстовый документ'}
                            </h3>
                            <Badge variant="secondary">
                                {documentType === 'code' ? 'КОД' : 'ТЕКСТ'}
                            </Badge>
                        </div>
                        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-700">
                            {document.content.replace(/<[^>]*>/g, '')}
                        </pre>
                    </div>
                </div>
            )
        }

        if (documentType === 'image') {
            return (
                <div className="p-6">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-lg font-semibold text-gray-800 mb-3">
                            Изображение
                        </div>
                        <div className="text-sm text-gray-600">
                            Файл изображения загружен. Для просмотра скачайте файл.
                        </div>
                    </div>
                </div>
            )
        }

        // Для неизвестных форматов показываем текстовое содержимое
        return (
            <div className="p-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Документ
                        </h3>
                        <Badge variant="secondary">
                            {documentType.toUpperCase() || 'НЕИЗВЕСТНО'}
                        </Badge>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-700">
                        {document.content.replace(/<[^>]*>/g, '')}
                    </pre>
                </div>
            </div>
        )
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    const rotateDocument = () => {
        setRotation((prev) => (prev + 90) % 360)
    }

    return (
        <Card className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        {getFileIcon()}
                        <div>
                            <CardTitle className="text-lg">{document.title}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary">{getFileTypeBadge()}</Badge>
                                <span className="text-sm text-muted-foreground">
                                    {formatFileSize(document.fileSize)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <Button
                            variant={viewMode === 'original' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('original')}
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            Оригинал
                        </Button>
                        <Button
                            variant={viewMode === 'formatted' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('formatted')}
                        >
                            <FileText className="h-4 w-4 mr-1" />
                            Форматированный
                        </Button>
                        <Button
                            variant={viewMode === 'text' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('text')}
                        >
                            <FileText className="h-4 w-4 mr-1" />
                            Текст
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                    <Button onClick={onEdit} size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Редактировать
                    </Button>
                    <Button onClick={onDownload} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Скачать оригинал
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleFullscreen}
                    >
                        <Maximize2 className="h-4 w-4 mr-1" />
                        {isFullscreen ? 'Свернуть' : 'Полный экран'}
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={rotateDocument}
                    >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Повернуть
                    </Button>
                    <div className="text-xs text-muted-foreground flex items-center">
                        <Bot className="h-3 w-3 mr-1" />
                        Или используйте AI чат →
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                    {/* Информация об анализе документа */}
                    {document.detectedType && (
                        <DocumentAnalysisInfo document={document} />
                    )}
                    
                    {viewMode === 'original' ? (
                        getDocumentViewer()
                    ) : viewMode === 'formatted' && (document.htmlContent || document.content.includes('<')) ? (
                        <div className="p-6">
                            <div
                                className="formatted-content prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: document.htmlContent || document.content }}
                            />
                        </div>
                    ) : (
                        <div className="p-6">
                            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                                {document.content.replace(/<[^>]*>/g, '')}
                            </pre>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
