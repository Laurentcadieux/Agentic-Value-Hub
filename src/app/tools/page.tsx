import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Tools — Agentic Value Hub',
  description:
    'Free tools to assess your AI readiness, calculate ROI, understand consumer trust, and build your AI CX RFP.',
  alternates: { canonical: '/tools' },
}

export default function ToolsPage() {
  return (
    <>
      <PageHeader
        kicker="Tools"
        title="Free Tools for AI Leaders"
        description="Assess your readiness, calculate ROI, understand consumer trust, and build your RFP — practical tools for enterprise AI decision-making."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {/* ROI Calculator */}
          <ToolCard
            title="ROI Calculator"
            description="Estimate your AI customer experience platform ROI: see 3-year savings, freed agent headcount, and payback period from AI-powered automation."
            href="https://delight.ai/tools/roi-calculator"
            icon="📊"
            tag="Quantify"
            gradient="from-emerald-500/10 to-teal-500/10"
          />

          {/* AI Readiness Assessment */}
          <ToolCard
            title="AI Readiness Assessment"
            description="Answer 10 questions about your current state and receive an immediate readiness score with actionable feedback and next steps for AI agent deployment."
            href="https://delight.ai/tools/ai-readiness-intro"
            icon="✅"
            tag="Assess"
            gradient="from-blue-500/10 to-indigo-500/10"
          />

          {/* AI Permission Curve */}
          <ToolCard
            title="AI Permission Curve"
            description="Map five stages of consumer trust — from answering questions to acting autonomously. Know where your customers actually are before deploying AI."
            href="https://delight.ai/tools/ai-permission-curve"
            icon="📈"
            tag="Research"
            gradient="from-purple-500/10 to-pink-500/10"
          />

          {/* RFP Template */}
          <ToolCard
            title="AI CX Platform RFP Template"
            description="A structured framework to evaluate AI customer experience vendors on what matters. Move faster, stay aligned, and get to a confident decision."
            href="https://delight.ai/tools/ai-cx-platform-rfp-template"
            icon="📋"
            tag="Template"
            gradient="from-amber-500/10 to-orange-500/10"
          />

          {/* For You Conversations */}
          <ToolCard
            title="For You Conversations"
            description="Hyper-personalized service where every interaction recognizes history, preferences, and intent. Understand every customer with Agent Memory Platform."
            href="https://delight.ai/for-you-conversations-fyc"
            icon="🎯"
            tag="Explore"
            gradient="from-rose-500/10 to-red-500/10"
          />
        </div>
      </div>
    </>
  )
}

function ToolCard({
  title,
  description,
  href,
  icon,
  tag,
  gradient,
}: {
  title: string
  description: string
  href: string
  icon: string
  tag: string
  gradient: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-gradient-to-br ${gradient} p-6 transition hover:shadow-lg dark:border-neutral-800`}
    >
      <div className="flex items-center justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-2xl shadow-sm dark:bg-neutral-900">
          {icon}
        </span>
        <span className="rounded-full bg-neutral-900/5 px-3 py-1 font-sans text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
          {tag}
        </span>
      </div>

      <h2 className="mt-4 font-headline text-xl font-bold leading-snug group-hover:text-brand-red">
        {title}
      </h2>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-1 font-sans text-sm font-semibold text-brand-red">
        Open Tool
        <span aria-hidden="true" className="transition group-hover:translate-x-1">&rarr;</span>
      </div>
    </a>
  )
}
