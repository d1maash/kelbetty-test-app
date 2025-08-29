import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

// GET - получить все документы пользователя
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or create user
    let user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: 'user@example.com',
        }
      })
    }

    // Get user documents
    const documents = await db.document.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        style: true
      }
    })

    return NextResponse.json({ documents })

  } catch (error) {
    console.error('Documents fetch error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении документов' },
      { status: 500 }
    )
  }
}

// POST - создать новый документ
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, content } = await request.json()

    // Get or create user
    let user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: 'user@example.com',
        }
      })
    }

    // Create document
    const document = await db.document.create({
      data: {
        title: title || 'Новый документ',
        content: content || '',
        userId: user.id,
      },
      include: {
        style: true
      }
    })

    return NextResponse.json({ document })

  } catch (error) {
    console.error('Document creation error:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании документа' },
      { status: 500 }
    )
  }
}
