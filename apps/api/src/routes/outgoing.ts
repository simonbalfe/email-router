import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { requireAuth } from '../middleware/auth'
import {
  createOutgoingAccount,
  deleteOutgoingAccount,
  getOutgoingAccounts,
  updateOutgoingAccount,
} from '../services/outgoing-accounts'

export const outgoingRoutes = new Hono()
  .get(
    '/outgoing',
    describeRoute({
      tags: ['Outgoing'],
      summary: 'List outgoing SMTP accounts',
      responses: { 200: { description: 'Outgoing accounts' } },
    }),
    requireAuth,
    async (c) => {
      const rows = await getOutgoingAccounts()
      const accounts = rows.map((r) => ({
        id: r.id,
        label: r.label,
        email: r.email,
        password: r.password,
        smtp_host: r.smtpHost,
        smtp_port: r.smtpPort,
        routing_condition: r.routingCondition,
        enabled: r.enabled,
      }))
      return c.json(accounts)
    },
  )
  .post(
    '/outgoing',
    describeRoute({
      tags: ['Outgoing'],
      summary: 'Create outgoing account',
      responses: { 200: { description: 'Account created' } },
    }),
    requireAuth,
    async (c) => {
      const body = await c.req.json()
      const account = await createOutgoingAccount(body)
      return c.json(account)
    },
  )
  .put(
    '/outgoing/:id',
    describeRoute({
      tags: ['Outgoing'],
      summary: 'Update outgoing account',
      responses: { 200: { description: 'Account updated' } },
    }),
    requireAuth,
    async (c) => {
      const id = c.req.param('id')
      const body = await c.req.json()
      const account = await updateOutgoingAccount(id, body)
      return c.json(account)
    },
  )
  .delete(
    '/outgoing/:id',
    describeRoute({
      tags: ['Outgoing'],
      summary: 'Delete outgoing account',
      responses: { 200: { description: 'Account deleted' } },
    }),
    requireAuth,
    async (c) => {
      const id = c.req.param('id')
      await deleteOutgoingAccount(id)
      return c.json({ ok: true })
    },
  )
