'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface UseCaseFormData {
  slug: string
  title: string
  industry: string
  businessFunction: string
  problem: string
  description: string
  agentPattern: string
  automationPattern: string
  valueDrivers: string
  systems: string
  technologies: string
  automationPotential: string
  complexity: string
  risks: string
  controls: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

function emptyForm(): UseCaseFormData {
  return {
    slug: '',
    title: '',
    industry: '',
    businessFunction: '',
    problem: '',
    description: '',
    agentPattern: '',
    automationPattern: '',
    valueDrivers: '',
    systems: '',
    technologies: '',
    automationPotential: '',
    complexity: '',
    risks: '',
    controls: '',
    status: 'DRAFT',
  }
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function toPayload(data: UseCaseFormData) {
  const ap = data.automationPotential.trim()
  return {
    slug: data.slug.trim() || undefined,
    title: data.title.trim(),
    industry: data.industry.trim() || null,
    businessFunction: data.businessFunction.trim() || null,
    problem: data.problem.trim() || null,
    description: data.description.trim() || null,
    agentPattern: data.agentPattern.trim() || null,
    automationPattern: data.automationPattern.trim() || null,
    valueDrivers: splitList(data.valueDrivers),
    systems: splitList(data.systems),
    technologies: splitList(data.technologies),
    automationPotential: ap === '' ? null : Math.max(0, Math.min(100, Number(ap))),
    complexity: data.complexity.trim() || null,
    risks: data.risks.trim() || null,
    controls: data.controls.trim() || null,
    status: data.status,
  }
}

const inputClass =
  'w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
const labelClass =
  'mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400'

export function UseCaseForm({
  mode,
  id,
  initial,
}: {
  mode: 'create' | 'edit'
  id?: string
  initial?: Partial<UseCaseFormData>
}) {
  const router = useRouter()
  const [form, setForm] = useState<UseCaseFormData>({ ...emptyForm(), ...initial })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof UseCaseFormData>(key: K, value: UseCaseFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = toPayload(form)
      const url = mode === 'create' ? '/api/v1/use-cases' : `/api/v1/use-cases/${id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Request failed (${res.status})`)
      }
      router.push('/admin/use-cases')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (mode !== 'edit' || !id) return
    if (!confirm('Delete this use case? This cannot be undone.')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/use-cases/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Delete failed (${res.status})`)
      }
      router.push('/admin/use-cases')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Title *</label>
          <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Slug (auto-generated if blank)</label>
          <input className={inputClass} value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto from title" />
        </div>
        <div>
          <label className={labelClass}>Industry</label>
          <input className={inputClass} value={form.industry} onChange={(e) => set('industry', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Business function</label>
          <input className={inputClass} value={form.businessFunction} onChange={(e) => set('businessFunction', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Complexity</label>
          <input className={inputClass} value={form.complexity} onChange={(e) => set('complexity', e.target.value)} placeholder="Low / Medium / High" />
        </div>
        <div>
          <label className={labelClass}>Automation potential (0–100)</label>
          <input type="number" min={0} max={100} className={inputClass} value={form.automationPotential} onChange={(e) => set('automationPotential', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Agent pattern</label>
          <input className={inputClass} value={form.agentPattern} onChange={(e) => set('agentPattern', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Automation pattern</label>
          <input className={inputClass} value={form.automationPattern} onChange={(e) => set('automationPattern', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value as UseCaseFormData['status'])}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Problem</label>
        <textarea rows={3} className={inputClass} value={form.problem} onChange={(e) => set('problem', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Value drivers (comma-separated)</label>
          <input className={inputClass} value={form.valueDrivers} onChange={(e) => set('valueDrivers', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Systems (comma-separated)</label>
          <input className={inputClass} value={form.systems} onChange={(e) => set('systems', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Technologies (comma-separated)</label>
          <input className={inputClass} value={form.technologies} onChange={(e) => set('technologies', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Risks</label>
          <textarea rows={2} className={inputClass} value={form.risks} onChange={(e) => set('risks', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Controls</label>
          <textarea rows={2} className={inputClass} value={form.controls} onChange={(e) => set('controls', e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : mode === 'create' ? 'Create use case' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/use-cases')}
          className="rounded border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
        >
          Cancel
        </button>
        {mode === 'edit' ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="ml-auto rounded border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  )
}
