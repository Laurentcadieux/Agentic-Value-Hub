/**
 * Content fingerprinting for news deduplication.
 *
 * The content hash is a SHA-256 digest over a deterministic concatenation of
 * the headline, summary and source URL. Two ingests that produce the same
 * fingerprint are treated as content-level duplicates regardless of cosmetic
 * URL differences.
 */

import { createHash } from 'node:crypto'

export function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex')
}

export interface ContentHashParts {
  headline: string
  summary?: string | null
  sourceUrl?: string | null
}

/**
 * Compute a stable content hash from headline + summary + sourceUrl.
 *
 * Empty/missing summary and sourceUrl collapse to empty strings so that an
 * article with no summary hashes the same way every time.
 */
export function computeContentHash(parts: ContentHashParts): string {
  const headline = (parts.headline ?? '').trim()
  const summary = (parts.summary ?? '').trim()
  const sourceUrl = (parts.sourceUrl ?? '').trim()
  const material = [headline, summary, sourceUrl].join('|')
  return sha256(material)
}
