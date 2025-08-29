"use client"

import { useState, useEffect } from 'react'
import { useAuth, UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { DocumentEditor } from '@/components/document/document-editor'
import { AIChat } from '@/components/document/ai-chat'
import { DocumentList } from '@/components/document/document-list'
import { FileUpload } from '@/components/document/file-upload'
import { Document } from '@/types/document'
import { FileText, Upload } from 'lucide-react'
import Link from 'next/link'

export default function AppPage() {
    const { isSignedIn, isLoaded } = useAuth()
    const [documents, setDocuments] = useState<Document[]>([])
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
    const [documentContent, setDocumentContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [showUpload, setShowUpload] = useState(false)

    // Load documents from API
    useEffect(() => {
        if (isSignedIn) {
            loadDocuments()
        }
    }, [isSignedIn])

    useEffect(() => {
        if (selectedDocument) {
            setDocumentContent(selectedDocument.content)
        }
    }, [selectedDocument])

      const loadDocuments = async () => {
    try {
      console.log('Загружаем документы...')
      const response = await fetch('/api/documents')
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Документы загружены:', data.documents?.length || 0)
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Failed to load documents:', error)
      // Можно добавить toast уведомление об ошибке
    } finally {
      setLoading(false)
    }
  }

    // Redirect to sign-in if not authenticated
    if (isLoaded && !isSignedIn) {
        redirect('/sign-in')
    }

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p>Загрузка...</p>
                </div>
            </div>
        )
    }

    const handleCreateDocument = async () => {
        try {
            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: `Новый документ ${documents.length + 1}`,
                    content: '',
                }),
            })

            if (response.ok) {
                const data = await response.json()
                const newDocument = data.document
                setDocuments(prev => [newDocument, ...prev])
                setSelectedDocument(newDocument)
            }
        } catch (error) {
            console.error('Failed to create document:', error)
        }
    }

    const handleSelectDocument = (document: Document) => {
        setSelectedDocument(document)
    }

    const handleDeleteDocument = async (documentId: string) => {
        try {
            const response = await fetch(`/api/documents/${documentId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setDocuments(prev => prev.filter(doc => doc.id !== documentId))
                if (selectedDocument?.id === documentId) {
                    setSelectedDocument(null)
                    setDocumentContent('')
                }
            }
        } catch (error) {
            console.error('Failed to delete document:', error)
        }
    }

    const handleContentChange = (content: string) => {
        setDocumentContent(content)
        if (selectedDocument) {
            setSelectedDocument(prev => prev ? { ...prev, content } : null)
        }
    }

    const handleSaveDocument = async (content: string) => {
        if (!selectedDocument) return

        try {
            const response = await fetch(`/api/documents/${selectedDocument.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: selectedDocument.title,
                    content,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                const updatedDocument = data.document

                // Update document in state
                setDocuments(prev =>
                    prev.map(doc =>
                        doc.id === selectedDocument.id ? updatedDocument : doc
                    )
                )
                setSelectedDocument(updatedDocument)
            }
        } catch (error) {
            console.error('Failed to save document:', error)
        }
    }

    const handleFileUploaded = (document: any) => {
        setDocuments(prev => [document, ...prev])
        setSelectedDocument(document)
        setShowUpload(false)
    }

    const handleAIEdit = async (instruction: string) => {
        if (!selectedDocument || !documentContent.trim()) {
            throw new Error('Документ пуст. Добавьте текст для редактирования.')
        }

        try {
            const response = await fetch('/api/ai/edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instruction,
                    documentContent,
                    preserveStyle: true,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Ошибка при обработке запроса')
            }

            const data = await response.json()
            handleContentChange(data.editedContent)

            // Auto-save after AI edit
            await handleSaveDocument(data.editedContent)

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
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowUpload(!showUpload)}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Загрузить файл
                        </Button>
                        <ThemeToggle />
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
                {showUpload ? (
                    <div className="grid grid-cols-12 gap-4 h-full">
                        <div className="col-span-12 lg:col-span-8">
                            <FileUpload onFileUploaded={handleFileUploaded} />
                        </div>
                        <div className="col-span-12 lg:col-span-4">
                            <DocumentList
                                documents={documents}
                                selectedDocumentId={selectedDocument?.id}
                                onSelectDocument={handleSelectDocument}
                                onCreateDocument={handleCreateDocument}
                                onDeleteDocument={handleDeleteDocument}
                            />
                        </div>
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    )
}
