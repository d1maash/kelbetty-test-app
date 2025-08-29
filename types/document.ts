export interface Document {
    id: string
    title: string
    content: string
    fileName?: string | null
    fileType?: string | null
    fileSize?: number | null
    originalUrl?: string | null
    createdAt: Date
    updatedAt: Date
    userId: string
    style?: DocumentStyle | null
}

export interface DocumentStyle {
    id: string
    documentType: string
    formattingStyle: string
    writingTone: string
    keyElements: any // JSON field
    documentId: string
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
