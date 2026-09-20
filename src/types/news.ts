/**
 * Shared presentation-layer type for news items rendered as cards.
 *
 * Decoupled from `DemoNewsItem` (src/lib/demo-data) and from the Prisma
 * `News` model so the card / sidebar / hero components can accept either the
 * demo payload or a DB row without depending on `@/lib/demo-data`.
 *
 * Fields are nullable/optional to accommodate both sources:
 *   - DB rows (Prisma) surface `null` for missing values.
 *   - Demo items omit optionals entirely.
 */
export interface NewsCardItem {
  id: string
  slug: string
  headline: string
  subtitle?: string | null
  summary?: string | null
  imageUrl?: string | null
  publishedAt?: string | Date | null
  categories?: string[]
  author?: string | null
  readingTimeMinutes?: number | null
  isFeatured?: boolean | null
  /** Legacy publisher field — still present on DB rows; no longer required. */
  sourceName?: string | null
}
