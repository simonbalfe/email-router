import { eq } from 'drizzle-orm'
import { db } from '../db'
import { outgoingAccount } from '../db/schema'

export async function getOutgoingAccounts() {
  return db.select().from(outgoingAccount).orderBy(outgoingAccount.createdAt)
}

export async function createOutgoingAccount(data: {
  label: string
  email: string
  password: string
  smtp_host: string
  smtp_port: number
  routing_condition: string
  enabled: boolean
}) {
  const id = crypto.randomUUID()
  const row = {
    id,
    label: data.label,
    email: data.email,
    password: data.password,
    smtpHost: data.smtp_host,
    smtpPort: data.smtp_port,
    routingCondition: data.routing_condition,
    enabled: data.enabled,
  }
  await db.insert(outgoingAccount).values(row)
  return { id, ...data }
}

export async function updateOutgoingAccount(
  id: string,
  data: Partial<{
    label: string
    email: string
    password: string
    smtp_host: string
    smtp_port: number
    routing_condition: string
    enabled: boolean
  }>,
) {
  const mapped: Record<string, unknown> = {}
  if (data.label !== undefined) mapped.label = data.label
  if (data.email !== undefined) mapped.email = data.email
  if (data.password !== undefined) mapped.password = data.password
  if (data.smtp_host !== undefined) mapped.smtpHost = data.smtp_host
  if (data.smtp_port !== undefined) mapped.smtpPort = data.smtp_port
  if (data.routing_condition !== undefined) mapped.routingCondition = data.routing_condition
  if (data.enabled !== undefined) mapped.enabled = data.enabled

  await db.update(outgoingAccount).set(mapped).where(eq(outgoingAccount.id, id))
  const rows = await db.select().from(outgoingAccount).where(eq(outgoingAccount.id, id))
  return rows[0]
}

export async function deleteOutgoingAccount(id: string) {
  await db.delete(outgoingAccount).where(eq(outgoingAccount.id, id))
}
