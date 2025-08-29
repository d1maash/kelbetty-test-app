import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs'
import { db } from '@/lib/db'

// GET - получить конкретный документ
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const document = await db.document.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        style: true
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json({ document })

  } catch (error) {
    console.error('Document fetch error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении документа' },
      { status: 500 }
    )
  }
}

// PUT - обновить документ
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, content } = await request.json()

    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if document belongs to user
    const existingDocument = await db.document.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      )
    }

    // Update document
    const document = await db.document.update({
      where: { id: params.id },
      data: {
        title,
        content,
        updatedAt: new Date()
      },
      include: {
        style: true
      }
    })

    return NextResponse.json({ document })

  } catch (error) {
    console.error('Document update error:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении документа' },
      { status: 500 }
    )
  }
}

// DELETE - удалить документ
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if document belongs to user
    const existingDocument = await db.document.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      )
    }

    // Delete document
    await db.document.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Document delete error:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении документа' },
      { status: 500 }
    )
  }
}
