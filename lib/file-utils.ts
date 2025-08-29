// Клиентские утилиты для работы с файлами (без Node.js зависимостей)

export function getSupportedFileTypes(): string[] {
    return [
        '.doc', '.docx',     // Word
        '.ppt', '.pptx',     // PowerPoint
        '.xls', '.xlsx',     // Excel
        '.pdf',              // PDF
        '.txt'               // Text
    ]
}

export function isFileTypeSupported(fileName: string): boolean {
    const extension = '.' + fileName.split('.').pop()?.toLowerCase()
    return getSupportedFileTypes().includes(extension)
}

export function getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase()

    switch (extension) {
        case 'doc':
        case 'docx':
            return 'word'
        case 'xls':
        case 'xlsx':
            return 'excel'
        case 'ppt':
        case 'pptx':
            return 'powerpoint'
        case 'pdf':
            return 'pdf'
        case 'txt':
            return 'text'
        default:
            return 'file'
    }
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase()

    const mimeTypes: { [key: string]: string } = {
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'pdf': 'application/pdf',
        'txt': 'text/plain'
    }

    return mimeTypes[extension || ''] || 'application/octet-stream'
}
