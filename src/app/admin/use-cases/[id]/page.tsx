'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { UseCaseForm, type UseCaseFormData } from '../_components/UseCaseForm'

interface EditUseCase {
  id: string
  slug: string
  title: string
  industry: string | null
  businessFunction: string | null
  problem: string | null
  description: string | null
  agentPattern: string | null
  automationPattern: string | null
  valueDrivers: string[]
  systems: string[]
  technologies: string[]
  automationPotential: number | null
  complexity: string | null
  risks: string | null
  controls: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

function toFormInitial(u: EditUseCase): Partial<UseCaseFormData> {
  return {
    slug: u.slug,
    title: u.title,
    industry: u.industry ?? '',
    businessFunction: u.businessFunction ?? '',
    problem: u.problem ?? '',
    description: u.description ?? '',
    agentPattern: u.agentPattern ?? '',
    automationPattern: u.automationPattern ?? '',
    valueDrivers: (u.valueDrivers ?? []).join(', '),
    systems: (u.systems ?? []).join(', '),
    technologies: (u.technologies ?? []).join(', '),
    automationPotential: u.automationPotential != null ? String(u.automationPotential) : '',
    complexity: u.complexity ?? '',
    risks: u.risks ?? '',
    controls: u.controls ?? '',
    status: u.status,
  }
}

export default function EditUseCasePage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [initial, setInitial] = useState<Partial<UseCaseFormData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/v1/use-cases/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return (await res.json()) as EditUseCase
      })
      .then((u) => {
        if (!cancelled) {
          setInitial(toFormInitial(u))
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link
          href="/admin/use-cases"
          className="font-sans text-xs font-medium text-neutral-500 hover:text-brand-red dark:text-neutral-400"
        >
          &larr; Use Cases
        </Link>
      </nav>
      <p className="font-sans text-xs font-bold uppercase tracking-wider text-brand-red">Admin</p>
      <h1 className="mt-1 font-headline text-3xl font-bold">Edit use case</h1>

      {loading ? (
        <p className="mt-6 text-sm text-neutral-500">Loading…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-red-600">Error: {error}</p>
      ) : initial ? (
        <div className="mt-6">
          <UseCaseForm mode="edit" id={id} initial={initial} />
        </div>
      ) : null}
    </div>
  )
}
