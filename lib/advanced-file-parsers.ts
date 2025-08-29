import fs from 'fs'
import path from 'path'

/**
 * Расширенный парсер файлов, который сохраняет форматирование
 */

export interface ParsedDocument {
    content: string        // Текстовое содержимое
    htmlContent: string   // HTML версия с форматированием
    metadata: {
        title?: string
        author?: string
        pages?: number
        slides?: number
        sheets?: number
        [key: string]: any
    }
}

// Парсинг Word документов с сохранением форматирования
export async function parseWordDocument(buffer: Buffer, fileName: string): Promise<ParsedDocument> {
    try {
        const mammoth = await import('mammoth')

        // Извлекаем HTML с форматированием
        const htmlResult = await mammoth.convertToHtml({ buffer })
        const htmlContent = htmlResult.value

        // Извлекаем чистый текст
        const textResult = await mammoth.extractRawText({ buffer })
        const content = textResult.value || ''

        return {
            content,
            htmlContent: `
        <div class="word-document">
          <style>
            .word-document { 
              font-family: 'Times New Roman', serif; 
              line-height: 1.6; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              background: white;
            }
            .word-document p { margin-bottom: 12px; }
            .word-document h1, .word-document h2, .word-document h3 { 
              margin-top: 24px; 
              margin-bottom: 12px; 
            }
            .word-document table { 
              border-collapse: collapse; 
              width: 100%; 
              margin: 12px 0; 
            }
            .word-document td, .word-document th { 
              border: 1px solid #ccc; 
              padding: 8px; 
            }
          </style>
          ${htmlContent}
        </div>
      `,
            metadata: {
                title: fileName.replace(/\.[^/.]+$/, ''),
                type: 'word'
            }
        }
    } catch (error) {
        console.error('Error parsing Word document:', error)
        throw new Error('Ошибка при обработке Word документа')
    }
}

// Парсинг PowerPoint презентаций
export async function parsePowerPointDocument(buffer: Buffer, fileName: string): Promise<ParsedDocument> {
    try {
        const xlsx = await import('xlsx')

        // Читаем как бинарный файл
        const workbook = xlsx.read(buffer, { type: 'buffer' })
        let content = ''
        let htmlContent = '<div class="powerpoint-document">'

        htmlContent += `
      <style>
        .powerpoint-document { 
          font-family: 'Calibri', sans-serif; 
          background: #f5f5f5;
          padding: 20px;
        }
        .slide { 
          background: white; 
          margin: 20px auto; 
          padding: 40px; 
          max-width: 800px; 
          min-height: 500px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          border-radius: 8px;
          page-break-after: always;
        }
        .slide h1 { 
          font-size: 2.5em; 
          text-align: center; 
          margin-bottom: 30px; 
          color: #1f4e79;
        }
        .slide h2 { 
          font-size: 2em; 
          margin: 20px 0; 
          color: #2f5f8f;
        }
        .slide p { 
          font-size: 1.2em; 
          line-height: 1.8; 
          margin: 15px 0; 
        }
        .slide ul { 
          font-size: 1.2em; 
          line-height: 1.8; 
        }
      </style>
    `

        let slideCount = 0

        // Обрабатываем каждый лист как слайд
        workbook.SheetNames.forEach((sheetName, index) => {
            const sheet = workbook.Sheets[sheetName]
            const sheetData = xlsx.utils.sheet_to_txt(sheet)

            if (sheetData.trim()) {
                slideCount++
                content += `\n--- Слайд ${slideCount} ---\n${sheetData}\n`

                htmlContent += `
          <div class="slide">
            <h1>Слайд ${slideCount}</h1>
            ${sheetData.split('\n').map(line =>
                    line.trim() ? `<p>${line.trim()}</p>` : ''
                ).join('')}
          </div>
        `
            }
        })

        htmlContent += '</div>'

        return {
            content,
            htmlContent,
            metadata: {
                title: fileName.replace(/\.[^/.]+$/, ''),
                type: 'powerpoint',
                slides: slideCount
            }
        }
    } catch (error) {
        console.error('Error parsing PowerPoint document:', error)
        throw new Error('Ошибка при обработке PowerPoint документа')
    }
}

