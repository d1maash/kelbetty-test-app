export interface Document {
    id: string
    title: string
    content: string
    fileName?: string | null
    fileType?: string | null
    fileSize?: number | null
    originalUrl?: string | null
    filePath?: string | null        // Путь к оригинальному файлу
    thumbnailPath?: string | null   // Путь к превью файла
    htmlContent?: string | null     // HTML версия для редактирования
    detectedType?: string | null    // Автоматически определенный тип документа
    mimeType?: string | null        // MIME тип файла
    createdAt: Date | string
    updatedAt: Date | string
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
