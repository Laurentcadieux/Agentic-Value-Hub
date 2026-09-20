'use client'

import { useTransition, useState, type FormEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { FormState } from './news-form-schema'

/** Shape of the values used to pre-fill the form in edit mode. */
export interface NewsFormValues {
  slug?: string
  headline?: string
  summary?: string
  analysis?: string
  whyItMatters?: string
  sourceName?: string
  sourceUrl?: string
  canonicalUrl?: string
  publishedAt?: string
  imageUrl?: string
  categories?: string
  tags?: string
  companies?: string
  industries?: string
  businessFunctions?: string
  technologies?: string
  status?: string
}

export interface NewsFormProps {
  /** Server action invoked with the submitted FormData. */
  action: (formData: FormData) => Promise<FormState>
  mode: 'create' | 'edit'
  /** Required in edit mode — rendered as a hidden field so the action knows which row to update. */
  id?: string
  initialValues?: NewsFormValues
}

function Field({
  label,
  name,
  error,
  children,
  hint,
}: {
  label: string
  name: string
  error?: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block font-sans text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p className="mt-1 font-sans text-xs text-neutral-500 dark:text-neutral-400">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1 font-sans text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  )
}

const inputClass =
  'w-full rounded border border-neutral-300 bg-white px-3 py-2 font-sans text-sm text-neutral-900 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'

export function NewsForm({ action, mode, id, initialValues }: NewsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const router = useRouter()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    startTransition(async () => {
      const res = await action(fd)
      if (res.ok) {
        router.refresh()
        router.push(res.redirectTo)
        return
      }
      setErrors(res.errors)
    })
  }

  const fieldError = (name: string) => errors[name]?.join(', ')
  const status = initialValues?.status ?? 'PUBLISHED'

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {id ? <input type="hidden" name="id" value={id} /> : null}
      {errors._form ? (
        <div className="rounded border border-red-300 bg-red-50 p-3 font-sans text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {errors._form.join(', ')}
        </div>
      ) : null}

      <Field label="Slug" name="slug" error={fieldError('slug')}>
        <input
          id="slug"
          name="slug"
          defaultValue={initialValues?.slug ?? ''}
          required
          className={inputClass}
          placeholder="openai-launches-agentic-operator"
        />
      </Field>

      <Field label="Headline" name="headline" error={fieldError('headline')}>
        <input
          id="headline"
          name="headline"
          defaultValue={initialValues?.headline ?? ''}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Summary" name="summary" error={fieldError('summary')}>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          defaultValue={initialValues?.summary ?? ''}
          className={inputClass}
        />
      </Field>

      <Field label="Analysis" name="analysis" error={fieldError('analysis')}>
        <textarea
          id="analysis"
          name="analysis"
          rows={5}
          defaultValue={initialValues?.analysis ?? ''}
          className={inputClass}
        />
      </Field>

      <Field label="Why it matters" name="whyItMatters" error={fieldError('whyItMatters')}>
        <textarea
          id="whyItMatters"
          name="whyItMatters"
          rows={3}
          defaultValue={initialValues?.whyItMatters ?? ''}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Source name" name="sourceName" error={fieldError('sourceName')}>
          <input
            id="sourceName"
            name="sourceName"
            defaultValue={initialValues?.sourceName ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label="Source URL" name="sourceUrl" error={fieldError('sourceUrl')}>
          <input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            defaultValue={initialValues?.sourceUrl ?? ''}
            className={inputClass}
          />
        </Field>
        <Field
          label="Canonical URL"
          name="canonicalUrl"
          error={fieldError('canonicalUrl')}
          hint="Optional — auto-derived from source URL if blank."
        >
          <input
            id="canonicalUrl"
            name="canonicalUrl"
            type="url"
            defaultValue={initialValues?.canonicalUrl ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label="Image URL" name="imageUrl" error={fieldError('imageUrl')}>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            defaultValue={initialValues?.imageUrl ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label="Published at" name="publishedAt" error={fieldError('publishedAt')}>
          <input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={initialValues?.publishedAt ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label="Status" name="status" error={fieldError('status')}>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className={inputClass}
          >
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field
          label="Categories"
          name="categories"
          error={fieldError('categories')}
          hint="Comma-separated"
        >
          <input
            id="categories"
            name="categories"
            defaultValue={initialValues?.categories ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label="Tags" name="tags" error={fieldError('tags')} hint="Comma-separated">
          <input
            id="tags"
            name="tags"
            defaultValue={initialValues?.tags ?? ''}
            className={inputClass}
          />
        </Field>
        <Field
          label="Companies"
          name="companies"
          error={fieldError('companies')}
          hint="Comma-separated"
        >
          <input
            id="companies"
            name="companies"
            defaultValue={initialValues?.companies ?? ''}
            className={inputClass}
          />
        </Field>
        <Field
          label="Industries"
          name="industries"
          error={fieldError('industries')}
          hint="Comma-separated"
        >
          <input
            id="industries"
            name="industries"
            defaultValue={initialValues?.industries ?? ''}
            className={inputClass}
          />
        </Field>
        <Field
          label="Business functions"
          name="businessFunctions"
          error={fieldError('businessFunctions')}
          hint="Comma-separated"
        >
          <input
            id="businessFunctions"
            name="businessFunctions"
            defaultValue={initialValues?.businessFunctions ?? ''}
            className={inputClass}
          />
        </Field>
        <Field
          label="Technologies"
          name="technologies"
          error={fieldError('technologies')}
          hint="Comma-separated"
        >
          <input
            id="technologies"
            name="technologies"
            defaultValue={initialValues?.technologies ?? ''}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-brand-red px-4 py-2 font-sans text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending
            ? 'Saving…'
            : mode === 'create'
              ? 'Publish article'
              : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded border border-neutral-300 px-4 py-2 font-sans text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export function joinList(values: string[] | undefined): string {
  return values ? values.join(', ') : ''
}
