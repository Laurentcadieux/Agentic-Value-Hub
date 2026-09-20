import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { siteConfig } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `The terms under which ${siteConfig.name} is made available.`,
  alternates: { canonical: '/terms' },
}

/**
 * Terms of Service page.
 *
 * NOTE: This is a production-quality template, not legal advice. Have it
 * reviewed by qualified counsel before relying on it for live operations.
 */
export default function TermsPage() {
  return (
    <>
      <PageHeader
        kicker="Legal"
        title="Terms of Service"
        description={`These terms govern your use of ${siteConfig.name}. By using the Hub you agree to them. This is a template and should be reviewed by counsel before production use.`}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="prose-editorial">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Last updated: September 20, 2026
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">1. Acceptance</h2>
          <p>
            By accessing or using {siteConfig.name} (the &ldquo;Hub&rdquo;),
            you agree to these Terms of Service and to our{' '}
            <a href="/privacy" className="text-brand-red hover:underline">
              Privacy Policy
            </a>
            . If you do not agree, do not use the Hub.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            2. Eligibility
          </h2>
          <p>
            You must be able to form a binding contract under applicable law.
            If you use the Hub on behalf of an organization, you represent
            that you are authorized to bind that organization.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            3. Your content
          </h2>
          <p>
            You retain ownership of content you submit to the Hub. You grant
            us a non-exclusive, worldwide, royalty-free license to host, store
            and process that content solely to provide the Hub to you. You are
            responsible for the accuracy and lawfulness of what you submit and
            for having any rights needed to submit it.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            4. Acceptable use
          </h2>
          <ul className="ml-6 list-disc space-y-2">
            <li>
              Do not attempt to disrupt, overload, or reverse-engineer the
              Hub.
            </li>
            <li>Do not submit unlawful, infringing, or harmful content.</li>
            <li>
              Do not attempt to access data, accounts, or systems you are not
              authorized to access.
            </li>
            <li>
              Respect rate limits and automated access controls. Abuse is
              blocked and may be reported.
            </li>
          </ul>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            5. API access
          </h2>
          <p>
            Programmatic access to public API routes is provided subject to
            rate limits and, where required, authentication. We may modify,
            suspend, or revoke access for abuse or for operational reasons
            with or without notice.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            6. Disclaimers
          </h2>
          <p>
            The Hub is provided &ldquo;as is&rdquo; without warranties of any
            kind. Editorial and AI-generated content is for information only
            and is not professional, legal, or investment advice. We do not
            guarantee the accuracy, completeness, or availability of the Hub.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            7. Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by law, {siteConfig.name} and its
            operators are not liable for any indirect, incidental, or
            consequential damages arising from your use of, or inability to
            use, the Hub.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            8. Changes to the service and terms
          </h2>
          <p>
            We may change or discontinue features of the Hub at any time. We
            may update these terms from time to time; material changes will
            be posted on this page with an updated &ldquo;last updated&rdquo;
            date. Continued use after a change constitutes acceptance.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            9. Governing law
          </h2>
          <p>
            These terms are governed by the laws of the jurisdiction in which
            the Hub operator is established, without regard to conflict-of-law
            principles.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">10. Contact</h2>
          <p>
            Questions about these terms can be sent to{' '}
            <a
              href="mailto:legal@agenticvaluehub.com"
              className="text-brand-red hover:underline"
            >
              legal@agenticvaluehub.com
            </a>
            .
          </p>
        </div>
      </div>
    </>
  )
}
