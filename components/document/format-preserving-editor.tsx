'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
    Save, 
    Download, 
    Eye, 
    Undo, 
    Redo, 
    Search, 
    Replace,
    FileText,
    Code,
    Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Динамический импорт Monaco Editor для избежания SSR проблем
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { 
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-muted-foreground">Загрузка редактора...</span>
        </div>
    )
})

interface FormatPreservingEditorProps {
    document: any
    onContentChange?: (content: string) => void
    onSave?: (content: string) => void
    onFinishEditing?: () => void
    className?: string
}

export function FormatPreservingEditor({
    document,
    onContentChange,
    onSave,
    onFinishEditing,
    className
}: FormatPreservingEditorProps) {
    const [content, setContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [editorLanguage, setEditorLanguage] = useState('plaintext')
    const [showSearch, setShowSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [replaceQuery, setReplaceQuery] = useState('')
    const editorRef = useRef<any>(null)

    useEffect(() => {
        if (document) {
            setContent(document.content || '')
            setEditorLanguage(getLanguageFromFileType(document.fileType))
        }
    }, [document])

    const getLanguageFromFileType = (fileType?: string) => {
        if (!fileType) return 'plaintext'
        
        if (fileType.includes('word') || fileType.includes('docx')) return 'markdown'
        if (fileType.includes('excel') || fileType.includes('xlsx')) return 'csv'
        if (fileType.includes('presentation') || fileType.includes('pptx')) return 'markdown'
        if (fileType.includes('pdf')) return 'plaintext'
        if (fileType.includes('txt')) return 'plaintext'
        
        return 'plaintext'
    }

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor
        
        // Настройка горячих клавиш
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            handleSave()
        })
        
        // Настройка поиска
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
            setShowSearch(true)
            editor.trigger('keyboard', 'actions.find', {})
        })
    }

    const handleContentChange = (value: string | undefined) => {
        const newContent = value || ''
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

    const handleDownload = () => {
        const element = document.createElement('a')
        const file = new Blob([content], { type: 'text/plain;charset=utf-8' })
        element.href = URL.createObjectURL(file)
        element.download = document?.fileName || 'document.txt'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    const handleUndo = () => {
        if (editorRef.current) {
            editorRef.current.trigger('keyboard', 'undo', {})
        }
    }

    const handleRedo = () => {
        if (editorRef.current) {
            editorRef.current.trigger('keyboard', 'redo', {})
        }
    }

    const handleFind = () => {
        if (editorRef.current && searchQuery) {
            editorRef.current.trigger('keyboard', 'actions.find', {})
            editorRef.current.trigger('keyboard', 'editor.actions.findWithArgs', {
                searchString: searchQuery,
                replaceString: replaceQuery,
                isRegex: false,
                isCaseSensitive: false,
                isWholeWord: false
            })
        }
    }

    const handleReplace = () => {
        if (editorRef.current && searchQuery && replaceQuery) {
            editorRef.current.trigger('keyboard', 'editor.actions.replace', {
                searchString: searchQuery,
                replaceString: replaceQuery,
                isRegex: false,
                isCaseSensitive: false,
                isWholeWord: false
            })
        }
    }

    const handleReplaceAll = () => {
        if (editorRef.current && searchQuery && replaceQuery) {
            editorRef.current.trigger('keyboard', 'editor.actions.replaceAll', {
                searchString: searchQuery,
                replaceString: replaceQuery,
                isRegex: false,
                isCaseSensitive: false,
                isWholeWord: false
            })
        }
    }

    if (!document) {
        return (
            <Card className={cn("h-full flex flex-col", className)}>
                <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                        <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>Выберите документ для редактирования</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div>
                            <CardTitle className="text-lg">Редактор документа</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary">
                                    {document.fileType ? getLanguageFromFileType(document.fileType).toUpperCase() : 'ТЕКСТ'}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    {document.fileName || 'Без названия'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSearch(!showSearch)}
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Поиск
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUndo}
                        >
                            <Undo className="h-4 w-4 mr-2" />
                            Отменить
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRedo}
                        >
                            <Redo className="h-4 w-4 mr-2" />
                            Повторить
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
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

                {/* Панель поиска и замены */}
                {showSearch && (
                    <div className="flex items-center space-x-2 pt-3 border-t">
                        <input
                            type="text"
                            placeholder="Найти..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Заменить на..."
                            value={replaceQuery}
                            onChange={(e) => setReplaceQuery(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleFind}
                        >
                            Найти
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReplace}
                        >
                            Заменить
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReplaceAll}
                        >
                            Заменить все
                        </Button>
                    </div>
                )}
            </CardHeader>

            <CardContent className="flex-1 p-0">
                <MonacoEditor
                    height="100%"
                    language={editorLanguage}
                    value={content}
                    onChange={handleContentChange}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        readOnly: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                        theme: 'vs-dark',
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: 'on',
                        tabCompletion: 'on',
                        wordBasedSuggestions: 'on',
                        parameterHints: {
                            enabled: true
                        },
                        autoIndent: 'full',
                        formatOnPaste: true,
                        formatOnType: true,
                        folding: true,
                        foldingStrategy: 'indentation',
                        showFoldingControls: 'always',
                        unfoldOnClickAfterEnd: false,
                        links: true,
                        colorDecorators: true,
                        lightbulb: {
                            enabled: true
                        }
                    }}
                />
            </CardContent>
        </Card>
    )
}
