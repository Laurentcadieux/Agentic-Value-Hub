import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Ask the AI Advisor',
  description:
    'Describe a process, problem or opportunity and the AI Advisor helps you turn it into a quantified business case.',
  alternates: { canonical: '/ask-ai' },
}

export default function AskAiPage() {
  return (
    <>
      <PageHeader
        kicker="Tools"
        title="Ask the AI Advisor"
        description="Tell the Advisor what you want to automate. It helps you frame the opportunity, find relevant use cases and estimate the value."
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            PLACEHOLDER
          </span>
          <p className="mt-4 text-neutral-600 dark:text-neutral-300">
            The interactive AI Advisor lands in a later phase. For now, capture
            your idea in the Idea Lab and we will work it into a business case.
          </p>
          <Link
            href="/idea-lab"
            className="mt-6 inline-flex items-center justify-center rounded bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Go to the Idea Lab &rarr;
          </Link>
        </div>
      </div>
    </>
  )
}
