---
description: Backend layered architecture, Hono route patterns, Zod validation, and API design
alwaysApply: true
---

# Backend Architecture & API Design

## Layered Architecture

Router -> Service -> Query -> Database

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Router | `apps/api/src/routes/` | HTTP: validation, auth, responses |
| Service | `apps/api/src/services/` | Business logic, orchestration |
| Query | `apps/api/src/db/queries/` | Drizzle calls |

Keep Drizzle imports in the query layer only.

## Hono + Zod Route Pattern

All endpoints validate with Zod:

```typescript
export const CreateResourceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export type CreateResource = z.infer<typeof CreateResourceSchema>

export const resourceRouter = new Hono()
  .post('/resources',
    zValidator('json', CreateResourceSchema),
    async (c) => {
      const body = c.req.valid('json')
      const resource = await createResource(body)
      return c.json(resource, 201)
    }
  )
```

Use `z.coerce.number()` for query params.

## Resource Naming

- Nouns in paths, not verbs: `GET /posts` not `GET /getPosts`
- Plural nouns for collections: `/posts`, `/users`
- Nest max 2-3 levels: `/posts/:postId/comments`

## Status Codes

Standard codes apply. Project-specific:
- **409** for conflict (duplicate resource)
- **503** for service unavailable (external service failure)

```typescript
return c.json({ error: 'Clear, actionable message' }, 400)
```

## Router Organization

Split by sub-resources, not file size. Cohesion > line count.

```typescript
export const adminRouter = new Hono()
  .basePath('/admin')
  .route('/', userRouter)
  .route('/', organizationRouter)
```

## Security

- Auth middleware for authenticated endpoints
- 401 for unauthenticated, 403 for forbidden
- Validate resource ownership before updates/deletes
- Never log secrets or tokens
