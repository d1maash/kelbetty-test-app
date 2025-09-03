'use client'

import './rich-editor.css'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { TextAlign } from '@tiptap/extension-text-align'
import { FontFamily } from '@tiptap/extension-font-family'
import { Underline } from '@tiptap/extension-underline'
import { Highlight } from '@tiptap/extension-highlight'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Quote,
    Save,
    Download,
    Eye,
    Type,
    Palette,
    Highlighter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface RichEditorProps {
    initialContent?: string
    onContentChange?: (content: string) => void
    onSave?: (content: string) => void
    onFinishEditing?: () => void
    className?: string
}

export function RichEditor({
    initialContent = '',
    onContentChange,
    onSave,
    onFinishEditing,
    className
}: RichEditorProps) {
    const [isSaving, setIsSaving] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            TextStyle,
            Color.configure({
                types: ['textStyle'],
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            FontFamily.configure({
                types: ['textStyle'],
            }),
            Underline,
            Highlight.configure({
                multicolor: true,
            }),
        ],
        content: initialContent,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            onContentChange?.(html)
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
            },
        },
    })

    useEffect(() => {
        if (editor && initialContent !== editor.getHTML()) {
            editor.commands.setContent(initialContent)
        }
    }, [initialContent, editor])

    const handleSave = async () => {
        if (!onSave || !editor) return

        setIsSaving(true)
        try {
            const content = editor.getHTML()
            await onSave(content)
        } catch (error) {
            console.error('Save error:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const downloadDocument = () => {
        if (!editor) return

        const content = editor.getHTML()
        const element = document.createElement('a')
        const file = new Blob([content], { type: 'text/html' })
        element.href = URL.createObjectURL(file)
        element.download = 'document.html'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    if (!editor || !isMounted) {
        return (
            <Card className={cn("h-full flex flex-col", className)}>
                <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p>Загрузка редактора...</p>
                    </div>
                </CardContent>
            </Card>
        )
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
                <div className="flex flex-wrap items-center gap-1 pt-2 border-t">
                    {/* Text formatting */}
                    <div className="flex items-center space-x-1 mr-2 border-r pr-2">
                        <Button
                            variant={editor.isActive('bold') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                        >
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={editor.isActive('italic') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                        >
                            <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={editor.isActive('underline') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                        >
                            <UnderlineIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={editor.isActive('highlight') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHighlight().run()}
                        >
                            <Highlighter className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Headings */}
                    <div className="flex items-center space-x-1 mr-2 border-r pr-2">
                        <select
                            value={
                                editor.isActive('heading', { level: 1 }) ? 'h1' :
                                    editor.isActive('heading', { level: 2 }) ? 'h2' :
                                        editor.isActive('heading', { level: 3 }) ? 'h3' :
                                            'paragraph'
                            }
                            onChange={(e) => {
                                const value = e.target.value
                                if (value === 'paragraph') {
                                    editor.chain().focus().setParagraph().run()
                                } else {
                                    const level = parseInt(value.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6
                                    editor.chain().focus().toggleHeading({ level }).run()
                                }
                            }}
                            className="text-sm border rounded px-2 py-1"
                        >
                            <option value="paragraph">Обычный текст</option>
                            <option value="h1">Заголовок 1</option>
                            <option value="h2">Заголовок 2</option>
                            <option value="h3">Заголовок 3</option>
                        </select>
                    </div>

                    {/* Alignment */}
                    <div className="flex items-center space-x-1 mr-2 border-r pr-2">
                        <Button
                            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        >
                            <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        >
                            <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        >
                            <AlignRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Lists */}
                    <div className="flex items-center space-x-1 mr-2 border-r pr-2">
                        <Button
                            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        >
                            <ListOrdered className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        >
                            <Quote className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Color picker */}
                    <div className="flex items-center space-x-1">
                        <input
                            type="color"
                            onInput={(e) => {
                                const target = e.target as HTMLInputElement
                                editor.chain().focus().setColor(target.value).run()
                            }}
                            value={editor.getAttributes('textStyle').color || '#000000'}
                            className="w-8 h-8 border rounded cursor-pointer"
                            title="Цвет текста"
                        />
                        <input
                            type="color"
                            onInput={(e) => {
                                const target = e.target as HTMLInputElement
                                editor.chain().focus().toggleHighlight({ color: target.value }).run()
                            }}
                            className="w-8 h-8 border rounded cursor-pointer"
                            title="Цвет выделения"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
                <div className="h-full border rounded-md">
                    <EditorContent
                        editor={editor}
                        className="h-full overflow-auto"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
