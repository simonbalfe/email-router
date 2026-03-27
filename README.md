# Simple Boilerplate

Hono API + React SPA + Drizzle ORM + Better Auth + TanStack Router in a single deployable container.

## Stack

- **API**: Hono with typed RPC client (`hono/client`)
- **Frontend**: React + TanStack Router + TanStack Query
- **Auth**: Better Auth
- **Database**: Drizzle ORM + Postgres
- **Styling**: Tailwind CSS + Radix UI

## Hono RPC

The API exports its type (`AppRouter`) and the frontend imports it to get a fully typed API client with zero codegen.

```ts
// API (apps/api/src/app.ts)
const app = new Hono().basePath('/api').route('/', todoRoutes)
export type AppRouter = typeof app

// Frontend (apps/web/src/modules/shared/lib/api.ts)
import type { AppRouter } from '@repo/api'
import { hc } from 'hono/client'
export const api = hc<AppRouter>('/')

// Usage
const res = await api.api.todos.$get()
const data = await res.json()
```

Routes must use **method chaining** (not separate instances) for types to flow through.

## Project Structure

```
apps/
  api/          Hono API server (routes, auth, db, config)
  web/          React SPA (TanStack Router, TanStack Query)
server.ts       Production entry point (serves API + static SPA)
```

## Local Development

```bash
cp .env.example .env
# Fill in your .env values

pnpm install
pnpm dev
```

## Deploy

`git push origin main` builds and deploys automatically.

GitHub Actions builds a Docker image, pushes to GHCR, and hits a webhook to redeploy your app.

### 1. Push to GitHub

Create a repo and push this project.

### 2. Add Postgres to your PaaS

In Coolify/Dokploy, create a new Postgres database. Copy the connection string.

### 3. Create the app in your PaaS

Create a new **Docker Compose** project and paste this:

```yaml
services:
  app:
    image: ghcr.io/<your-username>/<repo-name>:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@host:5432/dbname
      - BETTER_AUTH_SECRET=generate-a-random-string-at-least-32-chars
      - APP_URL=https://yourdomain.com
```

Replace the values:

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Postgres connection string from step 2 |
| `BETTER_AUTH_SECRET` | Random string, 32+ chars (run `openssl rand -hex 32`) |
| `APP_URL` | Your production URL, e.g. `https://app.yourdomain.com` |

Then point your domain to the app and expose port `3000`.

### 4. Add GHCR registry

Your image is on GitHub Container Registry (private). In your PaaS, add a Docker registry:

- **URL**: `ghcr.io`
- **Username**: your GitHub username
- **Password**: a GitHub PAT with `read:packages` scope

### 5. Push GitHub secrets

```bash
cp .env.example .env
# Fill in DEPLOY_WEBHOOK_URL (copy the webhook URL from your PaaS)
./scripts/setup-secrets.sh
```

### 6. Deploy

```bash
git push origin main
```

Every push to `main` builds, pushes to GHCR, and triggers a redeploy. That's it.

### Push DB changes

```bash
pnpm db:push
```

This uses `drizzle-kit push` to sync your schema directly to the database. No migrations.
