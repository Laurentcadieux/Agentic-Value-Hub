import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

/**
 * GET /uploads/:filename — serve an uploaded image.
 * Public endpoint (no auth needed for reading images).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params

  // Security: prevent path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'public', 'uploads', filename)

  try {
    const stats = await stat(filePath)
    if (!stats.isFile()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const buffer = await readFile(filePath)
    const ext = path.extname(filename).toLowerCase()
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(buffer.length),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
