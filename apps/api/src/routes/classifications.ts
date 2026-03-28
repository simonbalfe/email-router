import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { requireAuth } from '../middleware/auth'
import {
  createRule,
  deleteRule,
  getRules,
} from '../services/classification-rules'

export const classificationRoutes = new Hono()
  .get(
    '/classifications',
    describeRoute({
      tags: ['Classifications'],
      summary: 'List classification rules',
      responses: { 200: { description: 'Classification rules' } },
    }),
    requireAuth,
    async (c) => {
      const rules = await getRules()
      return c.json({ success: true, rules })
    },
  )
  .post(
    '/classifications',
    describeRoute({
      tags: ['Classifications'],
      summary: 'Create classification rule',
      responses: { 200: { description: 'Rule created' } },
    }),
    requireAuth,
    async (c) => {
      const body = await c.req.json()
      const { label, reason, forwardTo } = body

      if (!label || !reason) {
        return c.json({ success: false, error: 'Label and reason are required' }, 400)
      }

      const rule = await createRule(label, reason, forwardTo ?? null)
      return c.json({ success: true, rule })
    },
  )
  .delete(
    '/classifications/:id',
    describeRoute({
      tags: ['Classifications'],
      summary: 'Delete classification rule',
      responses: { 200: { description: 'Rule deleted' } },
    }),
    requireAuth,
    async (c) => {
      const id = c.req.param('id')
      await deleteRule(id)
      return c.json({ success: true })
    },
  )
