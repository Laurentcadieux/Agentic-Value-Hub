import Link from 'next/link'

/**
 * Minimal shape a card needs. Both the Phase 1 demo data (`DemoUseCase`) and
 * the Phase 3 DB DTO (`UseCaseDTO`) satisfy this, so the card renders either.
 */
export interface UseCaseCardData {
  slug: string
  title: string
  subtitle?: string | null
  description?: string | null
  problem?: string | null
  industry?: string | null
  businessFunction?: string | null
  agentPattern?: string | null
  automationPattern?: string | null
  automationPotential?: number | null
  endToEndAutomationSuccess?: number | null
  agenticPercentage?: number | null
  technologies?: string[] | null
  techStack?: string[] | null
  boatCapabilities?: string[] | null
  valueDrivers?: string[] | null
  systems?: string[] | null
  complexity?: string | null
  imageUrl?: string | null
  author?: string | null
  readingTimeMinutes?: number | null
  isFeatured?: boolean
  ctaLabel?: string | null
  ctaUrl?: string | null
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
  const techStack = useCase.techStack ?? []
  const boatCapabilities = useCase.boatCapabilities ?? []

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

  // Awesomer-style: large image card with CTA button
  return (
    <article className="group overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      {/* Image */}
      {useCase.imageUrl ? (
        <Link href={href} className="block overflow-hidden">
          <img
            src={useCase.imageUrl}
            alt={useCase.title}
            className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      ) : (
        <Link href={href} className="block">
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
            <span className="font-headline text-4xl font-bold text-neutral-300 dark:text-neutral-700">
              {useCase.title.charAt(0)}
            </span>
          </div>
        </Link>
      )}

      {/* Body */}
      <div className="p-5">
        {/* Category badge + featured */}
        <div className="flex items-center justify-between">
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
          {useCase.isFeatured ? (
            <span className="rounded bg-brand-red/10 px-2 py-0.5 text-xs font-bold text-brand-red">
              ★
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="mt-2 font-headline text-lg font-bold leading-snug group-hover:text-brand-red">
          <Link href={href}>{useCase.title}</Link>
        </h3>

        {/* Subtitle */}
        {useCase.subtitle ? (
          <p className="mt-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {useCase.subtitle}
          </p>
        ) : null}

        {/* Description */}
        {useCase.description ? (
          <p className="mt-2 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
            {useCase.description}
          </p>
        ) : useCase.problem ? (
          <p className="mt-2 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
            {useCase.problem}
          </p>
        ) : null}

        {/* Byline */}
        {(useCase.author || useCase.readingTimeMinutes) && (
          <div className="mt-3 flex items-center gap-2 font-sans text-xs text-neutral-400 dark:text-neutral-500">
            {useCase.author && <span>{useCase.author}</span>}
            {useCase.author && useCase.readingTimeMinutes && <span>&middot;</span>}
            {useCase.readingTimeMinutes && <span>{useCase.readingTimeMinutes} min read</span>}
          </div>
        )}

        {/* Metrics bars */}
        {useCase.automationPotential != null && (
          <div className="mt-3 space-y-2">
            {/* Automation potential */}
            <div>
              <div className="flex items-center justify-between font-sans text-xs text-neutral-500 dark:text-neutral-400">
                <span>Automation potential</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {potential}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className={`h-full ${potentialColor(potential)}`}
                  style={{ width: `${Math.max(0, Math.min(100, potential))}%` }}
                />
              </div>
            </div>
            {/* End-to-end automation success */}
            {useCase.endToEndAutomationSuccess != null && (
              <div>
                <div className="flex items-center justify-between font-sans text-xs text-neutral-500 dark:text-neutral-400">
                  <span>End-to-end success</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {useCase.endToEndAutomationSuccess}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className="h-full bg-brand-blue"
                    style={{ width: `${Math.max(0, Math.min(100, useCase.endToEndAutomationSuccess))}%` }}
                  />
                </div>
              </div>
            )}
            {/* Agentic % (AI handling unstructured data) */}
            {useCase.agenticPercentage != null && (
              <div>
                <div className="flex items-center justify-between font-sans text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Agentic (unstructured data)</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {useCase.agenticPercentage}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className="h-full bg-brand-red"
                    style={{ width: `${Math.max(0, Math.min(100, useCase.agenticPercentage))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Technologies */}
        {technologies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {technologies.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded bg-neutral-100 px-2 py-0.5 font-sans text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Tech stack */}
        {techStack.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded bg-indigo-50 px-2 py-0.5 font-sans text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* BOAT capabilities */}
        {boatCapabilities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {boatCapabilities.slice(0, 4).map((cap) => (
              <span
                key={cap}
                className="rounded bg-sky-50 px-2 py-0.5 font-sans text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
              >
                BOAT: {cap}
              </span>
            ))}
          </div>
        )}

        {/* CTA button */}
        <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
          <Link
            href={href}
            className="inline-flex items-center gap-1 font-sans text-sm font-semibold text-brand-red hover:text-red-700"
          >
            Check It Out
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
