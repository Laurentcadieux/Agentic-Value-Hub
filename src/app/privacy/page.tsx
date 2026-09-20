import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { siteConfig } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${siteConfig.name} collects, uses, and protects your information.`,
  alternates: { canonical: '/privacy' },
}

/**
 * Privacy Policy page.
 *
 * NOTE: This is a production-quality template, not legal advice. Have it
 * reviewed by qualified counsel before relying on it for live operations.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        kicker="Legal"
        title="Privacy Policy"
        description={`This policy explains what information ${siteConfig.name} collects, how we use it, and the choices you have. It is a template and should be reviewed by counsel before production use.`}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="prose-editorial">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Last updated: September 20, 2026
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">1. Overview</h2>
          <p>
            {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;the Hub&rdquo;) operates a public website at{' '}
            <a
              href={siteConfig.url}
              className="text-brand-red hover:underline"
            >
              {siteConfig.url.replace(/^https?:\/\//, '')}
            </a>
            . We respect your privacy and limit data collection to what is
            needed to run the site, understand aggregate usage, and provide
            the features you request. This policy describes our practices.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            2. Information we collect
          </h2>
          <p>
            <strong>Information you provide.</strong> When you submit an idea,
            use the AI advisor, or contact us, we store the content you submit
            along with metadata such as timestamps and the customer workspace
            it belongs to.
          </p>
          <p>
            <strong>Usage data.</strong> We log standard request information
            (IP address, user agent, requested path, referrer, and response
            status) for security, rate limiting, and reliability. Analytics,
            when enabled, use a privacy-respecting provider that does not set
            cross-site tracking cookies.
          </p>
          <p>
            <strong>Authentication data.</strong> If you sign in, we store an
            authenticated session. Passwords are never stored in plain text.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            3. How we use information
          </h2>
          <ul className="ml-6 list-disc space-y-2">
            <li>To operate, maintain, and improve the Hub.</li>
            <li>To respond to your requests and provide the features you use.</li>
            <li>To detect, prevent, and respond to security and abuse issues.</li>
            <li>
              To aggregate, de-identified usage into product and market
              insights. We do not sell your personal information.
            </li>
          </ul>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            4. Legal bases (GDPR)
          </h2>
          <p>
            For users in the European Economic Area, we process personal data
            on the basis of your consent, the performance of a contract, our
            legitimate interests in operating and securing the site, and
            compliance with legal obligations.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">5. Cookies</h2>
          <p>
            We use a single essential cookie to maintain your authenticated
            session and your light/dark theme preference. We do not use
            cookies for cross-site advertising. When web analytics is enabled,
            it uses cookieless or first-party measurement only.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            6. Data retention
          </h2>
          <p>
            We retain account and submitted content for as long as your
            workspace is active. Request logs are retained for up to 90 days
            for security and abuse analysis unless a longer period is required
            by law.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            7. Your rights
          </h2>
          <p>
            Subject to applicable law, you may request access to, correction
            of, or deletion of your personal data, and you may object to or
            restrict certain processing. To exercise these rights, contact us
            using the details below.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            8. Data security
          </h2>
          <p>
            We protect data in transit with TLS and at rest within the
            production database. Access is least-privilege and logged. See our
            published security documentation for the controls in place.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">
            9. Changes to this policy
          </h2>
          <p>
            We may update this policy from time to time. Material changes will
            be posted on this page with an updated &ldquo;last updated&rdquo;
            date.
          </p>

          <h2 className="mt-8 font-headline text-2xl font-bold">10. Contact</h2>
          <p>
            Questions about this policy or your data can be sent to{' '}
            <a
              href="mailto:privacy@agenticvaluehub.com"
              className="text-brand-red hover:underline"
            >
              privacy@agenticvaluehub.com
            </a>
            .
          </p>
        </div>
      </div>
    </>
  )
}