// Парсинг Excel документов
export async function parseExcelDocument(buffer: Buffer, fileName: string): Promise<ParsedDocument> {
    try {
        const xlsx = await import('xlsx')

        const workbook = xlsx.read(buffer, { type: 'buffer' })
        let content = ''
        let htmlContent = '<div class="excel-document">'

        htmlContent += `
      <style>
        .excel-document { 
          font-family: 'Calibri', sans-serif; 
          padding: 20px;
          background: white;
        }
        .excel-sheet { 
          margin: 20px 0; 
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        .sheet-title { 
          background: #4472c4; 
          color: white; 
          padding: 10px; 
          font-weight: bold; 
          font-size: 1.1em;
        }
        .excel-table { 
          width: 100%; 
          border-collapse: collapse; 
        }
        .excel-table th { 
          background: #d9e2f3; 
          padding: 8px; 
          border: 1px solid #b4c6e7; 
          font-weight: bold;
          text-align: left;
        }
        .excel-table td { 
          padding: 8px; 
          border: 1px solid #d9d9d9; 
        }
        .excel-table tr:nth-child(even) { 
          background: #f8f9fa; 
        }
      </style>
    `

        workbook.SheetNames.forEach((sheetName, index) => {
            const sheet = workbook.Sheets[sheetName]
            const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 })

            content += `\n--- Лист: ${sheetName} ---\n`

            htmlContent += `
        <div class="excel-sheet">
          <div class="sheet-title">${sheetName}</div>
          <table class="excel-table">
      `

            if (jsonData.length > 0) {
                // Заголовки
                const headers = jsonData[0] as any[]
                if (headers && headers.length > 0) {
                    htmlContent += '<thead><tr>'
                    headers.forEach(header => {
                        htmlContent += `<th>${header || ''}</th>`
                        content += `${header || ''}\t`
                    })
                    htmlContent += '</tr></thead>'
                    content += '\n'
                }

                // Данные
                htmlContent += '<tbody>'
                for (let i = 1; i < Math.min(jsonData.length, 100); i++) { // Ограничиваем 100 строками
                    const row = jsonData[i] as any[]
                    if (row && row.length > 0) {
                        htmlContent += '<tr>'
                        row.forEach(cell => {
                            htmlContent += `<td>${cell || ''}</td>`
                            content += `${cell || ''}\t`
                        })
                        htmlContent += '</tr>'
                        content += '\n'
                    }
                }
                htmlContent += '</tbody>'
            }

            htmlContent += '</table></div>'
        })

        htmlContent += '</div>'

        return {
            content,
            htmlContent,
            metadata: {
                title: fileName.replace(/\.[^/.]+$/, ''),
                type: 'excel',
                sheets: workbook.SheetNames.length
            }
        }
    } catch (error) {
        console.error('Error parsing Excel document:', error)
        throw new Error('Ошибка при обработке Excel документа')
    }
}

// Парсинг PDF документов
export async function parsePdfDocument(buffer: Buffer, fileName: string): Promise<ParsedDocument> {
    try {
        console.log('Начинаем парсинг PDF:', fileName)
        const pdfParse = await import('pdf-parse')

        console.log('PDF-parse импортирован, размер буфера:', buffer.length)
        const data = await pdfParse.default(buffer)
        console.log('PDF успешно обработан, страниц:', data.numpages, 'символов:', data.text?.length || 0)

        const content = data.text || 'PDF документ не содержит текста или не может быть прочитан'

        // Создаем HTML версию с базовым форматированием
        const htmlContent = `
      <div class="pdf-document">
        <style>
          .pdf-document { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: white;
            border: 1px solid #ddd;
          }
          .pdf-page { 
            margin-bottom: 40px; 
            padding: 20px 0; 
            border-bottom: 1px solid #eee; 
          }
          .pdf-page:last-child { 
            border-bottom: none; 
          }
          .pdf-document p { 
            margin-bottom: 12px; 
            text-align: justify; 
          }
          .pdf-info {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
            font-size: 0.9em;
            color: #666;
          }
        </style>
        <div class="pdf-info">
          📄 PDF документ: ${fileName} | Страниц: ${data.numpages || 'неизвестно'} | Символов: ${content.length}
        </div>
        <div class="pdf-page">
          ${content.split('\n\n').map(paragraph =>
            paragraph.trim() ? `<p>${paragraph.trim().replace(/\n/g, '<br>')}</p>` : ''
        ).filter(p => p).join('') || '<p>PDF документ не содержит читаемого текста.</p>'}
        </div>
      </div>
    `

        return {
            content,
            htmlContent,
            metadata: {
                title: fileName.replace(/\.[^/.]+$/, ''),
                type: 'pdf',
                pages: data.numpages || 0,
                info: data.info || {}
            }
        }
    } catch (error) {
        console.error('Error parsing PDF document:', error)

        // Возвращаем базовый результат вместо ошибки
        const errorContent = `PDF файл "${fileName}" не может быть прочитан. Возможные причины:
- Файл защищен паролем
- Файл поврежден
- PDF содержит только изображения без текста
- Неподдерживаемая версия PDF

Размер файла: ${(buffer.length / 1024).toFixed(1)} KB`

        return {
            content: errorContent,
            htmlContent: `
        <div class="pdf-document">
          <style>
            .pdf-document { 
              font-family: 'Times New Roman', serif; 
              line-height: 1.6; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              background: white;
              border: 1px solid #ddd;
            }
            .pdf-error {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 15px;
              border-radius: 4px;
              color: #856404;
            }
          </style>
          <div class="pdf-error">
            <h3>⚠️ Не удалось прочитать PDF файл</h3>
            <pre>${errorContent}</pre>
          </div>
        </div>
      `,
            metadata: {
                title: fileName.replace(/\.[^/.]+$/, ''),
                type: 'pdf',
                error: true,
                errorMessage: error instanceof Error ? error.message : 'Неизвестная ошибка'
            }
        }
    }
}

