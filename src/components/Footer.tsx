import Link from 'next/link'

const footerSections: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'News', href: '/news' },
      { label: 'Use Cases', href: '/use-cases' },
      { label: 'Industries', href: '/industries' },
      { label: 'Business Functions', href: '/functions' },
      { label: 'Technologies', href: '/technologies' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { label: 'Ask the AI Advisor', href: '/ask-ai' },
      { label: 'Idea Lab', href: '/idea-lab' },
      { label: 'Methodology', href: '/methodology' },
    ],
  },
  {
    title: 'About',
    links: [{ label: 'About the Hub', href: '/about' }],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="font-headline text-xl font-bold">
              Agentic Value Hub
            </Link>
            <p className="mt-3 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
              Turn AI agents into business value. Track the market, discover use
              cases and quantify your own opportunities.
            </p>
          </div>
          {footerSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-700 hover:text-brand-red dark:text-neutral-300 dark:hover:text-brand-red"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-neutral-200 pt-6 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Agentic Value Hub. All rights reserved.</p>
          <p className="font-medium">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              DEMO DATA
            </span>{' '}
            Phase 1 public website &mdash; content is illustrative.
          </p>
        </div>
      </div>
    </footer>
  )
}
