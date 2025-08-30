import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const document = await db.document.findFirst({
      where: {
        id: params.id,
        user: {
          clerkId: userId
        }
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (!document.filePath) {
      return NextResponse.json({ error: 'Original file not available' }, { status: 404 })
    }

    const filePath = path.join(process.cwd(), 'public', document.filePath)
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(filePath)
    const fileName = document.fileName || 'document'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.fileType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
