import { eq } from 'drizzle-orm'
import { db } from '../db'
import { classificationRule } from '../db/schema'

export async function getRules() {
  return db.select().from(classificationRule).orderBy(classificationRule.createdAt)
}

export async function createRule(label: string, reason: string, forwardTo: string | null) {
  const id = crypto.randomUUID()
  await db.insert(classificationRule).values({ id, label, reason, forwardTo })
  return { id, label, reason, forwardTo }
}

export async function deleteRule(id: string) {
  await db.delete(classificationRule).where(eq(classificationRule.id, id))
}

export async function getRulesAsInstructions(): Promise<string> {
  const rules = await getRules()
  if (rules.length === 0) return ''

  const lines = rules.map(
    (r) =>
      `- If the email matches: "${r.reason}" → classify as "${r.label}"${r.forwardTo ? ` and forward to ${r.forwardTo}` : ''}`,
  )

  return `\n\nCustom classification rules (these take priority):\n${lines.join('\n')}`
}
