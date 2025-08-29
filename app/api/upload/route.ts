import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'
import { parseFile, isFileTypeSupported } from '@/lib/file-parsers'
import { db } from '@/lib/db'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      )
    }

    // Check file type
    if (!isFileTypeSupported(file.name)) {
      return NextResponse.json(
        { error: 'Неподдерживаемый тип файла' },
        { status: 400 }
      )
    }

    // Check file size (10MB limit)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760')
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Файл слишком большой (максимум 10MB)' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse file content
    const content = await parseFile(buffer, file.type, file.name)

    // Get or create user in database
    let user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      // Create user if doesn't exist
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: 'user@example.com', // You might want to get this from Clerk
        }
      })
    }

    // Create document in database
    const document = await db.document.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        content,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        userId: user.id,
      }
    })

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        content: document.content,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Ошибка при загрузке файла' },
      { status: 500 }
    )
  }
}
