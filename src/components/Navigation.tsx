'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ThemeToggle } from './ThemeToggle'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/news', label: 'News' },
  { href: '/use-cases', label: 'Use Cases' },
  { href: '/tools', label: 'Tools' },
  { href: '/ask-ai', label: 'Ask AI' },
  { href: '/idea-lab', label: 'Idea Lab' },
  { href: '/about', label: 'About' },
]

export function Navigation() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span
              aria-hidden="true"
              className="inline-block h-6 w-6 rounded-sm bg-brand-red"
            />
            <span className="font-headline text-lg font-bold tracking-tight sm:text-xl">
              Agentic Value Hub
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right cluster: theme + search + mobile toggle */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Search"
              className="inline-flex items-center justify-center rounded p-2 text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded p-2 text-neutral-300 transition hover:bg-neutral-800 hover:text-white md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                {open ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open ? (
          <nav className="border-t border-neutral-800 py-2 md:hidden" aria-label="Mobile">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  )
}
