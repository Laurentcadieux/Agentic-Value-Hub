import Link from 'next/link'
import type { NewsCardItem } from '@/types/news'
import { CategoryBadge } from './CategoryBadge'
import { DemoImage } from './DemoImage'

function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function publishedLabel(item: NewsCardItem): string | null {
  if (!item.publishedAt) return null
  try {
    return formatDate(item.publishedAt)
  } catch {
    return null
  }
}

type NewsCardVariant = 'featured' | 'default' | 'compact' | 'horizontal'

/**
 * Byline rendered under/over the headline for the variants that show one.
 * Shows `author` (when present), a "X min read" estimate (when present), and
 * the publication date (when present), joined by middle dots.
 */
function Byline({ item, className }: { item: NewsCardItem; className?: string }) {
  const parts: string[] = []
  if (item.author) parts.push(item.author)
  if (item.readingTimeMinutes) parts.push(`${item.readingTimeMinutes} min read`)
  const date = publishedLabel(item)
  if (date) parts.push(date)

  if (parts.length === 0) return null

  return (
    <div className={className ?? 'mt-3 flex items-center gap-2 font-sans text-xs text-neutral-500 dark:text-neutral-400'}>
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 ? <span aria-hidden="true">&middot;</span> : null}
          <span>{part}</span>
        </span>
      ))}
    </div>
  )
}

/** Optional subtitle rendered below the headline in smaller text. */
function Subtitle({ item, className }: { item: NewsCardItem; className?: string }) {
  if (!item.subtitle) return null
  return <p className={className ?? 'mt-2 text-sm text-neutral-600 dark:text-neutral-400'}>{item.subtitle}</p>
}

export function NewsCard({
  item,
  variant = 'default',
}: {
  item: NewsCardItem
  variant?: NewsCardVariant
}) {
  const href = `/news/${item.slug}`
  const category = (item.categories && item.categories[0]) ?? 'Agentic AI'

  if (variant === 'featured') {
    return (
      <Link href={href} className="group block">
        <article>
          <div className="relative overflow-hidden rounded">
            <DemoImage
              src={item.imageUrl ?? ''}
              alt={item.headline}
              className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:opacity-90"
            />
          </div>
          <div className="mt-4">
            <CategoryBadge category={category} />
            <h3 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              {item.headline}
            </h3>
            <Subtitle item={item} className="mt-2 max-w-2xl text-base text-neutral-600 dark:text-neutral-300" />
            <p className="mt-3 max-w-2xl text-base text-neutral-600 dark:text-neutral-300">
              {item.summary}
            </p>
            <Byline item={item} />
          </div>
        </article>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={href} className="group block">
        <article className="flex gap-3">
          <div className="shrink-0">
            <DemoImage
              src={item.imageUrl ?? ''}
              alt={item.headline}
              className="h-16 w-20 rounded object-cover"
            />
          </div>
          <div className="min-w-0">
            <CategoryBadge category={category} />
            <h4 className="mt-1 line-clamp-2 text-sm font-bold leading-snug group-hover:text-brand-red">
              {item.headline}
            </h4>
            {item.publishedAt ? (
              <time
                dateTime={new Date(item.publishedAt).toISOString()}
                className="mt-1 block font-sans text-xs text-neutral-500 dark:text-neutral-400"
              >
                {publishedLabel(item)}
              </time>
            ) : null}
          </div>
        </article>
      </Link>
    )
  }

  if (variant === 'horizontal') {
    return (
      <Link href={href} className="group block">
        <article className="grid grid-cols-12 gap-4 border-b border-neutral-200 pb-6 last:border-0 dark:border-neutral-800">
          <div className="col-span-4 sm:col-span-5">
            <DemoImage
              src={item.imageUrl ?? ''}
              alt={item.headline}
              className="aspect-[16/9] w-full rounded object-cover"
            />
          </div>
          <div className="col-span-8 sm:col-span-7">
            <CategoryBadge category={category} />
            <h3 className="mt-1 text-lg font-bold leading-snug group-hover:text-brand-red sm:text-xl">
              {item.headline}
            </h3>
            <Subtitle item={item} className="mt-1 text-sm text-neutral-600 dark:text-neutral-400" />
            <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
              {item.summary}
            </p>
            <Byline item={item} className="mt-2 block font-sans text-xs text-neutral-500 dark:text-neutral-400" />
          </div>
        </article>
      </Link>
    )
  }

  // default
  return (
    <Link href={href} className="group block">
      <article>
        <DemoImage
          src={item.imageUrl ?? ''}
          alt={item.headline}
          className="aspect-[16/9] w-full rounded object-cover transition duration-300 group-hover:opacity-90"
        />
        <div className="mt-3">
          <CategoryBadge category={category} />
          <h3 className="mt-1 text-lg font-bold leading-snug group-hover:text-brand-red">
            {item.headline}
          </h3>
          <Subtitle item={item} className="mt-1 text-sm text-neutral-600 dark:text-neutral-400" />
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
            {item.summary}
          </p>
          <Byline item={item} className="mt-2 block font-sans text-xs text-neutral-500 dark:text-neutral-400" />
        </div>
      </article>
    </Link>
  )
}
