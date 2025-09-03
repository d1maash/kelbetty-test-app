"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Send,
    Sparkles,
    User,
    Bot,
    Loader2,
    Copy,
    Check,
    MessageSquare,
    Zap,
    RefreshCw
} from 'lucide-react'
import { ChatMessage } from '@/types/document'
import { cn } from '@/lib/utils'

interface AIChatProps {
    onApplyEdit?: (instruction: string) => Promise<void>
    className?: string
    documentContent?: string
}

export function AIChat({ onApplyEdit, className, documentContent }: AIChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            content: 'Привет! Я автоматически улучшаю ваши документы. Просто скажите, что нужно сделать, и я отредактирую документ и дам полезные советы. Загрузите документ и начнем работать!',
            isUser: false,
            timestamp: new Date()
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const copyToClipboard = async (text: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedMessageId(messageId)
            setTimeout(() => setCopiedMessageId(null), 2000)
        } catch (error) {
            console.error('Failed to copy text:', error)
        }
    }

    const simulateTyping = (text: string, callback: (text: string) => void) => {
        let currentText = ''
        let index = 0
        const typeSpeed = 30 // миллисекунды между символами

        const typeInterval = setInterval(() => {
            if (index < text.length) {
                currentText += text[index]
                callback(currentText)
                index++
            } else {
                clearInterval(typeInterval)
                setIsTyping(false)
            }
        }, typeSpeed)
    }

    const handleStreamingResponse = async (messageText: string, aiMessageId: string, customPrompt?: string) => {
        try {
            const response = await fetch('/api/ai/chat-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: customPrompt || messageText,
                    context: documentContent,
                    conversationHistory: messages.slice(-6)
                }),
            })

            if (!response.ok) {
                throw new Error('Ошибка API стриминга')
            }

            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error('Не удалось получить стрим')
            }

            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    setIsTyping(false)
                    break
                }

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')

                // Обрабатываем все полные строки
                for (let i = 0; i < lines.length - 1; i++) {
                    const line = lines[i].trim()
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))

                            if (data.error) {
                                throw new Error(data.error)
                            }

                            if (data.content) {
                                setMessages(prev =>
                                    prev.map(msg =>
                                        msg.id === aiMessageId
                                            ? { ...msg, content: data.content }
                                            : msg
                                    )
                                )
                            }
                        } catch (parseError) {
                            console.error('Ошибка парсинга стрима:', parseError)
                        }
                    }
                }

                // Сохраняем неполную строку в буфере
                buffer = lines[lines.length - 1]
            }
        } catch (error) {
            console.error('Streaming error:', error)
            setIsTyping(false)
            throw error
        }
    }

    const handleEditAdvice = async (messageText: string, aiMessageId: string) => {
        const advicePrompt = `Я только что отредактировал документ согласно запросу: "${messageText}". 
        
Дай короткий (1-2 предложения) полезный ответ о том:
1. Что было изменено
2. Один практический совет по улучшению

Отвечай дружелюбно и профессионально на русском языке.`

        await handleStreamingResponse(messageText, aiMessageId, advicePrompt)
    }

    const handleSimpleChat = async (messageText: string, aiMessageId: string) => {
        const chatPrompt = `Пользователь пишет: "${messageText}"
        
У пользователя пока нет загруженного документа. Дай короткий полезный ответ и предложи загрузить документ для работы с ним.`

        await handleStreamingResponse(messageText, aiMessageId, chatPrompt)
    }

    const handleSend = async () => {
        if (!inputValue.trim() || isProcessing) return

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: inputValue,
            isUser: true,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        const messageText = inputValue
        setInputValue('')
        setIsProcessing(true)
        setIsTyping(true)

        try {
            console.log('AI Chat Debug:', {
                hasOnApplyEdit: !!onApplyEdit,
                hasDocumentContent: !!documentContent,
                contentLength: documentContent?.length || 0
            })

            if (onApplyEdit && documentContent && documentContent.trim()) {
                console.log('Вызываем onApplyEdit с инструкцией:', messageText)

                // Всегда пытаемся отредактировать документ, если он есть
                await onApplyEdit(messageText)

                console.log('onApplyEdit выполнен успешно')

                // Получаем совет от ИИ о том, что было сделано
                const aiMessageId = (Date.now() + 1).toString()
                const aiMessage: ChatMessage = {
                    id: aiMessageId,
                    content: '',
                    isUser: false,
                    timestamp: new Date()
                }

                setMessages(prev => [...prev, aiMessage])

                // Получаем короткий ответ о редактировании
                await handleEditAdvice(messageText, aiMessageId)
            } else if (documentContent && documentContent.trim()) {
                console.log('Документ есть, но нет функции редактирования - даем советы')

                // Если нет функции редактирования, но есть документ - даем советы
                const aiMessageId = (Date.now() + 1).toString()
                const aiMessage: ChatMessage = {
                    id: aiMessageId,
                    content: '',
                    isUser: false,
                    timestamp: new Date()
                }

                setMessages(prev => [...prev, aiMessage])

                // Используем стриминговый ответ для анализа документа
                await handleStreamingResponse(messageText, aiMessageId)
            } else {
                console.log('Нет документа - обычный чат')

                // Нет документа - обычный чат
                const aiMessageId = (Date.now() + 1).toString()
                const aiMessage: ChatMessage = {
                    id: aiMessageId,
                    content: '',
                    isUser: false,
                    timestamp: new Date()
                }

                setMessages(prev => [...prev, aiMessage])

                // Простой ответ без контекста документа
                await handleSimpleChat(messageText, aiMessageId)
            }
        } catch (error) {
            console.error('AI Chat error:', error)
            setIsTyping(false)

            let errorText = 'Извините, произошла ошибка при обработке вашего запроса.'

            if (error instanceof Error) {
                if (error.message.includes('пуст')) {
                    errorText = 'Документ пуст. Добавьте текст для редактирования.'
                } else if (error.message.includes('Gemini') || error.message.includes('API')) {
                    errorText = 'Ошибка ИИ сервиса. Проверьте настройки API ключа.'
                } else {
                    errorText = error.message
                }
            }

            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: errorText,
                isUser: false,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsProcessing(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const suggestionPrompts = [
        "Сделать текст более формальным",
        "Улучшить читаемость",
        "Добавить заключение",
        "Исправить грамматику",
        "Упростить сложные предложения",
        "Добавить примеры",
        "Улучшить структуру",
        "Сделать более убедительным"
    ]

    const quickActions = [
        { icon: Zap, text: "Улучшить стиль", prompt: "Улучши стиль и читаемость документа" },
        { icon: RefreshCw, text: "Переписать", prompt: "Перепиши документ более профессионально и понятно" },
        { icon: MessageSquare, text: "Структура", prompt: "Улучши структуру и логику изложения" }
    ]

    const handleSuggestionClick = (prompt: string) => {
        setInputValue(prompt)
    }

    const formatTime = (timestamp: Date) => {
        return new Date(timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Card className={cn("h-full flex flex-col shadow-lg", className)}>
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-t-lg">
                <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mr-3">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        ИИ Помощник
                    </div>
                    {isTyping && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <div className="flex space-x-1 mr-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            печатает...
                        </div>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex items-start space-x-3 group animate-in slide-in-from-bottom-2 duration-300",
                                    message.isUser ? "justify-end" : "justify-start"
                                )}
                            >
                                {!message.isUser && (
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                )}

                                <div className="flex flex-col max-w-[80%]">
                                    <div
                                        className={cn(
                                            "rounded-lg p-3 text-sm shadow-sm relative",
                                            message.isUser
                                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto rounded-br-sm"
                                                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-sm"
                                        )}
                                    >
                                        <div className="whitespace-pre-wrap break-words">
                                            {message.content}
                                        </div>

                                        {!message.isUser && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 shadow-sm border"
                                                onClick={() => copyToClipboard(message.content, message.id)}
                                            >
                                                {copiedMessageId === message.id ? (
                                                    <Check className="h-3 w-3 text-green-600" />
                                                ) : (
                                                    <Copy className="h-3 w-3" />
                                                )}
                                            </Button>
                                        )}
                                    </div>

                                    <div className={cn(
                                        "text-xs text-muted-foreground mt-1 px-1",
                                        message.isUser ? "text-right" : "text-left"
                                    )}>
                                        {formatTime(message.timestamp)}
                                    </div>
                                </div>

                                {message.isUser && (
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center flex-shrink-0 shadow-md">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isProcessing && !isTyping && (
                            <div className="flex items-start space-x-3 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                                </div>
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm shadow-sm">
                                    <div className="flex items-center space-x-2">
                                        <span>Обрабатываю ваш запрос</span>
                                        <div className="flex space-x-1">
                                            <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
                                            <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Quick Actions */}
                {documentContent && messages.length <= 2 && (
                    <div className="p-4 border-t bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-xs text-muted-foreground mb-3 font-medium">Быстрые действия:</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {quickActions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSuggestionClick(action.prompt)}
                                    className="text-xs flex items-center space-x-1 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/20"
                                >
                                    <action.icon className="h-3 w-3" />
                                    <span>{action.text}</span>
                                </Button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Или попробуйте:</p>
                        <div className="flex flex-wrap gap-1">
                            {suggestionPrompts.slice(0, 4).map((prompt, index) => (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSuggestionClick(prompt)}
                                    className="text-xs h-7 px-2 hover:bg-white dark:hover:bg-gray-800"
                                >
                                    {prompt}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="p-4 border-t bg-white dark:bg-gray-950">
                    <div className="flex space-x-2">
                        <div className="flex-1 relative">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={documentContent ? "Опишите, как улучшить документ..." : "Сначала загрузите документ для редактирования"}
                                disabled={isProcessing}
                                className="pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {inputValue && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    {inputValue.length}/500
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isProcessing}
                            size="icon"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