// Главная функция парсинга с сохранением форматирования
export async function parseFileWithFormatting(
    buffer: Buffer,
    mimeType: string,
    fileName: string
): Promise<ParsedDocument> {
    console.log(`Parsing file with formatting: ${fileName}, type: ${mimeType}`)

    try {
        let result: ParsedDocument

        switch (mimeType) {
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                result = await parseWordDocument(buffer, fileName)
                break

            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                result = await parsePowerPointDocument(buffer, fileName)
                break

            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            case 'application/vnd.ms-excel':
                result = await parseExcelDocument(buffer, fileName)
                break

            case 'application/pdf':
                result = await parsePdfDocument(buffer, fileName)
                break

            default:
                // Для неподдерживаемых форматов возвращаем базовый текст
                const content = buffer.toString('utf-8')
                result = {
                    content: content || '',
                    htmlContent: `<div class="text-document"><pre>${content || 'Пустой файл'}</pre></div>`,
                    metadata: {
                        title: fileName.replace(/\.[^/.]+$/, ''),
                        type: 'text'
                    }
                }
        }

        // Убеждаемся что content не null или undefined
        if (!result.content) {
            result.content = ''
        }

        // Логируем результат парсинга
        console.log('Parsing result:', {
            fileName,
            contentLength: result.content.length,
            htmlContentLength: result.htmlContent?.length || 0,
            hasHtml: !!result.htmlContent
        })

        return result

    } catch (error) {
        console.error('Error in parseFileWithFormatting:', error)

        // Возвращаем информативное сообщение об ошибке
        const errorContent = `Файл "${fileName}" не может быть обработан.

Возможные причины:
- Неподдерживаемый формат файла
- Файл поврежден или защищен
- Превышен размер файла
- Ошибка при чтении содержимого

Размер файла: ${(buffer.length / 1024).toFixed(1)} KB
Тип файла: ${mimeType}

Детали ошибки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`

        return {
            content: errorContent,
            htmlContent: `
        <div class="error-document">
          <style>
            .error-document { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.6; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              background: white;
              border: 1px solid #ddd;
            }
            .error-content {
              background: #f8d7da;
              border: 1px solid #f5c6cb;
              padding: 15px;
              border-radius: 4px;
              color: #721c24;
            }
          </style>
          <div class="error-content">
            <h3>❌ Ошибка обработки файла</h3>
            <pre>${errorContent}</pre>
          </div>
        </div>
      `,
            metadata: {
                title: fileName.replace(/\.[^/.]+$/, ''),
                type: 'error',
                error: true,
                errorMessage: error instanceof Error ? error.message : 'Неизвестная ошибка',
                fileSize: buffer.length,
                mimeType
            }
        }
    }
}

// Сохранение оригинального файла
export async function saveOriginalFile(buffer: Buffer, fileName: string, userId: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', userId)

    // Создаем директорию пользователя если не существует
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now()
    const extension = path.extname(fileName)
    const baseName = path.basename(fileName, extension)
    const uniqueFileName = `${baseName}_${timestamp}${extension}`

    const filePath = path.join(uploadsDir, uniqueFileName)

    // Сохраняем файл
    fs.writeFileSync(filePath, buffer)

    // Возвращаем относительный путь от public
    return `/uploads/${userId}/${uniqueFileName}`
}
