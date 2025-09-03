'use client'

import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, FileImage, AlertTriangle, Download, RefreshCw } from 'lucide-react'
import './pdf-viewer.css'
import { getPDFInfo, attemptPDFRecovery } from '@/lib/pdf-validator'

// Настройка worker для react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFViewerProps {
    filePath: string
    rotation?: number
    isFullscreen?: boolean
}

export default function PDFViewer({ filePath, rotation = 0, isFullscreen = false }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [scale, setScale] = useState<number>(1.0)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [pdfDiagnostics, setPdfDiagnostics] = useState<any>(null)
    const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false)

    useEffect(() => {
        setLoading(true)
        setError(null)
    }, [filePath])

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages)
        setLoading(false)
        setError(null)
    }

        const onDocumentLoadError = async (error: Error) => {
        console.error('PDF load error:', error)
        
        // Детальная диагностика ошибки PDF
        let errorMessage = 'Ошибка загрузки PDF документа'
        
        if (error.message.includes('Invalid PDF structure')) {
            errorMessage = 'PDF файл поврежден или имеет неверную структуру'
        } else if (error.message.includes('Password required')) {
            errorMessage = 'PDF файл защищен паролем'
        } else if (error.message.includes('Invalid PDF header')) {
            errorMessage = 'Неверный заголовок PDF файла'
        } else if (error.message.includes('Unexpected end of data')) {
            errorMessage = 'PDF файл неполный или поврежден'
        } else if (error.message.includes('Invalid XRef entry')) {
            errorMessage = 'PDF файл имеет поврежденную структуру ссылок'
        }
        
        setError(errorMessage)
        setLoading(false)
        
        // Запускаем диагностику PDF
        try {
            const response = await fetch(filePath)
            if (response.ok) {
                const buffer = await response.arrayBuffer()
                const diagnostics = await getPDFInfo(Buffer.from(buffer))
                setPdfDiagnostics(diagnostics)
            }
        } catch (diagnosticError) {
            console.warn('PDF diagnostics failed:', diagnosticError)
        }
        
        // Логируем детали для отладки
        console.error('PDF Error Details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        })
    }

    const goToPrevPage = () => {
        setPageNumber(prev => Math.max(prev - 1, 1))
    }

    const goToNextPage = () => {
        setPageNumber(prev => Math.min(prev + 1, numPages))
    }

    const zoomIn = () => {
        setScale(prev => Math.min(prev + 0.2, 3.0))
    }

    const zoomOut = () => {
        setScale(prev => Math.max(prev - 0.2, 0.5))
    }

    const resetZoom = () => {
        setScale(1.0)
    }

        if (error) {
        return (
            <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center text-red-600 max-w-md">
                        <div className="mb-4">
                            <FileImage className="mx-auto h-16 w-16 text-red-400 mb-3" />
                            <h3 className="text-lg font-semibold mb-2">Ошибка загрузки PDF</h3>
                            <p className="text-sm mb-3">{error}</p>
                        </div>
                        
                        <div className="bg-red-50 p-3 rounded-lg text-left mb-4">
                            <h4 className="font-medium text-red-800 mb-2">Возможные причины:</h4>
                            <ul className="text-xs text-red-700 space-y-1">
                                <li>• Файл защищен паролем</li>
                                <li>• Файл поврежден при загрузке</li>
                                <li>• PDF содержит только изображения без текста</li>
                                <li>• Неподдерживаемая версия PDF</li>
                                <li>• Файл загружен не полностью</li>
                            </ul>
                        </div>
                        
                        <div className="space-y-2">
                            <Button 
                                onClick={() => window.location.reload()} 
                                className="w-full"
                                variant="outline"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Попробовать снова
                            </Button>
                            
                            {pdfDiagnostics && (
                                <Button 
                                    onClick={() => setShowDiagnostics(!showDiagnostics)} 
                                    className="w-full"
                                    variant="secondary"
                                >
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    {showDiagnostics ? 'Скрыть' : 'Показать'} диагностику
                                </Button>
                            )}
                            
                            <Button 
                                onClick={() => {
                                    // Скачиваем файл для проверки
                                    const link = document.createElement('a')
                                    link.href = filePath
                                    link.download = 'document.pdf'
                                    link.click()
                                }} 
                                className="w-full"
                                variant="outline"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Скачать для проверки
                            </Button>
                        </div>
                        
                        {/* Детальная диагностика */}
                        {showDiagnostics && pdfDiagnostics && (
                            <div className="mt-4 bg-gray-50 p-4 rounded-lg text-left">
                                <h4 className="font-medium text-gray-800 mb-3">Техническая диагностика:</h4>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                    <div>
                                        <span className="text-gray-500">Размер файла:</span>
                                        <span className="ml-2 font-mono">{Math.round(pdfDiagnostics.technicalDetails.fileSize / 1024)} КБ</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Версия PDF:</span>
                                        <span className="ml-2 font-mono">{pdfDiagnostics.technicalDetails.version || 'Неизвестно'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Заголовок:</span>
                                        <span className="ml-2 font-mono text-xs">{pdfDiagnostics.technicalDetails.headerBytes}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Страниц:</span>
                                        <span className="ml-2 font-mono">{pdfDiagnostics.technicalDetails.pageCount || 'Неизвестно'}</span>
                                    </div>
                                </div>
                                
                                {pdfDiagnostics.suggestions.length > 0 && (
                                    <div className="mb-3">
                                        <h5 className="font-medium text-gray-700 mb-2">Рекомендации:</h5>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                            {pdfDiagnostics.suggestions.map((suggestion, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-blue-500 mr-2">•</span>
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (loading) {
        return (
            <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Загрузка PDF документа...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className={`h-full flex flex-col ${isFullscreen ? 'bg-white' : ''}`}>
            {/* Панель управления */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevPage}
                        disabled={pageNumber <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                        Страница {pageNumber} из {numPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={pageNumber >= numPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomOut}
                        disabled={scale <= 0.5}
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[60px] text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomIn}
                        disabled={scale >= 3.0}
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetZoom}
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Область просмотра PDF */}
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
                <div className="flex justify-center">
                    <Document
                        file={filePath}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-sm text-muted-foreground">Загрузка страницы...</p>
                            </div>
                        }
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            rotate={rotation}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="shadow-lg bg-white"
                        />
                    </Document>
                </div>
            </div>
        </div>
    )
}
