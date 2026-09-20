import Link from 'next/link'

/**
 * PageHeader — consistent editorial header for inner listing/detail pages:
 * an optional kicker, a serif title, a description, and an eyebrow breadcrumb
 * back to the section root.
 */
export function PageHeader({
  kicker,
  title,
  description,
  breadcrumb,
}: {
  kicker?: string
  title: string
  description?: string
  breadcrumb?: { label: string; href: string }
}) {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {breadcrumb ? (
          <nav aria-label="Breadcrumb" className="mb-3">
            <Link
              href={breadcrumb.href}
              className="font-sans text-xs font-medium text-neutral-500 hover:text-brand-red dark:text-neutral-400"
            >
              &larr; {breadcrumb.label}
            </Link>
          </nav>
        ) : null}
        {kicker ? (
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            {kicker}
          </p>
        ) : null}
        <h1 className="mt-2 font-headline text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-base text-neutral-600 dark:text-neutral-300">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  )
}
