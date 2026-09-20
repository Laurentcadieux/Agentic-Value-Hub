import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Agentic Value Hub tracks the agentic AI market, catalogs enterprise use cases and helps teams turn opportunities into quantified business cases.',
  alternates: { canonical: '/about' },
}

const principles: { title: string; body: string }[] = [
  {
    title: 'Track the market',
    body: 'We follow the news, research and shipped systems that move agentic automation forward, and we explain why each one matters.',
  },
  {
    title: 'Catalog the proven',
    body: 'Every use case captures the problem, the agent and automation pattern, the value drivers and the controls required to run safely.',
  },
  {
    title: 'Quantify your own',
    body: 'Bring a process, problem or opportunity and turn it into a structured business case with an estimated value score.',
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="About"
        title="About the Agentic Value Hub"
        description="The Hub is an independent reference for teams adopting agentic AI — tracking the market, cataloging proven use cases and helping you build a quantified case for your own opportunities."
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="prose-editorial">
          <p>
            Agentic AI is moving from demos to production. Capabilities that were
            research papers a year ago now ship as APIs, and enterprises are
            running autonomous workflows in regulated environments. The hard
            part is no longer just building an agent &mdash; it is knowing where
            to apply one, how much value it creates and how to control it.
          </p>
          <p>
            The Agentic Value Hub exists to close that gap. We watch the market so
            you do not have to, document use cases that have actually worked and
            give you a structured way to turn your own ideas into a business
            case you can defend.
          </p>
        </div>

        <h2 className="mt-12 font-headline text-2xl font-bold">
          What we do
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {principles.map((p) => (
            <div
              key={p.title}
              className="rounded border border-neutral-200 p-5 dark:border-neutral-800"
            >
              <h3 className="font-headline text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {p.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded bg-neutral-900 p-6 text-white dark:bg-neutral-900">
          <h2 className="font-headline text-xl font-bold">A note on the data</h2>
          <p className="mt-2 text-sm text-neutral-300">
            During this phase the public website runs on clearly-labeled demo
            data so the layout and navigation can be validated. Live news
            ingestion and the use-case database are wired up in later phases.
          </p>
          <Link
            href="/methodology"
            className="mt-4 inline-block font-sans text-sm font-semibold text-brand-red hover:underline"
          >
            Read the methodology &rarr;
          </Link>
        </div>
      </div>
    </>
  )
}
