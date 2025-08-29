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
    Loader2
} from 'lucide-react'
import { ChatMessage } from '@/types/document'
import { cn } from '@/lib/utils'

interface AIChatProps {
    onApplyEdit?: (instruction: string) => Promise<void>
    className?: string
}

export function AIChat({ onApplyEdit, className }: AIChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            content: 'Привет! Я помогу вам отредактировать документ. Просто опишите, что нужно изменить, и я сохраню ваш стиль форматирования.',
            isUser: false,
            timestamp: new Date()
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!inputValue.trim() || isProcessing) return

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: inputValue,
            isUser: true,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsProcessing(true)

        try {
            // Apply the edit
            if (onApplyEdit) {
                await onApplyEdit(inputValue)
            }

            // Add AI response
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: 'Готово! Я внес изменения в документ, сохранив ваш стиль форматирования. Проверьте результат и дайте знать, если нужны дополнительные правки.',
                isUser: false,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, aiMessage])
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.',
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
        "Исправить грамматику"
    ]

    const handleSuggestionClick = (prompt: string) => {
        setInputValue(prompt)
    }

    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                    ИИ Помощник
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex items-start space-x-3",
                                    message.isUser ? "justify-end" : "justify-start"
                                )}
                            >
                                {!message.isUser && (
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                )}

                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-lg p-3 text-sm",
                                        message.isUser
                                            ? "bg-blue-600 text-white ml-auto"
                                            : "bg-muted"
                                    )}
                                >
                                    {message.content}
                                </div>

                                {message.isUser && (
                                    <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isProcessing && (
                            <div className="flex items-start space-x-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                                </div>
                                <div className="bg-muted rounded-lg p-3 text-sm">
                                    Обрабатываю ваш запрос...
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Suggestions */}
                {messages.length === 1 && (
                    <div className="p-4 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Попробуйте:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestionPrompts.map((prompt, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSuggestionClick(prompt)}
                                    className="text-xs"
                                >
                                    {prompt}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="p-4 border-t">
                    <div className="flex space-x-2">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Опишите, что нужно изменить в документе..."
                            disabled={isProcessing}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isProcessing}
                            size="icon"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
