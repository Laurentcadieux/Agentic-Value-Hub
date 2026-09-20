import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  NEWS_INGEST_API_KEY: z.string().min(1),
  AI_PROVIDER: z.string().min(1),
  AI_API_KEY: z.string().min(1),
  AI_MODEL: z.string().min(1),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment variables')
  }
  return parsed.data
}

/**
 * Validated environment variables. Use `env` in server-side code only.
 * Throws at module load if required vars are missing/invalid.
 */
export const env = loadEnv()
