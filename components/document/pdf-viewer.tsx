'use client'

import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import './pdf-viewer.css'

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

    useEffect(() => {
        setLoading(true)
        setError(null)
    }, [filePath])

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages)
        setLoading(false)
        setError(null)
    }

    const onDocumentLoadError = (error: Error) => {
        console.error('PDF load error:', error)
        setError('Ошибка загрузки PDF документа')
        setLoading(false)
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
                    <div className="text-center text-red-600">
                        <p className="text-lg font-semibold mb-2">Ошибка загрузки</p>
                        <p className="text-sm">{error}</p>
                        <Button 
                            onClick={() => window.location.reload()} 
                            className="mt-4"
                            variant="outline"
                        >
                            Попробовать снова
                        </Button>
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
