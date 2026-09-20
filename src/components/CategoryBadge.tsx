import type React from 'react'

/**
 * Category color map — La Presse-style colored category labels. Colors are
 * applied as text color over an uppercase, tracked, bold label so they read
 * as editorial kickers rather than filled chips.
 */
const categoryColors: Record<string, string> = {
  'Agentic AI': 'text-brand-red',
  'Enterprise Automation': 'text-brand-blue',
  'Use Cases': 'text-emerald-600 dark:text-emerald-400',
  Research: 'text-purple-600 dark:text-purple-400',
  Industries: 'text-amber-600 dark:text-amber-400',
  Markets: 'text-cyan-600 dark:text-cyan-400',
  Technology: 'text-rose-600 dark:text-rose-400',
  Methodology: 'text-slate-600 dark:text-slate-400',
}

export function CategoryBadge({
  category,
  className = '',
}: {
  category: string
  className?: string
}) {
  const color = categoryColors[category] ?? 'text-brand-red'
  return (
    <span
      className={`font-sans text-xs font-bold uppercase tracking-wider ${color} ${className}`}
    >
      {category}
    </span>
  )
}
