# Email Router

AI-powered email classifier and forwarder. Connects to an IMAP inbox, uses Claude to classify each email as a request, spam, or irrelevant, and automatically forwards legitimate requests to a specified address.

## How it works

1. Listens to an IMAP mailbox for new emails
2. Sends each email to Claude (via OpenRouter) for classification
3. Forwards emails classified as "request" via SMTP
4. Stores all processed emails with classification results in Postgres
5. Web dashboard to view processed emails and start/stop the listener

## Stack

- **API**: Hono + Drizzle ORM + Better Auth
- **AI**: Mastra agent framework + Claude Sonnet 4 (OpenRouter)
- **Email**: ImapFlow (IMAP), nodemailer (SMTP), mailparser
- **Frontend**: React + TanStack Router + TanStack Query
- **Database**: PostgreSQL
- **Deployment**: Docker + GitHub Actions + GHCR

## Local Development

```bash
cp .env.example .env
# Fill in values (see Environment Variables below)

pnpm install
pnpm dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random string, 32+ chars (`openssl rand -hex 32`) |
| `APP_URL` | App URL, e.g. `http://localhost:3000` or `https://yourdomain.com` |
| `OPENROUTER_API_KEY` | OpenRouter API key for Claude access |
| `IMAP_HOST` | IMAP server hostname |
| `IMAP_PORT` | IMAP port (default: 993) |
| `IMAP_USER` | IMAP email account |
| `IMAP_PASS` | IMAP password |
| `IMAP_FOLDER` | Folder to monitor (default: INBOX) |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (default: 465) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `FORWARD_TO` | Email address to forward requests to |

## Deploy

Push to `main` triggers GitHub Actions to build a Docker image, push to GHCR, and hit a deploy webhook.

### Setup

1. Create a Postgres database on your PaaS
2. Create a Docker Compose project with:

```yaml
services:
  app:
    image: ghcr.io/simonbalfe/email-router:latest
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://user:password@host:5432/dbname
      BETTER_AUTH_SECRET: your-secret
      APP_URL: https://yourdomain.com
      OPENROUTER_API_KEY: your-key
      IMAP_HOST: imap.example.com
      IMAP_PORT: 993
      IMAP_USER: you@example.com
      IMAP_PASS: your-password
      SMTP_HOST: smtp.example.com
      SMTP_PORT: 465
      SMTP_USER: you@example.com
      SMTP_PASS: your-password
      FORWARD_TO: forward@example.com
```

3. Add GHCR registry credentials in your PaaS (ghcr.io, GitHub username, PAT with `read:packages`)
4. Add `DEPLOY_WEBHOOK_URL` as a GitHub secret
5. `git push origin main`

### Push DB changes

```bash
pnpm db:push
```
