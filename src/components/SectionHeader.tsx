import Link from 'next/link'

/**
 * SectionHeader — a labeled section divider with a horizontal rule beneath
 * the title and an optional "view all" link, in the editorial style of a
 * news front page.
 */
export function SectionHeader({
  title,
  href,
  actionLabel = 'View all',
}: {
  title: string
  href?: string
  actionLabel?: string
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b-2 border-neutral-900 pb-2 dark:border-neutral-100">
      <h2 className="font-headline text-2xl font-bold sm:text-3xl">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="shrink-0 text-sm font-semibold text-brand-red hover:underline"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
