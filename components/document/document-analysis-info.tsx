'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
    FileText, 
    FileImage, 
    FileSpreadsheet, 
    Presentation, 
    Code, 
    CheckCircle, 
    AlertCircle,
    Info
} from 'lucide-react'
import { Document } from '@/types/document'
import { getDocumentTypeInfo } from '@/lib/document-analyzer'

interface DocumentAnalysisInfoProps {
    document: Document
}

export function DocumentAnalysisInfo({ document }: DocumentAnalysisInfoProps) {
    const documentType = document.detectedType || document.fileType || ''
    const typeInfo = getDocumentTypeInfo(documentType)
    
    if (!documentType || !typeInfo) {
        return null
    }

    const getConfidenceColor = (confidence?: number) => {
        if (!confidence) return 'default'
        if (confidence >= 0.9) return 'default'
        if (confidence >= 0.7) return 'secondary'
        if (confidence >= 0.5) return 'outline'
        return 'destructive'
    }

    const getConfidenceText = (confidence?: number) => {
        if (!confidence) return 'Неизвестно'
        if (confidence >= 0.9) return 'Очень высокая'
        if (confidence >= 0.7) return 'Высокая'
        if (confidence >= 0.5) return 'Средняя'
        return 'Низкая'
    }

    const getIcon = () => {
        switch (documentType) {
            case 'pdf':
                return <FileImage className="h-4 w-4 text-red-600" />
            case 'word':
                return <FileText className="h-4 w-4 text-blue-600" />
            case 'excel':
                return <FileSpreadsheet className="h-4 w-4 text-green-600" />
            case 'powerpoint':
                return <Presentation className="h-4 w-4 text-orange-600" />
            case 'text':
                return <FileText className="h-4 w-4 text-gray-600" />
            case 'code':
                return <Code className="h-4 w-4 text-purple-600" />
            case 'image':
                return <FileImage className="h-4 w-4 text-pink-600" />
            default:
                return <FileText className="h-4 w-4" />
        }
    }

    return (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span>Анализ документа</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Тип документа */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {getIcon()}
                        <span className="text-sm font-medium">Тип документа:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                            {typeInfo.name}
                        </Badge>
                        {document.detectedType && (
                            <CheckCircle className="h-4 w-4 text-green-600" title="Автоматически определен" />
                        )}
                    </div>
                </div>

                {/* Описание */}
                <div className="text-sm text-gray-600">
                    {typeInfo.description}
                </div>

                {/* Детали анализа */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Расширение:</span>
                        <span className="ml-2 font-mono">{document.fileName?.split('.').pop()?.toUpperCase()}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">MIME тип:</span>
                        <span className="ml-2 font-mono text-xs">{document.mimeType || 'Неизвестно'}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Размер:</span>
                        <span className="ml-2">{formatFileSize(document.fileSize)}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Уверенность:</span>
                        <Badge 
                            variant={getConfidenceColor(0.9)} 
                            className="ml-2 text-xs"
                        >
                            {getConfidenceText(0.9)}
                        </Badge>
                    </div>
                </div>

                {/* Рекомендации */}
                <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <div className="font-medium mb-1">Рекомендуемый просмотрщик:</div>
                            <div className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">
                                {typeInfo.viewer}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function formatFileSize(bytes?: number | null): string {
    if (!bytes) return 'Неизвестно'

    if (bytes < 1024) return `${bytes} Б`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}
