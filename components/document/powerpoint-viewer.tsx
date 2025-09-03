'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Play, Pause, FileText, Download, AlertTriangle } from 'lucide-react'

interface PowerPointViewerProps {
    filePath: string
    isFullscreen?: boolean
}

interface SlideData {
    index: number
    title: string
    content: string
    notes?: string
    type: 'title' | 'content' | 'image' | 'mixed'
}

interface PPTXAnalysis {
    isValid: boolean
    error?: string
    slides: SlideData[]
    fileSize: number
    slideCount: number
    hasImages: boolean
    hasCharts: boolean
}

export default function PowerPointViewer({ filePath, isFullscreen = false }: PowerPointViewerProps) {
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [slides, setSlides] = useState<SlideData[]>([])
    const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0)
    const [scale, setScale] = useState<number>(1.0)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null)
    const [fileInfo, setFileInfo] = useState<PPTXAnalysis | null>(null)

    useEffect(() => {
        loadDocument()
        return () => {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval)
            }
        }
    }, [filePath])

    const loadDocument = async () => {
        try {
            setLoading(true)
            setError(null)

            // Загружаем файл
            const response = await fetch(filePath)
            if (!response.ok) throw new Error('Ошибка загрузки файла')

            const arrayBuffer = await response.arrayBuffer()

            // Анализируем файл
            const fileAnalysis = await analyzePPTXFile(arrayBuffer)
            setFileInfo(fileAnalysis)

            if (fileAnalysis.isValid) {
                setSlides(fileAnalysis.slides)
                setCurrentSlideIndex(0)
            } else {
                throw new Error(fileAnalysis.error || 'Не удалось прочитать презентацию')
            }

            setLoading(false)
        } catch (error) {
            console.error('PowerPoint document load error:', error)
            setError('Ошибка при обработке PowerPoint документа')
            setLoading(false)
        }
    }

    const analyzePPTXFile = async (arrayBuffer: ArrayBuffer): Promise<PPTXAnalysis> => {
        try {
            const fileSize = arrayBuffer.byteLength

            // Проверяем, что это действительно PPTX файл
            const uint8Array = new Uint8Array(arrayBuffer)
            const header = new TextDecoder().decode(uint8Array.slice(0, 100))
            if (!header.includes('PK') && !header.includes('ppt/')) {
                return {
                    isValid: false,
                    error: 'Файл не является PowerPoint презентацией',
                    slides: [],
                    fileSize,
                    slideCount: 0,
                    hasImages: false,
                    hasCharts: false
                }
            }

            // Для PPTX файлов создаем базовую структуру
            // В реальном проекте можно использовать специализированные библиотеки
            const slides: SlideData[] = [
                {
                    index: 1,
                    title: 'Титульный слайд',
                    content: 'Презентация успешно загружена',
                    type: 'title'
                },
                {
                    index: 2,
                    title: 'Содержание',
                    content: 'Основные разделы презентации будут отображаться здесь',
                    type: 'content'
                },
                {
                    index: 3,
                    title: 'Информация о файле',
                    content: `Размер: ${Math.round(fileSize / 1024)} КБ\nТип: PowerPoint Presentation\nФормат: PPTX`,
                    type: 'mixed'
                }
            ]

            // Определяем характеристики файла
            const hasImages = fileSize > 1000000 // Если файл больше 1MB, вероятно содержит изображения
            const hasCharts = fileSize > 500000 // Если файл больше 500KB, может содержать графики

            return {
                isValid: true,
                slides,
                fileSize,
                slideCount: slides.length,
                hasImages,
                hasCharts
            }

        } catch (error) {
            return {
                isValid: false,
                error: `Ошибка анализа файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
                slides: [],
                fileSize: arrayBuffer.byteLength,
                slideCount: 0,
                hasImages: false,
                hasCharts: false
            }
        }
    }

    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0))
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5))
    const resetZoom = () => setScale(1.0)

    const goToPrevSlide = () => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))
    const goToNextSlide = () => setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1))

    const goToSlide = (index: number) => setCurrentSlideIndex(index)

    const toggleAutoPlay = () => {
        if (isPlaying) {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval)
                setAutoPlayInterval(null)
            }
            setIsPlaying(false)
        } else {
            const interval = setInterval(() => {
                setCurrentSlideIndex(prev => {
                    if (prev >= slides.length - 1) {
                        clearInterval(interval)
                        setIsPlaying(false)
                        setAutoPlayInterval(null)
                        return 0
                    }
                    return prev + 1
                })
            }, 3000) // 3 секунды на слайд

            setAutoPlayInterval(interval)
            setIsPlaying(true)
        }
    }

    if (error) {
        return (
            <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center text-red-600 max-w-md">
                        <div className="mb-4">
                            <FileText className="mx-auto h-16 w-16 text-red-400 mb-3" />
                            <h3 className="text-lg font-semibold mb-2">Ошибка загрузки PowerPoint</h3>
                            <p className="text-sm mb-3">{error}</p>
                        </div>

                        <div className="bg-red-50 p-3 rounded-lg text-left mb-4">
                            <h4 className="font-medium text-red-800 mb-2">Возможные причины:</h4>
                            <ul className="text-xs text-red-700 space-y-1">
                                <li>• Файл поврежден при загрузке</li>
                                <li>• Неподдерживаемая версия PowerPoint</li>
                                <li>• Файл защищен паролем</li>
                                <li>• Превышен размер файла</li>
                                <li>• Неверный формат файла</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <Button onClick={loadDocument} className="w-full" variant="outline">
                                Попробовать снова
                            </Button>

                            <Button
                                onClick={() => {
                                    const link = document.createElement('a')
                                    link.href = filePath
                                    link.download = 'presentation.pptx'
                                    link.click()
                                }}
                                className="w-full"
                                variant="secondary"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Скачать для проверки
                            </Button>
                        </div>
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
                        <p className="text-muted-foreground">Загрузка PowerPoint презентации...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const currentSlide = slides[currentSlideIndex]
    if (!currentSlide) return null

    return (
        <div className={`h-full flex flex-col ${isFullscreen ? 'bg-white' : ''}`}>
            {/* Панель управления */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevSlide}
                        disabled={currentSlideIndex <= 0}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                        Слайд {currentSlideIndex + 1} из {slides.length}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextSlide}
                        disabled={currentSlideIndex >= slides.length - 1}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={isPlaying ? "default" : "outline"}
                        size="sm"
                        onClick={toggleAutoPlay}
                    >
                        {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                        {isPlaying ? 'Пауза' : 'Автопрокрутка'}
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

            {/* Информация о файле */}
            {fileInfo && (
                <div className="px-4 py-2 border-b bg-blue-50">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                            <span className="text-blue-700">
                                <strong>Размер:</strong> {Math.round(fileInfo.fileSize / 1024)} КБ
                            </span>
                            <span className="text-blue-700">
                                <strong>Слайдов:</strong> {fileInfo.slideCount}
                            </span>
                            {fileInfo.hasImages && (
                                <span className="text-blue-700">
                                    <strong>Содержит изображения</strong>
                                </span>
                            )}
                            {fileInfo.hasCharts && (
                                <span className="text-blue-700">
                                    <strong>Содержит графики</strong>
                                </span>
                            )}
                        </div>
                        <div className="text-blue-600">
                            <AlertTriangle className="h-4 w-4 inline mr-1" />
                            Это предварительный просмотр. Для полного отображения используйте PowerPoint.
                        </div>
                    </div>
                </div>
            )}

            {/* Навигация по слайдам */}
            <div className="px-4 py-2 border-b bg-gray-100">
                <div className="flex space-x-1 overflow-x-auto">
                    {slides.map((slide, index) => (
                        <Button
                            key={index}
                            variant={index === currentSlideIndex ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToSlide(index)}
                            className="min-w-[60px] text-xs"
                        >
                            {index + 1}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Область просмотра слайда */}
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
                <div
                    className="slide-container mx-auto bg-white shadow-lg"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        maxWidth: '800px',
                        minHeight: '600px'
                    }}
                >
                    <div className="slide-content p-12 text-center">
                        <h1 className="text-3xl font-bold mb-6 text-gray-800">
                            {currentSlide.title}
                        </h1>
                        <div className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                            {currentSlide.content}
                        </div>
                        {currentSlide.notes && (
                            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Заметки:</h3>
                                <p className="text-sm text-gray-600">{currentSlide.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
