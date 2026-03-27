import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { requireAuth } from '../middleware/auth'
import {
  getProcessedEmails,
  isListening,
  startListener,
  stopListener,
} from '../services/email-router'

export const emailRoutes = new Hono()
  .get(
    '/emails',
    describeRoute({
      tags: ['Emails'],
      summary: 'List processed emails',
      responses: { 200: { description: 'Processed emails' } },
    }),
    requireAuth,
    async (c) => {
      const emails = await getProcessedEmails()
      return c.json({ success: true, emails })
    },
  )
  .get(
    '/emails/status',
    describeRoute({
      tags: ['Emails'],
      summary: 'Listener status',
      responses: { 200: { description: 'Listener running state' } },
    }),
    requireAuth,
    async (c) => {
      return c.json({ success: true, listening: isListening() })
    },
  )
  .post(
    '/emails/start',
    describeRoute({
      tags: ['Emails'],
      summary: 'Start email listener',
      responses: { 200: { description: 'Listener started' } },
    }),
    requireAuth,
    async (c) => {
      if (isListening()) {
        return c.json({ success: false, error: 'Already listening' }, 409)
      }
      startListener().catch((err) => console.error('[EMAIL] Listener error:', err))
      return c.json({ success: true, message: 'Listener started' })
    },
  )
  .post(
    '/emails/stop',
    describeRoute({
      tags: ['Emails'],
      summary: 'Stop email listener',
      responses: { 200: { description: 'Listener stopped' } },
    }),
    requireAuth,
    async (c) => {
      await stopListener()
      return c.json({ success: true, message: 'Listener stopped' })
    },
  )
