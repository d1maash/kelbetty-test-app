import { parseFile } from './file-parsers'

export interface DocumentAnalysis {
    detectedType: string
    mimeType: string
    confidence: number
    metadata: Record<string, any>
    preview: string
    isReadable: boolean
}

export interface DocumentTypeInfo {
    type: string
    name: string
    description: string
    extensions: string[]
    mimeTypes: string[]
    icon: string
    viewer: string
    editor: string
}

// Определение поддерживаемых типов документов
export const SUPPORTED_DOCUMENT_TYPES: DocumentTypeInfo[] = [
    {
        type: 'pdf',
        name: 'PDF Document',
        description: 'Portable Document Format',
        extensions: ['pdf'],
        mimeTypes: ['application/pdf'],
        icon: 'FileImage',
        viewer: 'PDFViewer',
        editor: 'FormatPreservingEditor'
    },
    {
        type: 'word',
        name: 'Word Document',
        description: 'Microsoft Word Document',
        extensions: ['doc', 'docx'],
        mimeTypes: [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        icon: 'FileText',
        viewer: 'WordViewer',
        editor: 'FormatPreservingEditor'
    },
    {
        type: 'excel',
        name: 'Excel Spreadsheet',
        description: 'Microsoft Excel Spreadsheet',
        extensions: ['xls', 'xlsx'],
        mimeTypes: [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        icon: 'FileSpreadsheet',
        viewer: 'ExcelViewer',
        editor: 'FormatPreservingEditor'
    },
    {
        type: 'powerpoint',
        name: 'PowerPoint Presentation',
        description: 'Microsoft PowerPoint Presentation',
        extensions: ['ppt', 'pptx'],
        mimeTypes: [
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ],
        icon: 'Presentation',
        viewer: 'PowerPointViewer',
        editor: 'FormatPreservingEditor'
    },
    {
        type: 'text',
        name: 'Text Document',
        description: 'Plain Text Document',
        extensions: ['txt', 'md', 'rtf'],
        mimeTypes: [
            'text/plain',
            'text/markdown',
            'application/rtf'
        ],
        icon: 'FileText',
        viewer: 'TextViewer',
        editor: 'FormatPreservingEditor'
    },
    {
        type: 'code',
        name: 'Source Code',
        description: 'Programming Source Code',
        extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml'],
        mimeTypes: [
            'text/javascript',
            'text/typescript',
            'text/x-python',
            'text/x-java-source',
            'text/x-c++src',
            'text/x-csrc',
            'text/html',
            'text/css',
            'application/json',
            'application/xml'
        ],
        icon: 'Code',
        viewer: 'CodeViewer',
        editor: 'FormatPreservingEditor'
    },
    {
        type: 'image',
        name: 'Image File',
        description: 'Image Document',
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'],
        mimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/bmp',
            'image/svg+xml',
            'image/webp'
        ],
        icon: 'FileImage',
        viewer: 'ImageViewer',
        editor: 'FormatPreservingEditor'
    }
]

/**
 * Анализирует файл и определяет его тип
 */
export async function analyzeDocument(
    buffer: Buffer,
    fileName: string,
    mimeType?: string
): Promise<DocumentAnalysis> {
    const extension = fileName.split('.').pop()?.toLowerCase() || ''
    const fileSize = buffer.length
    
    // Анализ по расширению и MIME типу
    const typeByExtension = SUPPORTED_DOCUMENT_TYPES.find(type =>
        type.extensions.includes(extension)
    )
    
    const typeByMime = mimeType ? SUPPORTED_DOCUMENT_TYPES.find(type =>
        type.mimeTypes.includes(mimeType)
    ) : null
    
    // Определение типа с учетом приоритетов
    let detectedType = 'unknown'
    let confidence = 0
    let metadata: Record<string, any> = {}
    
    if (typeByExtension && typeByMime && typeByExtension.type === typeByMime.type) {
        // Полное совпадение
        detectedType = typeByExtension.type
        confidence = 0.95
    } else if (typeByExtension) {
        // По расширению
        detectedType = typeByExtension.type
        confidence = 0.85
    } else if (typeByMime) {
        // По MIME типу
        detectedType = typeByMime.type
        confidence = 0.80
    }
    
    // Дополнительный анализ содержимого для повышения точности
    try {
        const contentAnalysis = await analyzeContent(buffer, detectedType, extension)
        if (contentAnalysis.confidence > confidence) {
            detectedType = contentAnalysis.detectedType
            confidence = contentAnalysis.confidence
        }
        metadata = { ...metadata, ...contentAnalysis.metadata }
    } catch (error) {
        console.warn('Content analysis failed:', error)
    }
    
    // Генерация превью
    const preview = await generatePreview(buffer, detectedType, extension)
    
    return {
        detectedType,
        mimeType: mimeType || 'application/octet-stream',
        confidence,
        metadata: {
            ...metadata,
            extension,
            fileSize,
            fileName
        },
        preview,
        isReadable: confidence > 0.5
    }
}

/**
 * Анализирует содержимое файла для определения типа
 */
async function analyzeContent(
    buffer: Buffer,
    detectedType: string,
    extension: string
): Promise<{ detectedType: string; confidence: number; metadata: Record<string, any> }> {
    let confidence = 0.5
    let metadata: Record<string, any> = {}
    
    try {
        // Анализ заголовков файла
        const header = buffer.slice(0, 16).toString('hex').toUpperCase()
        
        // PDF
        if (header.startsWith('25504446')) {
            return { detectedType: 'pdf', confidence: 0.98, metadata: { header: 'PDF signature found' } }
        }
        
        // ZIP-based formats (DOCX, XLSX, PPTX)
        if (header.startsWith('504B0304') || header.startsWith('504B0506') || header.startsWith('504B0708')) {
            if (extension === 'docx') return { detectedType: 'word', confidence: 0.95, metadata: { format: 'Office Open XML' } }
            if (extension === 'xlsx') return { detectedType: 'excel', confidence: 0.95, metadata: { format: 'Office Open XML' } }
            if (extension === 'pptx') return { detectedType: 'powerpoint', confidence: 0.95, metadata: { format: 'Office Open XML' } }
        }
        
        // Office binary formats
        if (header.startsWith('D0CF11E0')) {
            if (extension === 'doc') return { detectedType: 'word', confidence: 0.90, metadata: { format: 'Office Binary' } }
            if (extension === 'xls') return { detectedType: 'excel', confidence: 0.90, metadata: { format: 'Office Binary' } }
            if (extension === 'ppt') return { detectedType: 'powerpoint', confidence: 0.90, metadata: { format: 'Office Binary' } }
        }
        
        // Text files
        if (detectedType === 'text' || detectedType === 'code') {
            const textContent = buffer.toString('utf8', 0, Math.min(1000, buffer.length))
            const isText = /^[\x00-\x7F\t\n\r\x0B\x0C]*$/.test(textContent)
            if (isText) {
                confidence = 0.90
                metadata = { 
                    encoding: 'UTF-8',
                    lineCount: textContent.split('\n').length,
                    hasBOM: buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF
                }
            }
        }
        
        // Image files
        if (detectedType === 'image') {
            if (header.startsWith('FFD8FF')) return { detectedType: 'image', confidence: 0.98, metadata: { format: 'JPEG' } }
            if (header.startsWith('89504E47')) return { detectedType: 'image', confidence: 0.98, metadata: { format: 'PNG' } }
            if (header.startsWith('47494638')) return { detectedType: 'image', confidence: 0.98, metadata: { format: 'GIF' } }
        }
        
    } catch (error) {
        console.warn('Header analysis failed:', error)
    }
    
    return { detectedType, confidence, metadata }
}

/**
 * Генерирует превью документа
 */
async function generatePreview(
    buffer: Buffer,
    detectedType: string,
    extension: string
): Promise<string> {
    try {
        switch (detectedType) {
            case 'pdf':
                return 'PDF документ - нажмите для просмотра'
            
            case 'word':
                try {
                    const mammoth = await import('mammoth')
                    const result = await mammoth.extractRawText({ buffer })
                    const text = result.value
                    return text.length > 200 ? text.substring(0, 200) + '...' : text
                } catch {
                    return 'Word документ - нажмите для просмотра'
                }
            
            case 'excel':
                try {
                    const XLSX = await import('xlsx')
                    const workbook = XLSX.read(buffer, { type: 'buffer' })
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
                    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
                    const preview = data.slice(0, 5).map(row => row.join(', ')).join('\n')
                    return preview.length > 200 ? preview.substring(0, 200) + '...' : preview
                } catch {
                    return 'Excel таблица - нажмите для просмотра'
                }
            
            case 'powerpoint':
                try {
                    const XLSX = await import('xlsx')
                    const workbook = XLSX.read(buffer, { type: 'buffer' })
                    const sheetNames = workbook.SheetNames
                    return `Презентация с ${sheetNames.length} слайдами - нажмите для просмотра`
                } catch {
                    return 'PowerPoint презентация - нажмите для просмотра'
                }
            
            case 'text':
            case 'code':
                const text = buffer.toString('utf8', 0, Math.min(500, buffer.length))
                return text.length > 200 ? text.substring(0, 200) + '...' : text
            
            case 'image':
                return 'Изображение - нажмите для просмотра'
            
            default:
                return 'Документ - нажмите для просмотра'
        }
    } catch (error) {
        console.warn('Preview generation failed:', error)
        return 'Документ - нажмите для просмотра'
    }
}

/**
 * Получает информацию о типе документа
 */
export function getDocumentTypeInfo(detectedType: string): DocumentTypeInfo | null {
    return SUPPORTED_DOCUMENT_TYPES.find(type => type.type === detectedType) || null
}

/**
 * Проверяет, поддерживается ли тип документа
 */
export function isDocumentTypeSupported(detectedType: string): boolean {
    return SUPPORTED_DOCUMENT_TYPES.some(type => type.type === detectedType)
}

/**
 * Получает рекомендуемый просмотрщик для типа документа
 */
export function getRecommendedViewer(detectedType: string): string {
    const typeInfo = getDocumentTypeInfo(detectedType)
    return typeInfo?.viewer || 'UniversalDocumentViewer'
}

/**
 * Получает рекомендуемый редактор для типа документа
 */
export function getRecommendedEditor(detectedType: string): string {
    const typeInfo = getDocumentTypeInfo(detectedType)
    return typeInfo?.editor || 'FormatPreservingEditor'
}
