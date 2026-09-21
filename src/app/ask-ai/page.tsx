import type { Metadata } from 'next'
import Link from 'next/link'
import { AdvisorChat } from '@/components/chat/AdvisorChat'
import { DEMO_CUSTOMER_ID } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Ask the AI Advisor',
  description:
    'Describe a process, problem or opportunity and the AI Advisor helps you turn it into a quantified business case. Choose LEARN, EXPLORE, IDEATE or ASSESS mode.',
  alternates: { canonical: '/ask-ai' },
  robots: { index: false, follow: true },
}

const TOOLS = [
  {
    title: 'ROI Calculator',
    description: 'Estimate 3-year savings, freed headcount, and payback from AI automation.',
    href: 'https://delight.ai/tools/roi-calculator',
    icon: '📊',
    tag: 'Quantify',
  },
  {
    title: 'AI Readiness Assessment',
    description: '10 questions. Get an immediate readiness score with actionable next steps.',
    href: 'https://delight.ai/tools/ai-readiness-intro',
    icon: '✅',
    tag: 'Assess',
  },
  {
    title: 'AI Permission Curve',
    description: 'Map five stages of consumer trust before deploying autonomous AI.',
    href: 'https://delight.ai/tools/ai-permission-curve',
    icon: '📈',
    tag: 'Research',
  },
  {
    title: 'AI CX RFP Template',
    description: 'Structured framework to evaluate AI customer experience vendors.',
    href: 'https://delight.ai/tools/ai-cx-platform-rfp-template',
    icon: '📋',
    tag: 'Template',
  },
  {
    title: 'For You Conversations',
    description: 'Hyper-personalized service where every interaction recognizes the customer.',
    href: 'https://delight.ai/for-you-conversations-fyc',
    icon: '🎯',
    tag: 'Explore',
  },
]

export default function AskAiPage() {
  return (
    <section className="flex flex-col">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            AI Advisor
          </p>
          <h1 className="mt-1 font-headline text-2xl font-bold leading-tight sm:text-3xl">
            Ask the AI Advisor
          </h1>
        </div>
      </header>
      <AdvisorChat customerId={DEMO_CUSTOMER_ID} />

      {/* Tools section */}
      <div className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
              Tools
            </p>
            <h2 className="mt-1 font-headline text-xl font-bold">Free Tools for AI Leaders</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Assess readiness, calculate ROI, understand trust, and build your RFP.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-lg border border-neutral-200 bg-white p-5 transition hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-xl dark:bg-neutral-800">
                    {tool.icon}
                  </span>
                  <span className="rounded-full bg-neutral-900/5 px-2.5 py-0.5 font-sans text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:bg-white/10 dark:text-neutral-400">
                    {tool.tag}
                  </span>
                </div>
                <h3 className="mt-3 font-headline text-base font-bold leading-snug group-hover:text-brand-red">
                  {tool.title}
                </h3>
                <p className="mt-1 flex-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {tool.description}
                </p>
                <div className="mt-3 flex items-center gap-1 font-sans text-sm font-semibold text-brand-red">
                  Open Tool
                  <span aria-hidden="true" className="transition group-hover:translate-x-1">&rarr;</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
