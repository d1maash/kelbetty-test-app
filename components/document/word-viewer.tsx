'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

interface WordViewerProps {
    filePath: string
    isFullscreen?: boolean
}

export default function WordViewer({ filePath, isFullscreen = false }: WordViewerProps) {
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [scale, setScale] = useState<number>(1.0)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadDocument()
    }, [filePath])

    const loadDocument = async () => {
        try {
            setLoading(true)
            setError(null)

            // Загружаем файл
            const response = await fetch(filePath)
            if (!response.ok) throw new Error('Ошибка загрузки файла')

            const arrayBuffer = await response.arrayBuffer()

            // Динамически импортируем docx-preview
            const { renderAsync } = await import('docx-preview')

            if (containerRef.current) {
                await renderAsync(arrayBuffer, containerRef.current, containerRef.current, {
                    className: 'docx-viewer',
                    inWrapper: true,
                    ignoreWidth: false,
                    ignoreHeight: false,
                    ignoreFonts: false,
                    breakPages: true,
                    ignoreLastRenderedPageBreak: true,
                    experimental: true,
                    trimXmlDeclaration: true,
                    useBase64URL: true,
                    useMathMLPolyfill: true,
                    renderEndnotes: true,
                    renderFooters: true,
                    renderFootnotes: true,
                    renderHeaders: true,
                    pageWidth: 816,
                    pageHeight: 1056,
                    pageMargins: 72,
                })

                // Получаем количество страниц
                const pages = containerRef.current.querySelectorAll('.docx-page')
                setTotalPages(pages.length)
            }

            setLoading(false)
        } catch (error) {
            console.error('Word document load error:', error)
            setError('Ошибка загрузки Word документа')
            setLoading(false)
        }
    }

    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0))
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5))
    const resetZoom = () => setScale(1.0)
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))

    if (error) {
        return (
            <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center text-red-600">
                        <p className="text-lg font-semibold mb-2">Ошибка загрузки</p>
                        <p className="text-sm">{error}</p>
                        <Button onClick={loadDocument} className="mt-4" variant="outline">
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
                        <p className="text-muted-foreground">Загрузка Word документа...</p>
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
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                        Страница {currentPage} из {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage >= totalPages}
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

            {/* Область просмотра документа */}
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
                <div
                    ref={containerRef}
                    className="docx-container mx-auto bg-white shadow-lg"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        minHeight: '100%'
                    }}
                />
            </div>

            <style jsx global>{`
                .docx-viewer {
                    font-family: 'Times New Roman', serif;
                    line-height: 1.5;
                }
                
                .docx-page {
                    margin: 20px auto;
                    padding: 40px;
                    background: white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    max-width: 816px;
                }
                
                .docx-viewer table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 10px 0;
                }
                
                .docx-viewer td, .docx-viewer th {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                
                .docx-viewer img {
                    max-width: 100%;
                    height: auto;
                }
            `}</style>
        </div>
    )
}
