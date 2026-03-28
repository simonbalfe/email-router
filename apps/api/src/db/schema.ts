import { relations } from 'drizzle-orm'
import { boolean, doublePrecision, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const processedEmail = pgTable(
  'processed_email',
  {
    id: text('id').primaryKey(),
    messageId: text('message_id').notNull().unique(),
    from: text('from_address').notNull(),
    subject: text('subject').notNull(),
    bodyPreview: text('body_preview'),
    label: text('label').notNull(),
    confidence: doublePrecision('confidence'),
    reason: text('reason'),
    forwarded: boolean('forwarded').default(false).notNull(),
    forwardedTo: text('forwarded_to'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('processed_email_message_id_idx').on(table.messageId)],
)

export const classificationRule = pgTable('classification_rule', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  reason: text('reason').notNull(),
  forwardTo: text('forward_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const incomingAccount = pgTable('incoming_account', {
  id: text('id').primaryKey(),
  label: text('label').notNull().default(''),
  email: text('email').notNull(),
  password: text('password').notNull(),
  imapHost: text('imap_host').notNull(),
  imapPort: integer('imap_port').notNull().default(993),
  folder: text('folder').notNull().default('INBOX'),
  department: text('department').notNull().default(''),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const outgoingAccount = pgTable('outgoing_account', {
  id: text('id').primaryKey(),
  label: text('label').notNull().default(''),
  email: text('email').notNull(),
  password: text('password').notNull(),
  smtpHost: text('smtp_host').notNull(),
  smtpPort: integer('smtp_port').notNull().default(587),
  routingCondition: text('routing_condition').notNull().default(''),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const schema = {
  user,
  session,
  account,
  verification,
  processedEmail,
  classificationRule,
  incomingAccount,
  outgoingAccount,
}
