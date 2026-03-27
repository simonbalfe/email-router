import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { z } from 'zod'

const currentDir = dirname(fileURLToPath(import.meta.url))
const rootEnvPath = resolve(currentDir, '../../../.env')

loadEnv(existsSync(rootEnvPath) ? { path: rootEnvPath } : undefined)

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  APP_URL: z.url(),
  OPENROUTER_API_KEY: z.string().min(1),
  IMAP_HOST: z.string().min(1),
  IMAP_PORT: z.coerce.number().default(993),
  IMAP_USER: z.string().min(1),
  IMAP_PASS: z.string().min(1),
  IMAP_FOLDER: z.string().default('INBOX'),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  FORWARD_TO: z.string().min(1),
})

const parsed = serverEnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

const env = parsed.data

export const config = {
  NODE_ENV: env.NODE_ENV,
  DATABASE_URL: env.DATABASE_URL,
  BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
  APP_URL: env.APP_URL,
  OPENROUTER_API_KEY: env.OPENROUTER_API_KEY,
  imap: {
    host: env.IMAP_HOST,
    port: env.IMAP_PORT,
    user: env.IMAP_USER,
    pass: env.IMAP_PASS,
    folder: env.IMAP_FOLDER,
  },
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  forwardTo: env.FORWARD_TO,
}
