'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react'

interface ExcelViewerProps {
    filePath: string
    isFullscreen?: boolean
}

interface SheetData {
    name: string
    data: any[][]
}

export default function ExcelViewer({ filePath, isFullscreen = false }: ExcelViewerProps) {
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [sheets, setSheets] = useState<SheetData[]>([])
    const [currentSheetIndex, setCurrentSheetIndex] = useState<number>(0)
    const [scale, setScale] = useState<number>(1.0)

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
            
            // Динамически импортируем xlsx
            const XLSX = await import('xlsx')
            
            const workbook = XLSX.read(arrayBuffer, { type: 'array' })
            const sheetNames = workbook.SheetNames
            
            const sheetsData: SheetData[] = sheetNames.map(name => {
                const worksheet = workbook.Sheets[name]
                const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
                return { name, data }
            })
            
            setSheets(sheetsData)
            setCurrentSheetIndex(0)
            setLoading(false)
        } catch (error) {
            console.error('Excel document load error:', error)
            setError('Ошибка загрузки Excel документа')
            setLoading(false)
        }
    }

    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0))
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5))
    const resetZoom = () => setScale(1.0)
    
    const goToPrevSheet = () => setCurrentSheetIndex(prev => Math.max(prev - 1, 0))
    const goToNextSheet = () => setCurrentSheetIndex(prev => Math.min(prev + 1, sheets.length - 1))

    const exportToCSV = () => {
        if (!sheets[currentSheetIndex]) return
        
        const currentSheet = sheets[currentSheetIndex]
        const csvContent = currentSheet.data
            .map(row => row.map(cell => `"${cell || ''}"`).join(','))
            .join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${currentSheet.name}.csv`
        link.click()
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
                        <p className="text-muted-foreground">Загрузка Excel документа...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const currentSheet = sheets[currentSheetIndex]
    if (!currentSheet) return null

    return (
        <div className={`h-full flex flex-col ${isFullscreen ? 'bg-white' : ''}`}>
            {/* Панель управления */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevSheet}
                        disabled={currentSheetIndex <= 0}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                        Лист {currentSheetIndex + 1} из {sheets.length}: {currentSheet.name}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextSheet}
                        disabled={currentSheetIndex >= sheets.length - 1}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                    >
                        <Download className="h-4 w-4 mr-1" />
                        CSV
                    </Button>
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

            {/* Область просмотра таблицы */}
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
                <div 
                    className="excel-container mx-auto bg-white shadow-lg overflow-auto"
                    style={{ 
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        minWidth: 'fit-content'
                    }}
                >
                    <table className="excel-table border-collapse">
                        <tbody>
                            {currentSheet.data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50">
                                    {row.map((cell, cellIndex) => (
                                        <td 
                                            key={cellIndex} 
                                            className="border border-gray-300 px-3 py-2 text-sm min-w-[100px] max-w-[300px]"
                                        >
                                            <div className="truncate" title={String(cell || '')}>
                                                {cell || ''}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx global>{`
                .excel-table {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 14px;
                }
                
                .excel-table td {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .excel-table tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                
                .excel-table tr:hover {
                    background-color: #f0f0f0;
                }
            `}</style>
        </div>
    )
}
