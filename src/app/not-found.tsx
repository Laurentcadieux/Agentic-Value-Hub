import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="font-sans text-sm font-bold uppercase tracking-[0.2em] text-brand-red">
        404
      </p>
      <h1 className="mt-3 font-headline text-4xl font-bold sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 text-neutral-600 dark:text-neutral-300">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Back to the front page &rarr;
      </Link>
    </div>
  )
}
