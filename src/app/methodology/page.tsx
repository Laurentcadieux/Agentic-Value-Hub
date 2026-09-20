import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Methodology',
  description:
    'How the Agentic Value Hub assesses use cases, scores automation potential and builds a defensible business case.',
  alternates: { canonical: '/methodology' },
}

const steps: { number: string; title: string; body: string }[] = [
  {
    number: '01',
    title: 'Frame the opportunity',
    body: 'Start from a real process, problem or opportunity. Describe the work, who does it today, the volume and the pain points.',
  },
  {
    number: '02',
    title: 'Match to a use case',
    body: 'Find the catalog use case that fits: the agent pattern, the automation pattern, the systems involved and the value drivers.',
  },
  {
    number: '03',
    title: 'Estimate automation potential',
    body: 'Score how much of the work an agent can reliably take on today, grounded in the capability frontier and your constraints.',
  },
  {
    number: '04',
    title: 'Quantify the value',
    body: 'Translate automation potential into the value drivers that matter to you: labor savings, cycle time, error reduction and experience.',
  },
  {
    number: '05',
    title: 'Design the controls',
    body: 'Define the guardrails: confidence thresholds, human approval gates, audit logging and the principle of least privilege for tools.',
  },
]

export default function MethodologyPage() {
  return (
    <>
      <PageHeader
        kicker="Methodology"
        title="How we assess value"
        description="A use case is only worth pursuing if the value is real and the risk is bounded. This is how we evaluate both."
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="prose-editorial">
          <p>
            Every entry on the Hub is built the same way. We start from a
            concrete process, match it to a proven agent pattern, estimate how
            much of the work an agent can take on, translate that into value
            drivers and spell out the controls required to run safely.
          </p>
        </div>

        <ol className="mt-10 space-y-6">
          {steps.map((step) => (
            <li
              key={step.number}
              className="grid grid-cols-12 gap-4 border-b border-neutral-200 pb-6 last:border-0 dark:border-neutral-800"
            >
              <div className="col-span-2 font-headline text-3xl font-bold text-brand-red sm:col-span-1">
                {step.number}
              </div>
              <div className="col-span-10 sm:col-span-11">
                <h2 className="font-headline text-xl font-bold">{step.title}</h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded border border-neutral-200 p-6 dark:border-neutral-800">
          <h2 className="font-headline text-xl font-bold">
            The value score
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            The value score combines automation potential with the weighted
            value drivers for a use case. It is a directional indicator, not a
            guarantee &mdash; every business case is refined against your real
            volumes, costs and constraints before it is acted on.
          </p>
        </div>
      </div>
    </>
  )
}
