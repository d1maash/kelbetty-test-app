// Серверные парсеры - используются только в API routes
export async function parseWordDocument(buffer: Buffer): Promise<string> {
    const mammoth = await import('mammoth')
    try {
        const result = await mammoth.extractRawText({ buffer })
        return result.value
    } catch (error) {
        console.error('Error parsing Word document:', error)
        throw new Error('Ошибка при обработке Word документа')
    }
}

export async function parsePowerPointDocument(buffer: Buffer): Promise<string> {
    const XLSX = await import('xlsx')
    try {
        // For PowerPoint, we'll use a simplified approach
        // In production, you might want to use a more specialized library
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        let text = ''

        workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName]
            const sheetText = XLSX.utils.sheet_to_txt(sheet)
            text += sheetText + '\n'
        })

        return text
    } catch (error) {
        console.error('Error parsing PowerPoint document:', error)
        throw new Error('Ошибка при обработке PowerPoint документа')
    }
}

export async function parseExcelDocument(buffer: Buffer): Promise<string> {
    const XLSX = await import('xlsx')
    try {
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        let text = ''

        workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName]
            const sheetText = XLSX.utils.sheet_to_txt(sheet)
            text += `Лист "${sheetName}":\n${sheetText}\n\n`
        })

        return text
    } catch (error) {
        console.error('Error parsing Excel document:', error)
        throw new Error('Ошибка при обработке Excel документа')
    }
}

export async function parsePdfDocument(buffer: Buffer): Promise<string> {
    const pdfParse = await import('pdf-parse')
    try {
        const data = await pdfParse.default(buffer)
        return data.text
    } catch (error) {
        console.error('Error parsing PDF document:', error)
        throw new Error('Ошибка при обработке PDF документа')
    }
}

export async function parseFile(buffer: Buffer, fileType: string, fileName: string): Promise<string> {
    const extension = fileName.split('.').pop()?.toLowerCase()

    switch (extension) {
        case 'docx':
        case 'doc':
            return await parseWordDocument(buffer)

        case 'pptx':
        case 'ppt':
            return await parsePowerPointDocument(buffer)

        case 'xlsx':
        case 'xls':
            return await parseExcelDocument(buffer)

        case 'pdf':
            return await parsePdfDocument(buffer)

        case 'txt':
            return buffer.toString('utf-8')

        default:
            throw new Error(`Неподдерживаемый формат файла: ${extension}`)
    }
}

// Функции getSupportedFileTypes и isFileTypeSupported перенесены в lib/file-utils.ts
