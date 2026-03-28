import { sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { requireAuth } from '../middleware/auth'
import { db } from '../db'
import { incomingAccount, processedEmail } from '../db/schema'
import { isListening } from '../services/email-router'

export const statusRoutes = new Hono()
  .get(
    '/status',
    describeRoute({
      tags: ['Status'],
      summary: 'System status and worker info',
      responses: { 200: { description: 'Status response' } },
    }),
    requireAuth,
    async (c) => {
      const accounts = await db.select().from(incomingAccount)

      const countRows = await db
        .select({
          label: processedEmail.label,
          count: sql<number>`count(*)::int`,
        })
        .from(processedEmail)
        .groupBy(processedEmail.label)

      const counts: Record<string, number> = {}
      for (const row of countRows) {
        counts[row.label] = row.count
      }

      const forwardedRows = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(processedEmail)
        .where(sql`${processedEmail.forwarded} = true`)

      const listening = isListening()

      const workers = accounts.map((a) => ({
        email: a.email,
        folder: a.folder,
        department: a.department,
        status: listening && a.enabled ? 'connected' : a.enabled ? 'idle' : 'idle',
        error: '',
        is_timeout: false,
        last_polled_at: listening ? new Date().toISOString() : null,
        counts: {
          request: counts.request ?? 0,
          spam: counts.spam ?? 0,
          irrelevant: counts.irrelevant ?? 0,
        },
      }))

      return c.json({
        workers_total: accounts.length,
        workers_connected: listening ? accounts.filter((a) => a.enabled).length : 0,
        workers_error: 0,
        total_counts: {
          request: counts.request ?? 0,
          spam: counts.spam ?? 0,
          irrelevant: counts.irrelevant ?? 0,
        },
        forwarded_total: forwardedRows[0]?.count ?? 0,
        stats_since: null,
        poll_interval: 30,
        cycle_start_at: null,
        cycle_end_at: null,
        workers,
      })
    },
  )
  .post(
    '/admin/reset-stats',
    describeRoute({
      tags: ['Status'],
      summary: 'Reset classification statistics',
      responses: { 200: { description: 'Stats reset' } },
    }),
    requireAuth,
    async (c) => {
      await db.delete(processedEmail)
      return c.json({ ok: true })
    },
  )
