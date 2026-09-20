import type { Metadata } from 'next'
import { AdvisorChat } from '@/components/chat/AdvisorChat'
import { DEMO_CUSTOMER_ID } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Ask the AI Advisor',
  description:
    'Describe a process, problem or opportunity and the AI Advisor helps you turn it into a quantified business case. Choose LEARN, EXPLORE, IDEATE or ASSESS mode.',
  alternates: { canonical: '/ask-ai' },
  robots: { index: false, follow: true },
}

/**
 * /ask-ai — full-page AI Advisor (Phase 4).
 *
 * Not a floating chatbot: the Advisor owns the page. A sidebar lists past
 * conversations, a mode selector switches between LEARN / EXPLORE / IDEATE /
 * ASSESS, and the chat panel walks every conversation through a structured
 * discovery state machine that culminates in an opportunity card saved to the
 * Idea Lab.
 *
 * Customer scoping: the customer id is sourced from configuration here (auth is
 * wired in a later phase) and propagated to every API call, where the server
 * enforces row-level scoping.
 */
export default function AskAiPage() {
  return (
    <section className="flex flex-col">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            Tools
          </p>
          <h1 className="mt-1 font-headline text-2xl font-bold leading-tight sm:text-3xl">
            AI Advisor
          </h1>
        </div>
      </header>
      <AdvisorChat customerId={DEMO_CUSTOMER_ID} />
    </section>
  )
}
