"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    FileText,
    Plus,
    Search,
    MoreVertical,
    Trash2,
    Edit
} from 'lucide-react'
import { Document } from '@/types/document'
import { cn, formatDate } from '@/lib/utils'

interface DocumentListProps {
    documents: Document[]
    selectedDocumentId?: string
    onSelectDocument: (document: Document) => void
    onCreateDocument: () => void
    onDeleteDocument: (documentId: string) => void
    className?: string
}

export function DocumentList({
    documents,
    selectedDocumentId,
    onSelectDocument,
    onCreateDocument,
    onDeleteDocument,
    className
}: DocumentListProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const truncateContent = (content: string, maxLength: number = 100) => {
        if (content.length <= maxLength) return content
        return content.slice(0, maxLength) + '...'
    }

    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Документы</CardTitle>
                    <Button
                        onClick={onCreateDocument}
                        size="sm"
                        variant="gradient"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Новый
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск документов..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-2">
                        {filteredDocuments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-sm">
                                    {searchTerm ? 'Документы не найдены' : 'Нет документов'}
                                </p>
                                {!searchTerm && (
                                    <Button
                                        onClick={onCreateDocument}
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2"
                                    >
                                        Создать первый документ
                                    </Button>
                                )}
                            </div>
                        ) : (
                            filteredDocuments.map((document) => (
                                <div
                                    key={document.id}
                                    className={cn(
                                        "group relative p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                                        selectedDocumentId === document.id
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-border hover:border-blue-200"
                                    )}
                                    onClick={() => onSelectDocument(document)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                <h3 className="font-medium text-sm truncate">
                                                    {document.title || 'Без названия'}
                                                </h3>
                                            </div>

                                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                                {truncateContent(document.content) || 'Пустой документ'}
                                            </p>

                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{formatDate(document.updatedAt)}</span>
                                                <span>{document.content.length} символов</span>
                                            </div>
                                        </div>

                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onDeleteDocument(document.id)
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
