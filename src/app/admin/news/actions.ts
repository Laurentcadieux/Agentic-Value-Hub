'use server'

/**
 * Server actions for the admin news management UI. Each action parses and
 * validates the form, sanitizes text, normalizes the canonical URL, computes
 * a content hash, then writes via the news repository and revalidates the
 * admin pages. Returns a FormState so the client form can surface errors or
 * navigate on success.
 */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createNews as repoCreateNews,
  updateNews as repoUpdateNews,
  deleteNews as repoDeleteNews,
} from '@/lib/repositories/news-repository'
import { sanitizeTextField, FIELD_LIMITS } from '@/lib/utils/sanitize'
import { normalizeCanonicalUrl } from '@/lib/utils/url'
import { computeContentHash } from '@/lib/utils/hash'
import { parseNewsForm, type FormState, type NewsAdminValues } from './news-form-schema'

function toDate(value: string | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function errState(message: string): FormState {
  return { ok: false, errors: { _form: [message] } }
}

function sanitizeFields(values: NewsAdminValues) {
  const headline = sanitizeTextField(values.headline, FIELD_LIMITS.headline)
  const contentHash = computeContentHash({
    headline,
    summary: values.summary ?? null,
    sourceUrl: values.sourceUrl ?? null,
  })
  const canonicalUrl = values.canonicalUrl
    ? normalizeCanonicalUrl(values.canonicalUrl)
    : null
  return {
    headline,
    contentHash,
    canonicalUrl,
    summary: values.summary
      ? sanitizeTextField(values.summary, FIELD_LIMITS.summary)
      : null,
    analysis: values.analysis
      ? sanitizeTextField(values.analysis, FIELD_LIMITS.analysis)
      : null,
    whyItMatters: values.whyItMatters
      ? sanitizeTextField(values.whyItMatters, FIELD_LIMITS.whyItMatters)
      : null,
  }
}

/** Create a news item from the admin form. */
export async function createNewsAction(formData: FormData): Promise<FormState> {
  const parsed = parseNewsForm(formData, { requireId: false })
  if (!parsed.ok) return parsed

  const v = parsed.data
  const s = sanitizeFields(v)

  try {
    await repoCreateNews({
      slug: v.slug,
      headline: s.headline,
      summary: s.summary,
      analysis: s.analysis,
      whyItMatters: s.whyItMatters,
      sourceName: v.sourceName ?? null,
      sourceUrl: v.sourceUrl ?? null,
      canonicalUrl: s.canonicalUrl,
      publishedAt: toDate(v.publishedAt),
      imageUrl: v.imageUrl ?? null,
      categories: v.categories,
      tags: v.tags,
      companies: v.companies,
      industries: v.industries,
      businessFunctions: v.businessFunctions,
      technologies: v.technologies,
      contentHash: s.contentHash,
      status: v.status,
    })
  } catch (err) {
    return errState(err instanceof Error ? err.message : 'Failed to create news')
  }

  revalidatePath('/admin/news')
  revalidatePath('/admin')
  return { ok: true, redirectTo: '/admin/news' }
}

/** Update an existing news item from the admin form (requires an `id` field). */
export async function updateNewsAction(formData: FormData): Promise<FormState> {
  const parsed = parseNewsForm(formData, { requireId: true })
  if (!parsed.ok) return parsed

  const id = parsed.id
  if (!id) return errState('Missing news id')

  const v = parsed.data
  const s = sanitizeFields(v)

  try {
    await repoUpdateNews(id, {
      slug: v.slug,
      headline: s.headline,
      summary: s.summary,
      analysis: s.analysis,
      whyItMatters: s.whyItMatters,
      sourceName: v.sourceName ?? null,
      sourceUrl: v.sourceUrl ?? null,
      canonicalUrl: s.canonicalUrl,
      publishedAt: toDate(v.publishedAt),
      imageUrl: v.imageUrl ?? null,
      categories: v.categories,
      tags: v.tags,
      companies: v.companies,
      industries: v.industries,
      businessFunctions: v.businessFunctions,
      technologies: v.technologies,
      contentHash: s.contentHash,
      status: v.status,
    })
  } catch (err) {
    return errState(err instanceof Error ? err.message : 'Failed to update news')
  }

  revalidatePath('/admin/news')
  revalidatePath(`/admin/news/${id}`)
  revalidatePath('/admin')
  return { ok: true, redirectTo: `/admin/news/${id}` }
}

/** Delete a news item by id. Used as a direct <form action> from the list. */
export async function deleteNewsAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '')
  if (!id) return

  try {
    await repoDeleteNews(id)
  } catch {
    // Ignore not-found / DB errors for this idempotent admin action.
    return
  }

  revalidatePath('/admin/news')
  revalidatePath('/admin')
  redirect('/admin/news')
}
