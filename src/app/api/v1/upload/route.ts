import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

/** Allowed MIME types for image uploads. */
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
}

/** Max upload size: 10 MB. */
const MAX_SIZE = 10 * 1024 * 1024

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const expected = process.env.NEWS_INGEST_API_KEY ?? ''
  return !!(expected && token === expected)
}

/**
 * POST /api/v1/upload — upload an image file.
 *
 * Auth: Bearer token (NEWS_INGEST_API_KEY)
 *
 * Send multipart/form-data with a "file" field containing the image.
 *
 * Example (curl):
 * curl -X POST https://agenticvaluehub.com/api/v1/upload \
 *   -H "Authorization: Bearer YOUR_API_KEY" \
 *   -F "file=@/path/to/image.jpg"
 *
 * Example (fetch):
 * const form = new FormData()
 * form.append('file', fileInput.files[0])
 * fetch('/api/v1/upload', {
 *   method: 'POST',
 *   headers: { Authorization: 'Bearer YOUR_API_KEY' },
 *   body: form
 * })
 *
 * Success (200):
 * { "success": true, "url": "https://agenticvaluehub.com/uploads/uuid.jpg", "filename": "uuid.jpg", "size": 123456 }
 *
 * Then link to article:
 * POST /api/v1/news with "image_url": "https://agenticvaluehub.com/uploads/uuid.jpg"
 * or PATCH /api/v1/news/:id with "imageUrl": "https://agenticvaluehub.com/uploads/uuid.jpg"
 */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided. Send a "file" field in multipart/form-data.' }, { status: 400 })
  }

  // Validate MIME type
  const ext = ALLOWED_TYPES[file.type]
  if (!ext) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}. Allowed: ${Object.keys(ALLOWED_TYPES).join(', ')}` },
      { status: 422 },
    )
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Max: 10 MB.` },
      { status: 413 },
    )
  }

  // Generate unique filename
  const filename = `${randomUUID()}${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  const filePath = path.join(uploadDir, filename)

  // Ensure directory exists
  try {
    await mkdir(uploadDir, { recursive: true })
  } catch {
    // Directory might already exist — ignore
  }

  // Write file
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(filePath, buffer)
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to save file', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    )
  }

  // Build public URL
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https'
  const host = request.headers.get('host') ?? 'agenticvaluehub.com'
  const publicUrl = `${protocol}://${host}/uploads/${filename}`

  return NextResponse.json({
    success: true,
    url: publicUrl,
    filename,
    size: file.size,
    mimeType: file.type,
  })
}
