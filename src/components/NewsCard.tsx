import Link from 'next/link'
import type { DemoNewsItem } from '@/lib/demo-data'
import { CategoryBadge } from './CategoryBadge'
import { DemoImage } from './DemoImage'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

type NewsCardVariant = 'featured' | 'default' | 'compact' | 'horizontal'

export function NewsCard({
  item,
  variant = 'default',
}: {
  item: DemoNewsItem
  variant?: NewsCardVariant
}) {
  const href = `/news/${item.slug}`
  const category = item.categories[0] ?? 'Agentic AI'

  if (variant === 'featured') {
    return (
      <Link href={href} className="group block">
        <article>
          <div className="relative overflow-hidden rounded">
            <DemoImage
              src={item.imageUrl}
              alt={item.headline}
              className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:opacity-90"
            />
          </div>
          <div className="mt-4">
            <CategoryBadge category={category} />
            <h3 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              {item.headline}
            </h3>
            <p className="mt-3 max-w-2xl text-base text-neutral-600 dark:text-neutral-300">
              {item.summary}
            </p>
            <div className="mt-3 flex items-center gap-2 font-sans text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {item.sourceName}
              </span>
              <span aria-hidden="true">&middot;</span>
              <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
            </div>
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
              src={item.imageUrl}
              alt={item.headline}
              className="h-16 w-20 rounded object-cover"
            />
          </div>
          <div className="min-w-0">
            <CategoryBadge category={category} />
            <h4 className="mt-1 line-clamp-2 text-sm font-bold leading-snug group-hover:text-brand-red">
              {item.headline}
            </h4>
            <time
              dateTime={item.publishedAt}
              className="mt-1 block font-sans text-xs text-neutral-500 dark:text-neutral-400"
            >
              {formatDate(item.publishedAt)}
            </time>
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
              src={item.imageUrl}
              alt={item.headline}
              className="aspect-[16/9] w-full rounded object-cover"
            />
          </div>
          <div className="col-span-8 sm:col-span-7">
            <CategoryBadge category={category} />
            <h3 className="mt-1 text-lg font-bold leading-snug group-hover:text-brand-red sm:text-xl">
              {item.headline}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
              {item.summary}
            </p>
            <time
              dateTime={item.publishedAt}
              className="mt-2 block font-sans text-xs text-neutral-500 dark:text-neutral-400"
            >
              {item.sourceName} &middot; {formatDate(item.publishedAt)}
            </time>
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
          src={item.imageUrl}
          alt={item.headline}
          className="aspect-[16/9] w-full rounded object-cover transition duration-300 group-hover:opacity-90"
        />
        <div className="mt-3">
          <CategoryBadge category={category} />
          <h3 className="mt-1 text-lg font-bold leading-snug group-hover:text-brand-red">
            {item.headline}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
            {item.summary}
          </p>
          <time
            dateTime={item.publishedAt}
            className="mt-2 block font-sans text-xs text-neutral-500 dark:text-neutral-400"
          >
            {item.sourceName} &middot; {formatDate(item.publishedAt)}
          </time>
        </div>
      </article>
    </Link>
  )
}
