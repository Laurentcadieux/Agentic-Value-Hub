/**
 * News ingestion service — the business logic layer above the repository.
 *
 * Responsibilities:
 *  - Zod validation of the ingest payload
 *  - canonical URL normalization
 *  - content sanitization (strip HTML, cap lengths)
 *  - content-hash fingerprinting
 *  - duplicate detection (content hash, then canonical URL)
 *  - writing an IngestionEvent audit row for every attempt
 *    (success / duplicate / error)
 *
 * Returns a discriminated `IngestResult` so route handlers can map cleanly to
 * HTTP status codes. Audit writes never throw into the caller's result path.
 */

import { z } from 'zod'
import type { News, Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import {
  findByCanonicalUrl,
  findByContentHash,
  createNews,
  createIngestionEvent,
} from '@/lib/repositories/news-repository'
import { normalizeCanonicalUrl } from '@/lib/utils/url'
import { computeContentHash } from '@/lib/utils/hash'
import { sanitizeTextField, FIELD_LIMITS } from '@/lib/utils/sanitize'

export const newsIngestSchema = z.object({
  slug: z.string().min(1).max(FIELD_LIMITS.slug).optional(),
  headline: z.string().min(1).max(FIELD_LIMITS.headline),
  summary: z.string().optional(),
  analysis: z.string().optional(),
  whyItMatters: z.string().optional(),
  sourceName: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
  publishedAt: z.string().datetime().optional(),
  published_at: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  companies: z.array(z.string()).default([]),
  industries: z.array(z.string()).default([]),
  businessFunctions: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  /** Optional caller-supplied hash; otherwise computed from the content. */
  contentHash: z.string().optional(),
})

export type IngestInput = z.infer<typeof newsIngestSchema>

export interface IngestAudit {
  source: string
  requestId?: string
}

export type IngestResult =
  | {
      success: true
      status: 'published'
      news: News
      newsId: string
    }
  | {
      success: false
      status: 'duplicate'
      news: News | null
      newsId: string | null
      error: string
    }
  | {
      success: false
      status: 'error'
      error: string
    }

/**
 * Record an IngestionEvent audit row. Failures here are logged but never
 * propagated — a broken audit table must not change the ingest result.
 */
async function recordAudit(
  audit: IngestAudit,
  status: string,
  payload: {
    payloadMetadata?: Record<string, unknown>
    errorMessage?: string
  },
): Promise<void> {
  try {
    await createIngestionEvent({
      source: audit.source,
      requestId: audit.requestId ?? null,
      status,
      payloadMetadata: payload.payloadMetadata
        ? (payload.payloadMetadata as unknown as Prisma.InputJsonValue)
        : undefined,
      errorMessage: payload.errorMessage ?? null,
    })
  } catch (err) {
    console.error('news-service: failed to record ingestion event', err)
  }
}

/** Resolve the canonical URL: explicit value, else fall back to the source URL. */
function resolveCanonicalUrl(input: IngestInput): string | null {
  if (input.canonicalUrl) return normalizeCanonicalUrl(input.canonicalUrl)
  if (input.sourceUrl) return normalizeCanonicalUrl(input.sourceUrl)
  return null
}

export async function ingestNews(
  input: IngestInput,
  audit: IngestAudit,
): Promise<IngestResult> {
  const requestId = audit.requestId ?? randomUUID()

  // 1. Canonical URL normalization.
  const canonicalUrl = resolveCanonicalUrl(input)

  // 2. Sanitize free-text fields.
  const headline = sanitizeTextField(input.headline, FIELD_LIMITS.headline)
  const summary = input.summary
    ? sanitizeTextField(input.summary, FIELD_LIMITS.summary)
    : null
  const analysis = input.analysis
    ? sanitizeTextField(input.analysis, FIELD_LIMITS.analysis)
    : null
  const whyItMatters = input.whyItMatters
    ? sanitizeTextField(input.whyItMatters, FIELD_LIMITS.whyItMatters)
    : null
  const sourceName = input.sourceName
    ? sanitizeTextField(input.sourceName, FIELD_LIMITS.sourceName)
    : null

  // 3. Content fingerprint (caller hash wins, otherwise compute).
  const contentHash =
    input.contentHash ??
    computeContentHash({
      headline,
      summary,
      sourceUrl: input.sourceUrl ?? null,
    })

  // 3.5. Auto-generate slug from headline if not provided.
  const slug =
    input.slug ??
    headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) + '-' + randomUUID().slice(0, 8)

  const metadata = { contentHash, canonicalUrl, slug }

  // 4. Duplicate detection — content hash first, then canonical URL.
  const dupByHash = await findByContentHash(contentHash)
  if (dupByHash) {
    await recordAudit(audit, 'duplicate', {
      payloadMetadata: { ...metadata, reason: 'content_hash', existingId: dupByHash.id },
    })
    return {
      success: false,
      status: 'duplicate',
      news: dupByHash,
      newsId: dupByHash.id,
      error: 'Duplicate content hash',
    }
  }

  if (canonicalUrl) {
    const dupByUrl = await findByCanonicalUrl(canonicalUrl)
    if (dupByUrl) {
      await recordAudit(audit, 'duplicate', {
        payloadMetadata: { ...metadata, reason: 'canonical_url', existingId: dupByUrl.id },
      })
      return {
        success: false,
        status: 'duplicate',
        news: dupByUrl,
        newsId: dupByUrl.id,
        error: 'Duplicate canonical URL',
      }
    }
  }

  // 5. Persist + audit success.
  try {
    const news = await createNews({
      slug,
      headline,
      summary,
      analysis,
      whyItMatters,
      sourceName,
      sourceUrl: input.sourceUrl ?? null,
      canonicalUrl,
      publishedAt: (input.publishedAt ?? input.published_at) ? new Date(input.publishedAt ?? input.published_at!) : null,
      imageUrl: input.imageUrl ?? null,
      categories: input.categories,
      tags: input.tags,
      companies: input.companies,
      industries: input.industries,
      businessFunctions: input.businessFunctions,
      technologies: input.technologies,
      contentHash,
      status: 'PUBLISHED',
    })
    await recordAudit(audit, 'success', {
      payloadMetadata: { ...metadata, newsId: news.id },
    })
    return {
      success: true,
      status: 'published',
      news,
      newsId: news.id,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    await recordAudit(audit, 'error', {
      payloadMetadata: metadata,
      errorMessage,
    })
    return {
      success: false,
      status: 'error',
      error: errorMessage,
    }
  }
}
