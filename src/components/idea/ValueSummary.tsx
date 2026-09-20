/**
 * ValueSummary — displays the ROI / value-engine output for an idea.
 * Pure presentational component; safe in server and client contexts.
 */

import type { ValueResult } from '@/lib/value/calculate'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const pct = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 0,
})

function Row({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 py-2 last:border-0 dark:border-neutral-800">
      <span className="text-sm text-neutral-600 dark:text-neutral-300">{label}</span>
      <span
        className={
          emphasis
            ? 'font-headline text-lg font-bold text-brand-red'
            : 'text-sm font-semibold text-neutral-900 dark:text-neutral-100'
        }
      >
        {value}
      </span>
    </div>
  )
}

export function ValueSummary({ result }: { result: ValueResult }) {
  return (
    <section
      aria-label="Value assessment"
      className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/60"
    >
      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-brand-red">
        ROI / Value assessment
      </h3>
      <div className="mt-3">
        <Row label="Labor impact (annual)" value={currency.format(result.laborImpact)} />
        <Row label="Error-reduction impact (annual)" value={currency.format(result.errorImpact)} />
        <Row label="Combined annual impact" value={currency.format(result.annualImpact)} />
        <Row label="Probability factor" value={pct.format(result.probability)} />
        <Row label="Time-horizon factor" value={result.timeHorizonFactor.toFixed(2)} />
        <Row
          label="Opportunity value"
          value={currency.format(result.value)}
          emphasis
        />
      </div>
    </section>
  )
}
