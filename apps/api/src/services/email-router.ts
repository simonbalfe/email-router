import { Agent } from '@mastra/core/agent'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { eq } from 'drizzle-orm'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { config } from '../config'
import { db } from '../db'
import { processedEmail } from '../db/schema'

const openrouter = createOpenRouter({ apiKey: config.OPENROUTER_API_KEY })

const classificationSchema = z.object({
  label: z.enum(['request', 'spam', 'irrelevant']),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
  forwardTo: z.string().nullable(),
})

type Classification = z.infer<typeof classificationSchema>

const classifier = new Agent({
  id: 'email-classifier',
  name: 'email-classifier',
  model: openrouter('anthropic/claude-sonnet-4'),
  instructions: `You classify incoming emails and decide where to route them.

Rules:
- "request": genuine business inquiry, customer question, or action needed
- "spam": promotional, unsolicited marketing, phishing
- "irrelevant": automated notifications, newsletters, internal system emails

For "request" emails, set forwardTo to "${config.forwardTo}".
For spam/irrelevant, set forwardTo to null.`,
})

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: { user: config.smtp.user, pass: config.smtp.pass },
})

async function classify(from: string, subject: string, body: string): Promise<Classification> {
  const result = await classifier.generate(
    `From: ${from}\nSubject: ${subject}\n\n${body.slice(0, 3000)}`,
    { structuredOutput: { schema: classificationSchema } },
  )
  return result.object
}

async function forwardEmail(from: string, subject: string, body: string, to: string) {
  await transporter.sendMail({
    from: `"${from} (via router)" <${config.smtp.user}>`,
    replyTo: from,
    to,
    subject: `[ROUTED] ${subject}`,
    text: `--- Forwarded from: ${from} ---\n\n${body}`,
  })
}

async function alreadyProcessed(messageId: string): Promise<boolean> {
  const existing = await db
    .select({ id: processedEmail.id })
    .from(processedEmail)
    .where(eq(processedEmail.messageId, messageId))
    .limit(1)
  return existing.length > 0
}

async function logProcessed(
  messageId: string,
  from: string,
  subject: string,
  body: string,
  result: Classification,
) {
  await db.insert(processedEmail).values({
    id: crypto.randomUUID(),
    messageId,
    from,
    subject,
    bodyPreview: body.slice(0, 500),
    label: result.label,
    confidence: result.confidence,
    reason: result.reason,
    forwarded: !!result.forwardTo,
    forwardedTo: result.forwardTo,
  })
}

async function processMessage(raw: Buffer) {
  const parsed = await simpleParser(raw)

  const messageId = parsed.messageId || crypto.randomUUID()
  if (await alreadyProcessed(messageId)) return

  const from = parsed.from?.text || 'unknown'
  const subject = parsed.subject || '(no subject)'
  const body = parsed.text || ''

  console.log(`[EMAIL] Processing: "${subject}" from ${from}`)

  const result = await classify(from, subject, body)
  console.log(`[EMAIL] Classified as "${result.label}" (${result.confidence}) - ${result.reason}`)

  if (result.forwardTo) {
    await forwardEmail(from, subject, body, result.forwardTo)
    console.log(`[EMAIL] Forwarded to ${result.forwardTo}`)
  }

  await logProcessed(messageId, from, subject, body, result)
}

let running = false
let client: ImapFlow | null = null

export async function startListener() {
  if (running) return
  running = true

  client = new ImapFlow({
    host: config.imap.host,
    port: config.imap.port,
    secure: true,
    auth: { user: config.imap.user, pass: config.imap.pass },
    logger: false,
  })

  await client.connect()
  console.log(`[EMAIL] Connected to ${config.imap.host} as ${config.imap.user}`)

  const lock = await client.getMailboxLock(config.imap.folder)

  try {
    for await (const msg of client.fetch({ seen: false }, { source: true })) {
      if (msg.source) await processMessage(msg.source)
    }

    client.on('exists', async () => {
      if (!client) return
      for await (const msg of client.fetch({ seen: false }, { source: true })) {
        if (msg.source) await processMessage(msg.source)
      }
    })

    console.log(`[EMAIL] Listening for new emails via IDLE on ${config.imap.folder}`)

    while (running) {
      await client.idle()
    }
  } finally {
    lock.release()
  }
}

export async function stopListener() {
  running = false
  if (client) {
    await client.logout()
    client = null
  }
  console.log('[EMAIL] Listener stopped')
}

export function isListening() {
  return running
}

export async function getProcessedEmails(limit = 50) {
  return db.select().from(processedEmail).orderBy(processedEmail.createdAt).limit(limit)
}
