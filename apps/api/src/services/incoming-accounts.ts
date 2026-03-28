import { eq } from 'drizzle-orm'
import { db } from '../db'
import { incomingAccount } from '../db/schema'

export async function getIncomingAccounts() {
  return db.select().from(incomingAccount).orderBy(incomingAccount.createdAt)
}

export async function createIncomingAccount(data: {
  label: string
  email: string
  password: string
  imap_host: string
  imap_port: number
  folder: string
  department: string
  enabled: boolean
}) {
  const id = crypto.randomUUID()
  const row = {
    id,
    label: data.label,
    email: data.email,
    password: data.password,
    imapHost: data.imap_host,
    imapPort: data.imap_port,
    folder: data.folder,
    department: data.department,
    enabled: data.enabled,
  }
  await db.insert(incomingAccount).values(row)
  return { id, ...data }
}

export async function updateIncomingAccount(
  id: string,
  data: Partial<{
    label: string
    email: string
    password: string
    imap_host: string
    imap_port: number
    folder: string
    department: string
    enabled: boolean
  }>,
) {
  const mapped: Record<string, unknown> = {}
  if (data.label !== undefined) mapped.label = data.label
  if (data.email !== undefined) mapped.email = data.email
  if (data.password !== undefined) mapped.password = data.password
  if (data.imap_host !== undefined) mapped.imapHost = data.imap_host
  if (data.imap_port !== undefined) mapped.imapPort = data.imap_port
  if (data.folder !== undefined) mapped.folder = data.folder
  if (data.department !== undefined) mapped.department = data.department
  if (data.enabled !== undefined) mapped.enabled = data.enabled

  await db.update(incomingAccount).set(mapped).where(eq(incomingAccount.id, id))
  const rows = await db.select().from(incomingAccount).where(eq(incomingAccount.id, id))
  return rows[0]
}

export async function deleteIncomingAccount(id: string) {
  await db.delete(incomingAccount).where(eq(incomingAccount.id, id))
}
