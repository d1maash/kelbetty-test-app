'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Download, FileText, Presentation, FileSpreadsheet, FileImage, Eye, Edit, Bot } from 'lucide-react'
import { Document } from '@/types/document'

interface FormattedDocumentViewerProps {
    document: Document | null
    onEdit?: () => void
    onDownload?: () => void
}

export function FormattedDocumentViewer({
    document,
    onEdit,
    onDownload
}: FormattedDocumentViewerProps) {
    const [viewMode, setViewMode] = useState<'formatted' | 'text'>('formatted')

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
        if (!document.fileType) return <FileText className="h-5 w-5" />

        if (document.fileType.includes('word')) {
            return <FileText className="h-5 w-5 text-blue-600" />
        }
        if (document.fileType.includes('presentation')) {
            return <Presentation className="h-5 w-5 text-orange-600" />
        }
        if (document.fileType.includes('sheet') || document.fileType.includes('excel')) {
            return <FileSpreadsheet className="h-5 w-5 text-green-600" />
        }
        if (document.fileType.includes('pdf')) {
            return <FileImage className="h-5 w-5 text-red-600" />
        }

        return <FileText className="h-5 w-5" />
    }

    const getFileTypeBadge = () => {
        if (!document.fileType) return 'Документ'

        if (document.fileType.includes('word')) return 'Word'
        if (document.fileType.includes('presentation')) return 'PowerPoint'
        if (document.fileType.includes('sheet') || document.fileType.includes('excel')) return 'Excel'
        if (document.fileType.includes('pdf')) return 'PDF'

        return 'Документ'
    }

    const formatFileSize = (bytes?: number | null) => {
        if (!bytes) return 'Неизвестно'

        if (bytes < 1024) return `${bytes} Б`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
        return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
    }

    return (
        <Card className="h-full flex flex-col">
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
                            variant={viewMode === 'formatted' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('formatted')}
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            Форматирование
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
                        Редактировать вручную
                    </Button>
                    <Button onClick={onDownload} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Скачать оригинал
                    </Button>
                    <div className="text-xs text-muted-foreground flex items-center">
                        <Bot className="h-3 w-3 mr-1" />
                        Или используйте AI чат →
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                    <div className="p-6">
                        {viewMode === 'formatted' && (document.htmlContent || document.content.includes('<')) ? (
                            <div
                                className="formatted-content prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: document.htmlContent || document.content }}
                            />
                        ) : (
                            <div className="text-content">
                                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                    {document.content.replace(/<[^>]*>/g, '')}
                                </pre>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

// Дополнительные стили для форматированного контента
export const DocumentViewerStyles = () => (
    <style jsx global>{`
    .formatted-content {
      max-width: none !important;
      width: 100% !important;
    }
    
    .formatted-content .word-document,
    .formatted-content .pdf-document {
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
    }
    
    .formatted-content .powerpoint-document {
      background: transparent !important;
      padding: 0 !important;
    }
    
    .formatted-content .slide {
      margin: 20px 0 !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
    }
    
    .formatted-content .excel-document {
      padding: 0 !important;
    }
    
    .formatted-content .excel-sheet {
      margin: 15px 0 !important;
    }
    
    .formatted-content table {
      font-size: 0.9em !important;
    }
    
    .formatted-content pre {
      background: #f8f9fa !important;
      padding: 15px !important;
      border-radius: 6px !important;
      overflow-x: auto !important;
    }
    
    /* Адаптивность */
    @media (max-width: 768px) {
      .formatted-content .slide {
        padding: 20px !important;
        margin: 10px 0 !important;
      }
      
      .formatted-content .excel-table {
        font-size: 0.8em !important;
      }
      
      .formatted-content .excel-table th,
      .formatted-content .excel-table td {
        padding: 4px !important;
      }
    }
  `}</style>
)
