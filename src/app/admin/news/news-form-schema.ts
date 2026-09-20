/**
 * Shared schema + form parser for the admin news editor.
 *
 * Kept out of the 'use server' actions file so it can be imported by both the
 * client form component (for types) and the server actions (for parsing).
 * Admin forms send empty strings for optional URLs and comma-separated values
 * for array fields; this module normalizes that into a validated object.
 */

import { z } from 'zod'

export const newsStatusValues = ['PUBLISHED', 'DRAFT', 'ARCHIVED'] as const

export const newsAdminSchema = z.object({
  slug: z.string().min(1).max(300),
  headline: z.string().min(1).max(500),
  summary: z.string().optional(),
  analysis: z.string().optional(),
  whyItMatters: z.string().optional(),
  sourceName: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  publishedAt: z.string().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  companies: z.array(z.string()).default([]),
  industries: z.array(z.string()).default([]),
  businessFunctions: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  status: z.enum(newsStatusValues).default('PUBLISHED'),
})

export type NewsAdminValues = z.infer<typeof newsAdminSchema>

export type FormState =
  | { ok: true; redirectTo: string }
  | { ok: false; errors: Record<string, string[]> }

export type ParseResult =
  | { ok: true; data: NewsAdminValues; id?: string }
  | { ok: false; errors: Record<string, string[]> }

function splitList(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '')
}

function getStr(formData: FormData, key: string): string | undefined {
  const raw = formData.get(key)
  const s = raw == null ? '' : String(raw)
  const t = s.trim()
  return t === '' ? undefined : t
}

/**
 * Parse and validate an admin news form submission.
 *
 * @param formData the submitted form data
 * @param opts.requireId when true, an `id` field is required (edit mode)
 */
export function parseNewsForm(
  formData: FormData,
  opts: { requireId?: boolean } = {},
): ParseResult {
  const id = getStr(formData, 'id')
  if (opts.requireId && !id) {
    return { ok: false, errors: { id: ['Missing news id'] } }
  }

  const raw = {
    slug: getStr(formData, 'slug') ?? '',
    headline: getStr(formData, 'headline') ?? '',
    summary: getStr(formData, 'summary'),
    analysis: getStr(formData, 'analysis'),
    whyItMatters: getStr(formData, 'whyItMatters'),
    sourceName: getStr(formData, 'sourceName'),
    sourceUrl: getStr(formData, 'sourceUrl'),
    canonicalUrl: getStr(formData, 'canonicalUrl'),
    publishedAt: getStr(formData, 'publishedAt'),
    imageUrl: getStr(formData, 'imageUrl'),
    categories: splitList(getStr(formData, 'categories')),
    tags: splitList(getStr(formData, 'tags')),
    companies: splitList(getStr(formData, 'companies')),
    industries: splitList(getStr(formData, 'industries')),
    businessFunctions: splitList(getStr(formData, 'businessFunctions')),
    technologies: splitList(getStr(formData, 'technologies')),
    status: getStr(formData, 'status') ?? 'PUBLISHED',
  }

  const parsed = newsAdminSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  return { ok: true, data: parsed.data, id }
}
