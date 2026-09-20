'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * AIInputSection — the homepage "AI Idea" prompt. A text field with the
 * required placeholder and an "Analyze My Idea" button that forwards the idea
 * to the Idea Lab as a query parameter. The Idea Lab is a placeholder page in
 * Phase 1; the actual AI analysis is wired up in a later phase.
 */
export function AIInputSection() {
  const [idea, setIdea] = useState('')
  const router = useRouter()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = idea.trim()
    if (!trimmed) return
    router.push(`/idea-lab?idea=${encodeURIComponent(trimmed)}`)
  }

  return (
    <section className="border-b border-neutral-200 bg-neutral-900 text-white dark:border-neutral-800">
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h2 className="font-headline text-2xl font-bold sm:text-3xl">
          Got a process stuck in your head?
        </h2>
        <p className="mt-2 text-sm text-neutral-300">
          Describe it. We will turn it into a quantified business case.
        </p>
        <form onSubmit={onSubmit} className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              name="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe a process, problem, or opportunity..."
              aria-label="Describe a process, problem, or opportunity"
              className="w-full rounded border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-400 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
            <button
              type="submit"
              className="shrink-0 rounded bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Analyze My Idea
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
