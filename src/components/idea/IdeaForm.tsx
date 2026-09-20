'use client'

/**
 * IdeaForm — the guided ideation wizard for the Idea Lab.
 *
 * Flow: describe → context → metrics → review → generate. On generate, the
 * form POSTs the collected answers to /api/v1/ideas, which extracts the
 * opportunity card, runs the value engine and persists the idea. The returned
 * card + value are shown inline, with actions to re-assess, edit and view the
 * saved idea in the account.
 */

import Link from 'next/link'
import { useState } from 'react'
import { demoFunctions, demoIndustries } from '@/lib/demo-data'
import type { Complexity, OpportunityCard } from '@/lib/types/opportunity'
import type { ValueResult } from '@/lib/value/calculate'
import { OpportunityCardView } from './OpportunityCard'
import { ValueSummary } from './ValueSummary'

interface IdeaApiResponse {
  id: string
  title: string
  status: string
  valueScore: number | null
  opportunityCard: OpportunityCard | null
  valueResult: ValueResult | null
  createdAt: string
  updatedAt: string
}

interface FormState {
  rawIdea: string
  businessFunction: string
  industry: string
  currentProcess: string
  systems: string
  annualVolume: string
  currentAnnualEffort: string
  automationPotential: string
  complexity: Complexity
}

const EMPTY: FormState = {
  rawIdea: '',
  businessFunction: '',
  industry: '',
  currentProcess: '',
  systems: '',
  annualVolume: '',
  currentAnnualEffort: '',
  automationPotential: '',
  complexity: 'Medium',
}

const STEPS = ['Describe', 'Context', 'Metrics', 'Review'] as const

function field(name: keyof FormState): { label: string; hint: string } {
  switch (name) {
    case 'rawIdea':
      return {
        label: 'Describe the process, problem or opportunity',
        hint: 'In a sentence or two, what work do you want an agent to take on?',
      }
    case 'currentProcess':
      return {
        label: 'Current process',
        hint: 'How is the work done today, step by step?',
      }
    case 'systems':
      return {
        label: 'Systems involved',
        hint: 'Comma-separated list of tools, systems or data sources.',
      }
    case 'annualVolume':
      return {
        label: 'Annual volume (units)',
        hint: 'How many times per year does this work happen?',
      }
    case 'currentAnnualEffort':
      return {
        label: 'Current annual effort (person-hours)',
        hint: 'Total person-hours spent per year today. Leave blank to estimate from volume.',
      }
    case 'automationPotential':
      return {
        label: 'Automation potential (%)',
        hint: 'Your estimate of how much of the work an agent could handle. Leave blank for a default.',
      }
    default:
      return { label: '', hint: '' }
  }
}

function num(value: string): number | undefined {
  if (value.trim() === '') return undefined
  const n = Number(value)
  return Number.isNaN(n) ? undefined : n
}

