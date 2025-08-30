"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Bold,
    Italic,
    List,
    AlignLeft,
    Save,
    Download,
    Sparkles,
    Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentEditorProps {
    initialContent?: string
    onContentChange?: (content: string) => void
    onSave?: (content: string) => void
    onFinishEditing?: () => void
    className?: string
}

export function DocumentEditor({
    initialContent = '',
    onContentChange,
    onSave,
    onFinishEditing,
    className
}: DocumentEditorProps) {
    const [content, setContent] = useState(initialContent)
    const [isSaving, setIsSaving] = useState(false)
    const editorRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        setContent(initialContent)
    }, [initialContent])

    const handleContentChange = (newContent: string) => {
        setContent(newContent)
        onContentChange?.(newContent)
    }

    const handleSave = async () => {
        if (!onSave) return

        setIsSaving(true)
        try {
            await onSave(content)
        } catch (error) {
            console.error('Save error:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const insertFormatting = (before: string, after: string = '') => {
        const textarea = editorRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = content.substring(start, end)

        const newContent =
            content.substring(0, start) +
            before + selectedText + after +
            content.substring(end)

        handleContentChange(newContent)

        // Restore cursor position
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(
                start + before.length,
                end + before.length
            )
        }, 0)
    }

    const downloadDocument = () => {
        const element = document.createElement('a')
        const file = new Blob([content], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        element.download = 'document.txt'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Редактор документа</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadDocument}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Скачать
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                        {onFinishEditing && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={onFinishEditing}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Готово
                            </Button>
                        )}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center space-x-1 pt-2 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('**', '**')}
                        title="Жирный текст"
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('*', '*')}
                        title="Курсив"
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('\n- ', '')}
                        title="Список"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('# ', '')}
                        title="Заголовок"
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
                <Textarea
                    ref={editorRef}
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Начните вводить текст или вставьте существующий документ..."
                    className="document-editor border-0 resize-none rounded-none h-full min-h-[500px] p-6 text-base leading-relaxed"
                />
            </CardContent>
        </Card>
    )
}
