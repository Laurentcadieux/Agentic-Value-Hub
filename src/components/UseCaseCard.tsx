import Link from 'next/link'

/**
 * Minimal shape a card needs. Both the Phase 1 demo data (`DemoUseCase`) and
 * the Phase 3 DB DTO (`UseCaseDTO`) satisfy this, so the card renders either.
 */
export interface UseCaseCardData {
  slug: string
  title: string
  industry?: string | null
  businessFunction?: string | null
  problem?: string | null
  description?: string | null
  agentPattern?: string | null
  automationPattern?: string | null
  automationPotential?: number | null
  technologies?: string[] | null
  valueDrivers?: string[] | null
  systems?: string[] | null
  complexity?: string | null
  featured?: boolean
}

function potentialColor(potential: number): string {
  if (potential >= 75) return 'bg-emerald-500'
  if (potential >= 50) return 'bg-amber-500'
  return 'bg-neutral-400'
}

export function UseCaseCard({
  useCase,
  variant = 'default',
}: {
  useCase: UseCaseCardData
  variant?: 'default' | 'compact'
}) {
  const href = `/use-cases/${useCase.slug}`
  const potential = useCase.automationPotential ?? 0
  const technologies = useCase.technologies ?? []

  if (variant === 'compact') {
    return (
      <Link href={href} className="group block">
        <article className="border-l-2 border-brand-red pl-3">
          {useCase.businessFunction ? (
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-blue">
              {useCase.businessFunction}
            </span>
          ) : null}
          <h4 className="mt-1 text-sm font-bold leading-snug group-hover:text-brand-red">
            {useCase.title}
          </h4>
          {useCase.problem ? (
            <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
              {useCase.problem}
            </p>
          ) : null}
        </article>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="group flex h-full flex-col border border-neutral-200 p-5 transition hover:border-neutral-900 hover:shadow-sm dark:border-neutral-800 dark:hover:border-neutral-100"
    >
      <article className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-2">
          {useCase.businessFunction ? (
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-blue">
              {useCase.businessFunction}
            </span>
          ) : null}
          {useCase.businessFunction && useCase.industry ? (
            <span className="font-sans text-xs text-neutral-400">&middot;</span>
          ) : null}
          {useCase.industry ? (
            <span className="font-sans text-xs text-neutral-500 dark:text-neutral-400">
              {useCase.industry}
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 text-xl font-bold leading-snug group-hover:text-brand-red">
          {useCase.title}
        </h3>
        {useCase.description ? (
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-neutral-600 dark:text-neutral-400">
            {useCase.description}
          </p>
        ) : null}

        <div className="mt-4">
          <div className="flex items-center justify-between font-sans text-xs text-neutral-500 dark:text-neutral-400">
            <span>Automation potential</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {useCase.automationPotential != null ? `${potential}%` : '—'}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className={`h-full ${potentialColor(potential)}`}
              style={{ width: `${Math.max(0, Math.min(100, potential))}%` }}
            />
          </div>
        </div>

        {technologies.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="rounded bg-neutral-100 px-2 py-0.5 font-sans text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              >
                {tech}
              </span>
            ))}
          </div>
        ) : null}
      </article>
    </Link>
  )
}
