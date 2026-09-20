'use client'

import { useState } from 'react'

/**
 * NewsletterSection — email signup. Phase 1 is a front-end-only placeholder:
 * on submit it shows a confirmation message. Real subscription is wired up in
 * a later phase.
 */
export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setSubscribed(true)
  }

  return (
    <section className="border-y border-neutral-200 bg-brand-blue text-white dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-headline text-2xl font-bold sm:text-3xl">
              The Agentic Automation Briefing
            </h2>
            <p className="mt-2 text-sm text-blue-100">
              One concise email a week: the news that matters, the use cases that
              work, and the opportunities worth tracking. No fluff.
            </p>
          </div>
          <div>
            {subscribed ? (
              <p
                role="status"
                className="rounded bg-white/10 px-4 py-3 text-sm font-medium"
              >
                Thanks &mdash; you are on the list. (Demo: no email was sent.)
              </p>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  aria-label="Email address"
                  className="w-full rounded border border-blue-300/40 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-blue-200 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded bg-white px-6 py-3 text-sm font-semibold text-brand-blue transition hover:bg-blue-50"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
