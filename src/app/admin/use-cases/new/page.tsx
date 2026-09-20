'use client'

import Link from 'next/link'
import { UseCaseForm } from '../_components/UseCaseForm'

export default function NewUseCasePage() {
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
      <h1 className="mt-1 font-headline text-3xl font-bold">New use case</h1>
      <div className="mt-6">
        <UseCaseForm mode="create" />
      </div>
    </div>
  )
}
