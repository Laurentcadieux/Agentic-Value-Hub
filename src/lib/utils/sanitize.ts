/**
 * Content sanitization helpers for the news ingestion pipeline.
 *
 * Ingested text fields may arrive with HTML markup or be far longer than the
 * schema can sensibly store. These helpers strip tags, decode the common
 * entities, collapse whitespace, and cap fields at safe limits.
 */

export const FIELD_LIMITS = {
  slug: 300,
  headline: 500,
  summary: 5000,
  analysis: 20000,
  whyItMatters: 5000,
  sourceName: 300,
} as const

export type FieldLimitKey = keyof typeof FIELD_LIMITS

/** Strip HTML tags and decode the common named/numeric entities to text. */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code)
      return Number.isFinite(n) ? String.fromCodePoint(n) : ''
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const n = parseInt(hex, 16)
      return Number.isFinite(n) ? String.fromCodePoint(n) : ''
    })
    .replace(/\s+/g, ' ')
    .trim()
}

/** Cap a string to `limit` characters, trimming trailing whitespace. */
export function truncateToLimit(input: string, limit: number): string {
  if (input.length <= limit) return input
  return input.slice(0, limit).trimEnd()
}

/** Strip HTML then cap to `limit`. The standard treatment for free-text fields. */
export function sanitizeTextField(input: string, limit: number): string {
  return truncateToLimit(stripHtml(input), limit)
}
