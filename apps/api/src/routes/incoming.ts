import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { requireAuth } from '../middleware/auth'
import {
  createIncomingAccount,
  deleteIncomingAccount,
  getIncomingAccounts,
  updateIncomingAccount,
} from '../services/incoming-accounts'

export const incomingRoutes = new Hono()
  .get(
    '/incoming',
    describeRoute({
      tags: ['Incoming'],
      summary: 'List incoming IMAP accounts',
      responses: { 200: { description: 'Incoming accounts' } },
    }),
    requireAuth,
    async (c) => {
      const rows = await getIncomingAccounts()
      const accounts = rows.map((r) => ({
        id: r.id,
        label: r.label,
        email: r.email,
        password: r.password,
        imap_host: r.imapHost,
        imap_port: r.imapPort,
        folder: r.folder,
        department: r.department,
        enabled: r.enabled,
      }))
      return c.json(accounts)
    },
  )
  .post(
    '/incoming',
    describeRoute({
      tags: ['Incoming'],
      summary: 'Create incoming account',
      responses: { 200: { description: 'Account created' } },
    }),
    requireAuth,
    async (c) => {
      const body = await c.req.json()
      const account = await createIncomingAccount(body)
      return c.json(account)
    },
  )
  .put(
    '/incoming/:id',
    describeRoute({
      tags: ['Incoming'],
      summary: 'Update incoming account',
      responses: { 200: { description: 'Account updated' } },
    }),
    requireAuth,
    async (c) => {
      const id = c.req.param('id')
      const body = await c.req.json()
      const account = await updateIncomingAccount(id, body)
      return c.json(account)
    },
  )
  .delete(
    '/incoming/:id',
    describeRoute({
      tags: ['Incoming'],
      summary: 'Delete incoming account',
      responses: { 200: { description: 'Account deleted' } },
    }),
    requireAuth,
    async (c) => {
      const id = c.req.param('id')
      await deleteIncomingAccount(id)
      return c.json({ ok: true })
    },
  )
