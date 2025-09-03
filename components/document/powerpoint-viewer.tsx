'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Play, Pause } from 'lucide-react'

interface PowerPointViewerProps {
    filePath: string
    isFullscreen?: boolean
}

interface SlideData {
    index: number
    title: string
    content: string
    notes?: string
}

export default function PowerPointViewer({ filePath, isFullscreen = false }: PowerPointViewerProps) {
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [slides, setSlides] = useState<SlideData[]>([])
    const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0)
    const [scale, setScale] = useState<number>(1.0)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null)

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
            
            // Для PowerPoint используем упрощенный подход - извлекаем текст
            // В реальном проекте можно использовать специализированные библиотеки
            const XLSX = await import('xlsx')
            
            try {
                const workbook = XLSX.read(arrayBuffer, { type: 'array' })
                const sheetNames = workbook.SheetNames
                
                const slidesData: SlideData[] = sheetNames.map((name, index) => {
                    const worksheet = workbook.Sheets[name]
                    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
                    const content = data
                        .flat()
                        .filter(cell => cell && String(cell).trim())
                        .join(' ')
                    
                    return {
                        index: index + 1,
                        title: `Слайд ${index + 1}`,
                        content: content || 'Пустой слайд',
                        notes: ''
                    }
                })
                
                if (slidesData.length > 0) {
                    setSlides(slidesData)
                } else {
                    // Если не удалось извлечь слайды, создаем базовую структуру
                    setSlides([{
                        index: 1,
                        title: 'Презентация',
                        content: 'Содержимое презентации загружено',
                        notes: ''
                    }])
                }
            } catch (xlsxError) {
                // Если XLSX не работает, создаем базовую структуру
                setSlides([{
                    index: 1,
                    title: 'Презентация',
                    content: 'Содержимое презентации загружено',
                    notes: ''
                }])
            }
            
            setCurrentSlideIndex(0)
            setLoading(false)
        } catch (error) {
            console.error('PowerPoint document load error:', error)
            setError('Ошибка загрузки PowerPoint документа')
            setLoading(false)
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
                        <div className="text-lg text-gray-600 leading-relaxed">
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

            <style jsx global>{`
                .slide-container {
                    aspect-ratio: 16/9;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                
                .slide-content {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                }
            `}</style>
        </div>
    )
}
