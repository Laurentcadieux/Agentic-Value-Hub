/**
 * Analytics — placeholder for production web analytics.
 *
 * No script is emitted by default. This keeps the Hub free of third-party
 * tracking until a provider is explicitly configured. To enable, set a
 * provider via a PUBLIC (non-secret) env var and render the snippet below.
 *
 * IMPORTANT: only `NEXT_PUBLIC_*` variables are exposed to the browser, and
 * only non-secret measurement IDs belong in them. Never place API keys,
 * secrets, or tokens in a `NEXT_PUBLIC_*` variable — see docs/SECURITY.md.
 *
 * Example wiring (Plausible, privacy-respecting, cookieless):
 *   {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
 *     <script
 *       defer
 *       data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
 *       src="https://plausible.io/js/script.js"
 *     />
 *   )}
 */
export function Analytics() {
  return null
}
