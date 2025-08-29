export interface Document {
    id: string
    title: string
    content: string
    createdAt: Date
    updatedAt: Date
    userId: string
    style?: DocumentStyle
}

export interface DocumentStyle {
    documentType: string
    formattingStyle: string
    writingTone: string
    keyElements: string[]
}

export interface ChatMessage {
    id: string
    content: string
    isUser: boolean
    timestamp: Date
}

export interface AIEditRequest {
    instruction: string
    documentContent: string
    preserveStyle: boolean
}
