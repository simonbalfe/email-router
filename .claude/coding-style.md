---
description: General coding style and best practices for the project.
alwaysApply: true
---

# Coding Style

## No Comments

Code must be self-explanatory through clear naming and structure. No inline comments, no JSDoc, no block comments.

### Better Alternatives

1. **Descriptive Names**: `isUserAuthenticated` instead of `flag`
2. **Extract Functions**: Replace comment blocks with well-named functions
3. **Constants**: Use named constants instead of magic numbers

```typescript
const canEditPost = (user: User, post: Post) =>
  user.role === 'admin' || user.id === post.authorId

if (canEditPost(user, post)) { ... }
```

## Early Returns and Flat Control Flow

Handle error/edge cases with guard clauses. Avoid deep nesting.

```typescript
if (!user.isAdmin) return showNoAccess()
if (!user.isActive) return showInactiveMessage()
accessDashboard()
```

### Descriptive Variables vs Function Extraction

**Use descriptive variables when:**
- Conditions combine multiple checks: `const shouldReturnLimitError = isLimitExceeded && tokenUsageStatus`

**Keep simple checks inline:**
- `if (!chat)` is clearer than `const doesChatExist = chat !== null`

**Extract to functions when:**
- Logic is complex or reusable
- Logic has side effects
- Function name clearly describes intent

## Type Sources and Duplication

- Derive types from authoritative sources (Drizzle schema -> Zod -> API -> frontend)
- Avoid creating duplicate types or manual mapping layers when types can be inferred
- Create new DTO types only when there is a real boundary (public API, security, or performance)

## Business Logic Hygiene

- Keep logic top-down with small helpers and named booleans; avoid deep nesting
- Make side effects explicit and grouped; avoid hidden writes or implicit state changes
- If functions get too big, extract methods with descriptive names and single responsibility

## File Organization

Structure files so they read top-to-bottom:
1. Constants and internal type definitions
2. Public API (exported functions)
3. Internal helpers

Callers before callees. Code reads naturally top-to-bottom.

## Alternatives to Complex If-Else

| Technique | Description |
|-----------|-------------|
| Early return/guard clause | Handle exit conditions up-front, flatten logic |
| Helper functions | Move logic to named methods for readability |
| Descriptive variables | Use boolean variables for complex conditions |
| Lookup maps/objects | Replace chained conditionals with mappings |
| Switch statements | Use TypeScript's native multi-condition features |
