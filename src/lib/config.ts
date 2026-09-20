/**
 * Non-secret runtime configuration shared by server and client code.
 *
 * Heavy modules (Prisma, AI provider) must NOT be imported here so that
 * importing `config` from a server component does not pull the database
 * client into the static-render module graph.
 */

/** Demo customer id used when no authenticated customer context exists. */
export const DEMO_CUSTOMER_ID =
  process.env.DEMO_CUSTOMER_ID ?? '00000000-0000-0000-0000-000000000000'

/** Optional demo user id (the seeded admin user's id, if known). */
export const DEMO_USER_ID: string | undefined = process.env.DEMO_USER_ID

/** Max user message length accepted by the advisor (prompt-injection / cost guard). */
export const MAX_USER_MESSAGE_CHARS = 4000

/** Max assistant message length the server will persist (output-validation guard). */
export const MAX_ASSISTANT_MESSAGE_CHARS = 6000
