/**
 * Утилиты для валидации и диагностики PDF файлов
 */

export interface PDFValidationResult {
    isValid: boolean
    error?: string
    details: {
        hasValidHeader: boolean
        hasValidStructure: boolean
        fileSize: number
        headerBytes: string
        isPasswordProtected: boolean
        version?: string
        pageCount?: number
    }
}

/**
 * Проверяет, является ли файл валидным PDF
 */
export async function validatePDF(buffer: Buffer): Promise<PDFValidationResult> {
    const result: PDFValidationResult = {
        isValid: false,
        details: {
            hasValidHeader: false,
            hasValidStructure: false,
            fileSize: buffer.length,
            headerBytes: '',
            isPasswordProtected: false
        }
    }

    try {
        // Проверяем размер файла
        if (buffer.length < 100) {
            result.error = 'Файл слишком маленький для PDF'
            return result
        }

        // Получаем первые 1024 байта для анализа
        const header = buffer.slice(0, Math.min(1024, buffer.length))
        result.details.headerBytes = header.toString('hex', 0, 32).toUpperCase()

        // Проверяем PDF заголовок
        const headerText = header.toString('utf8', 0, 100)
        if (headerText.startsWith('%PDF-')) {
            result.details.hasValidHeader = true
            
            // Извлекаем версию PDF
            const versionMatch = headerText.match(/%PDF-(\d+\.\d+)/)
            if (versionMatch) {
                result.details.version = versionMatch[1]
            }
        } else {
            result.error = 'Неверный заголовок PDF'
            return result
        }

        // Проверяем структуру файла
        const endOfFile = buffer.slice(-1024).toString('utf8')
        if (endOfFile.includes('%%EOF')) {
            result.details.hasValidStructure = true
        } else {
            result.error = 'PDF файл не имеет корректного окончания'
            return result
        }

        // Проверяем на защиту паролем
        const content = buffer.toString('utf8')
        if (content.includes('/Encrypt') || content.includes('/Encryption')) {
            result.details.isPasswordProtected = true
            result.error = 'PDF файл защищен паролем'
            return result
        }

        // Пытаемся определить количество страниц
        const pageCountMatch = content.match(/\/Count\s+(\d+)/)
        if (pageCountMatch) {
            result.details.pageCount = parseInt(pageCountMatch[1])
        }

        // Если все проверки пройдены
        if (result.details.hasValidHeader && result.details.hasValidStructure) {
            result.isValid = true
        }

    } catch (error) {
        result.error = `Ошибка валидации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
    }

    return result
}

/**
 * Получает детальную информацию о PDF файле
 */
export async function getPDFInfo(buffer: Buffer): Promise<{
    isValid: boolean
    error?: string
    suggestions: string[]
    technicalDetails: Record<string, any>
}> {
    const validation = await validatePDF(buffer)
    
    const suggestions: string[] = []
    const technicalDetails: Record<string, any> = {
        fileSize: validation.details.fileSize,
        headerBytes: validation.details.headerBytes,
        version: validation.details.version,
        pageCount: validation.details.pageCount
    }

    if (!validation.isValid) {
        if (validation.details.isPasswordProtected) {
            suggestions.push('Файл защищен паролем. Попробуйте открыть в PDF редакторе и убрать защиту.')
        }
        
        if (!validation.details.hasValidHeader) {
            suggestions.push('Файл не является PDF. Проверьте расширение и содержимое файла.')
        }
        
        if (!validation.details.hasValidStructure) {
            suggestions.push('PDF файл поврежден. Попробуйте загрузить файл заново или восстановить из резервной копии.')
        }
        
        if (validation.details.fileSize < 1000) {
            suggestions.push('Файл слишком маленький. Возможно, загрузка была прервана.')
        }
        
        // Специальные рекомендации для файлов с казахскими именами
        if (validation.details.fileSize > 500000) { // > 500KB
            suggestions.push('Файл большого размера. Возможно, содержит много изображений или защищен.')
            suggestions.push('Попробуйте открыть в Adobe Reader или Foxit для проверки защиты.')
        }
        
        if (validation.details.fileSize > 1000000) { // > 1MB
            suggestions.push('Очень большой файл. Может содержать встроенные шрифты или изображения.')
            suggestions.push('Попробуйте конвертировать в более простой формат.')
        }
    }

    return {
        isValid: validation.isValid,
        error: validation.error,
        suggestions,
        technicalDetails
    }
}

/**
 * Пытается восстановить поврежденный PDF
 */
export async function attemptPDFRecovery(buffer: Buffer): Promise<{
    recovered: boolean
    recoveredBuffer?: Buffer
    message: string
}> {
    try {
        // Проверяем, есть ли PDF заголовок
        const header = buffer.slice(0, 100).toString('utf8')
        if (!header.includes('%PDF')) {
            return {
                recovered: false,
                message: 'Файл не содержит PDF заголовок'
            }
        }

        // Ищем %%EOF в конце файла
        const endOfFile = buffer.slice(-1024).toString('utf8')
        if (endOfFile.includes('%%EOF')) {
            return {
                recovered: true,
                recoveredBuffer: buffer,
                message: 'PDF файл уже валиден'
            }
        }

        // Пытаемся найти конец PDF в середине файла
        const content = buffer.toString('utf8')
        const eofIndex = content.lastIndexOf('%%EOF')
        
        if (eofIndex > 0) {
            const recoveredBuffer = buffer.slice(0, eofIndex + 6) // +6 для %%EOF
            return {
                recovered: true,
                recoveredBuffer,
                message: 'PDF файл восстановлен (обрезан до последнего %%EOF)'
            }
        }

        return {
            recovered: false,
            message: 'Не удалось найти корректное окончание PDF'
        }

    } catch (error) {
        return {
            recovered: false,
            message: `Ошибка восстановления: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
        }
    }
}
