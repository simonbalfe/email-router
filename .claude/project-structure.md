---
description: Monorepo directory structure and where to place new code
alwaysApply: true
---

# Project Structure

pnpm workspace monorepo with Hono API, Vite React frontend, and a root production server.

## Apps

- `apps/api/` — Hono API server with all backend concerns inlined
  - `src/config.ts` — env validation (Zod + dotenv)
  - `src/auth.ts` — BetterAuth config (email/password, drizzle adapter)
  - `src/db/` — Drizzle ORM (schema, queries, client)
  - `src/routes/` — Hono route handlers
  - `src/middleware/` — auth middleware
  - `src/services/` — business logic
  - `src/app.ts` — Hono app with CORS, logging, OpenAPI docs
  - `drizzle.config.ts` — Drizzle Kit config
- `apps/web/` — Vite + React 19 SPA
  - `src/modules/ui/` — UI components (shadcn/ui style)
  - `src/modules/shared/` — shared hooks, lib, layout
  - `src/pages/` — page components
  - TanStack Router for client-side routing
  - TanStack Query for data fetching

## Production Server

`server.ts` at root composes everything into a single Hono server:
1. Mounts API routes
2. Serves Vite build output as static files
3. SPA fallback for client-side routing

Single container deploy via `Dockerfile`.

## Type-Safe Bridge

`apps/web` imports `@repo/api` as a workspace dependency for Hono RPC type inference. No code generation needed.

## Adding New Code

- UI/feature work -> `apps/web/src/pages/` and `apps/web/src/modules/`
- Server endpoints -> `apps/api/src/routes/`
- Data model changes -> `apps/api/src/db/schema.ts`, run migrations, update affected services
- Business logic -> `apps/api/src/services/`
- Database queries -> `apps/api/src/db/queries/`
