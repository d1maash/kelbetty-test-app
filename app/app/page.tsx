"use client"

import { useState, useEffect } from 'react'
import { useAuth, UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { DocumentEditor } from '@/components/document/document-editor'
import { AIChat } from '@/components/document/ai-chat'
import { DocumentList } from '@/components/document/document-list'
import { Document } from '@/types/document'
import { FileText } from 'lucide-react'
import Link from 'next/link'

// Mock data for demo
const mockDocuments: Document[] = [
    {
        id: '1',
        title: 'Деловое письмо',
        content: `Уважаемый г-н Петров,

Благодарим Вас за интерес к нашей компании и предоставленное коммерческое предложение.

После тщательного рассмотрения Вашего предложения, мы готовы обсудить условия сотрудничества. Особенно нас заинтересовали следующие аспекты:

1. Качество предоставляемых услуг
2. Гибкость в ценообразовании
3. Сроки выполнения работ

Предлагаем назначить встречу для обсуждения деталей на следующей неделе. Пожалуйста, сообщите удобное для Вас время.

С уважением,
Анна Иванова
Менеджер по закупкам`,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        userId: 'user1'
    },
    {
        id: '2',
        title: 'Отчет о проделанной работе',
        content: `# Отчет о работе за январь 2024

## Основные достижения

В январе 2024 года были достигнуты следующие результаты:

- Завершено 15 проектов
- Привлечено 8 новых клиентов
- Увеличена выручка на 23%

## Проблемы и решения

### Проблема 1: Задержки в поставках
**Решение:** Найден новый поставщик с более надежными сроками.

### Проблема 2: Нехватка персонала
**Решение:** Запущен процесс найма дополнительных сотрудников.

## Планы на февраль

1. Запуск нового продукта
2. Расширение команды
3. Улучшение процессов`,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22'),
        userId: 'user1'
    }
]

export default function AppPage() {
    const { isSignedIn, isLoaded } = useAuth()
    const [documents, setDocuments] = useState<Document[]>(mockDocuments)
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
    const [documentContent, setDocumentContent] = useState('')

    useEffect(() => {
        if (selectedDocument) {
            setDocumentContent(selectedDocument.content)
        }
    }, [selectedDocument])

    // Redirect to sign-in if not authenticated
    if (isLoaded && !isSignedIn) {
        redirect('/sign-in')
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p>Загрузка...</p>
                </div>
            </div>
        )
    }

    const handleCreateDocument = () => {
        const newDocument: Document = {
            id: Date.now().toString(),
            title: `Новый документ ${documents.length + 1}`,
            content: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 'user1'
        }

        setDocuments(prev => [newDocument, ...prev])
        setSelectedDocument(newDocument)
    }

    const handleSelectDocument = (document: Document) => {
        setSelectedDocument(document)
    }

    const handleDeleteDocument = (documentId: string) => {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
        if (selectedDocument?.id === documentId) {
            setSelectedDocument(null)
            setDocumentContent('')
        }
    }

    const handleContentChange = (content: string) => {
        setDocumentContent(content)
        if (selectedDocument) {
            setDocuments(prev =>
                prev.map(doc =>
                    doc.id === selectedDocument.id
                        ? { ...doc, content, updatedAt: new Date() }
                        : doc
                )
            )
        }
    }

    const handleSaveDocument = async (content: string) => {
        if (!selectedDocument) return

        // Update document in state
        setDocuments(prev =>
            prev.map(doc =>
                doc.id === selectedDocument.id
                    ? { ...doc, content, updatedAt: new Date() }
                    : doc
            )
        )

        // Here you would typically save to a backend
        console.log('Document saved:', { id: selectedDocument.id, content })
    }

    const handleAIEdit = async (instruction: string) => {
        if (!selectedDocument) return

        try {
            // Mock AI edit - in real app, this would call the Gemini API
            await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API delay

            // For demo purposes, we'll just add a note
            const editedContent = documentContent + `\n\n[ИИ правка: ${instruction}]`
            handleContentChange(editedContent)

        } catch (error) {
            console.error('AI edit error:', error)
            throw error
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <span className="hidden font-bold sm:inline-block">KelBetty</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
                <div className="grid grid-cols-12 gap-4 h-full">
                    {/* Document List */}
                    <div className="col-span-12 lg:col-span-3">
                        <DocumentList
                            documents={documents}
                            selectedDocumentId={selectedDocument?.id}
                            onSelectDocument={handleSelectDocument}
                            onCreateDocument={handleCreateDocument}
                            onDeleteDocument={handleDeleteDocument}
                        />
                    </div>

                    {/* Document Editor */}
                    <div className="col-span-12 lg:col-span-6">
                        {selectedDocument ? (
                            <DocumentEditor
                                key={selectedDocument.id}
                                initialContent={selectedDocument.content}
                                onContentChange={handleContentChange}
                                onSave={handleSaveDocument}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                <div className="text-center text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium mb-2">Выберите документ</p>
                                    <p className="text-sm">
                                        Выберите документ из списка или создайте новый, чтобы начать редактирование
                                    </p>
                                    <Button
                                        onClick={handleCreateDocument}
                                        className="mt-4"
                                        variant="gradient"
                                    >
                                        Создать документ
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Chat */}
                    <div className="col-span-12 lg:col-span-3">
                        <AIChat
                            onApplyEdit={selectedDocument ? handleAIEdit : undefined}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