export function IdeaForm({ initialIdea }: { initialIdea?: string }) {
  const [form, setForm] = useState<FormState>({ ...EMPTY, rawIdea: initialIdea ?? '' })
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<IdeaApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function next() {
    setStep((s) => Math.min(STEPS.length - 1, s + 1))
  }
  function back() {
    setStep((s) => Math.max(0, s - 1))
  }

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        rawIdea: form.rawIdea,
        businessFunction: form.businessFunction || undefined,
        industry: form.industry || undefined,
        currentProcess: form.currentProcess || undefined,
        systems: form.systems
          ? form.systems.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
        annualVolume: num(form.annualVolume),
        currentAnnualEffort: num(form.currentAnnualEffort),
        automationPotential: num(form.automationPotential),
        complexity: form.complexity,
      }
      const res = await fetch('/api/v1/ideas', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as IdeaApiResponse | { error: string }
      if (!res.ok || !(data as IdeaApiResponse).id) {
        throw new Error((data as { error: string }).error ?? `Request failed (${res.status})`)
      }
      setResult(data as IdeaApiResponse)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate opportunity card.')
    } finally {
      setLoading(false)
    }
  }

  async function reassess() {
    if (!result) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/ideas/${result.id}/assess`, { method: 'POST' })
      const data = (await res.json()) as IdeaApiResponse | { error: string }
      if (!res.ok || !(data as IdeaApiResponse).id) {
        throw new Error((data as { error: string }).error ?? `Request failed (${res.status})`)
      }
      setResult(data as IdeaApiResponse)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Re-assessment failed.')
    } finally {
      setLoading(false)
    }
  }

  function editAgain() {
    setResult(null)
    setStep(STEPS.length - 1)
  }

  if (result && result.opportunityCard && result.valueResult) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              SAVED
            </span>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              Idea <span className="font-mono">{result.id.slice(0, 8)}</span> · status{' '}
              {result.status}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={reassess}
              disabled={loading}
              className="rounded border border-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50 dark:border-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
            >
              {loading ? 'Assessing…' : 'Re-assess'}
            </button>
            <button
              type="button"
              onClick={editAgain}
              className="rounded border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Edit details
            </button>
            <Link
              href={`/account/ideas/${result.id}`}
              className="inline-flex items-center rounded bg-brand-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              View saved idea &rarr;
            </Link>
          </div>
        </div>

        <OpportunityCardView card={result.opportunityCard} />
        <ValueSummary result={result.valueResult} />
        {error ? (
          <p className="text-sm font-semibold text-brand-red">{error}</p>
        ) : null}
      </div>
    )
  }

  const canDescribe = form.rawIdea.trim().length > 0

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <ol className="flex items-center gap-2 text-xs font-semibold">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={
                i === step
                  ? 'rounded-full bg-brand-red px-3 py-1 text-white'
                  : i < step
                    ? 'rounded-full bg-neutral-900 px-3 py-1 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'rounded-full bg-neutral-200 px-3 py-1 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
              }
            >
              {i + 1}. {label}
            </span>
            {i < STEPS.length - 1 ? (
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">
                &rarr;
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      {error ? (
        <p className="text-sm font-semibold text-brand-red">{error}</p>
      ) : null}

      {step === 0 ? (
        <section className="space-y-3">
          <label htmlFor="rawIdea" className="block text-sm font-semibold">
            {field('rawIdea').label}
          </label>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {field('rawIdea').hint}
          </p>
          <textarea
            id="rawIdea"
            value={form.rawIdea}
            onChange={(e) => update('rawIdea', e.target.value)}
            rows={5}
            placeholder="e.g. Our accounts-payable team manually keys invoice data into the ERP and chases exceptions by email."
            className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red dark:border-neutral-700 dark:bg-neutral-900"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={next}
              disabled={!canDescribe}
              className="rounded bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              Continue &rarr;
            </button>
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-4">
          <div>
            <label htmlFor="businessFunction" className="block text-sm font-semibold">
              Business function
            </label>
            <select
              id="businessFunction"
              value={form.businessFunction}
              onChange={(e) => update('businessFunction', e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="">General</option>
              {demoFunctions.map((f) => (
                <option key={f.slug} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="industry" className="block text-sm font-semibold">
              Industry
            </label>
            <select
              id="industry"
              value={form.industry}
              onChange={(e) => update('industry', e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="">Cross-Industry</option>
              {demoIndustries.map((ind) => (
                <option key={ind.slug} value={ind.name}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="currentProcess" className="block text-sm font-semibold">
              {field('currentProcess').label}
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {field('currentProcess').hint}
            </p>
            <textarea
              id="currentProcess"
              value={form.currentProcess}
              onChange={(e) => update('currentProcess', e.target.value)}
              rows={4}
              className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label htmlFor="systems" className="block text-sm font-semibold">
              {field('systems').label}
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{field('systems').hint}</p>
            <input
              id="systems"
              type="text"
              value={form.systems}
              onChange={(e) => update('systems', e.target.value)}
              placeholder="ERP, SharePoint, email"
              className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={back}
              className="rounded border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={next}
              className="rounded bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Continue &rarr;
            </button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="annualVolume" className="block text-sm font-semibold">
                {field('annualVolume').label}
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {field('annualVolume').hint}
              </p>
              <input
                id="annualVolume"
                type="number"
                min={0}
                value={form.annualVolume}
                onChange={(e) => update('annualVolume', e.target.value)}
                className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>
            <div>
              <label htmlFor="currentAnnualEffort" className="block text-sm font-semibold">
                {field('currentAnnualEffort').label}
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {field('currentAnnualEffort').hint}
              </p>
              <input
                id="currentAnnualEffort"
                type="number"
                min={0}
                value={form.currentAnnualEffort}
                onChange={(e) => update('currentAnnualEffort', e.target.value)}
                className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>
            <div>
              <label htmlFor="automationPotential" className="block text-sm font-semibold">
                {field('automationPotential').label}
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {field('automationPotential').hint}
              </p>
              <input
                id="automationPotential"
                type="number"
                min={0}
                max={100}
                value={form.automationPotential}
                onChange={(e) => update('automationPotential', e.target.value)}
                className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>
            <div>
              <label htmlFor="complexity" className="block text-sm font-semibold">
                Complexity
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                How complex is the process to automate?
              </p>
              <select
                id="complexity"
                value={form.complexity}
                onChange={(e) => update('complexity', e.target.value as Complexity)}
                className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red dark:border-neutral-700 dark:bg-neutral-900"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={back}
              className="rounded border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={next}
              className="rounded bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Continue &rarr;
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-4">
          <h3 className="font-headline text-lg font-bold">Review &amp; generate</h3>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <ReviewItem label="Idea" value={form.rawIdea} />
            <ReviewItem label="Business function" value={form.businessFunction || 'General'} />
            <ReviewItem label="Industry" value={form.industry || 'Cross-Industry'} />
            <ReviewItem label="Complexity" value={form.complexity} />
            <ReviewItem
              label="Annual volume"
              value={form.annualVolume ? `${form.annualVolume} units` : '—'}
            />
            <ReviewItem
              label="Current effort"
              value={form.currentAnnualEffort ? `${form.currentAnnualEffort} hrs/yr` : 'estimated'}
            />
            <ReviewItem
              label="Automation potential"
              value={form.automationPotential ? `${form.automationPotential}%` : 'default'}
            />
            <ReviewItem label="Systems" value={form.systems || '—'} />
          </dl>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            We will extract a structured opportunity card, run the ROI engine and save the idea as
            a draft. You can re-assess or edit afterwards.
          </p>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={back}
              disabled={loading}
              className="rounded border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={generate}
              disabled={loading || !canDescribe}
              className="rounded bg-brand-red px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Generating…' : 'Generate Opportunity Card'}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-neutral-100 pb-2 dark:border-neutral-800">
      <dt className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">{value}</dd>
    </div>
  )
}
