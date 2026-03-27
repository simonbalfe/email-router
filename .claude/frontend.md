---
description: React component patterns, hooks, and frontend module organization
alwaysApply: true
---

# Frontend Patterns

## Component Structure

- Single responsibility, under 200 lines (refactor at 300+)
- One component per file, props interface at top
- Use unions for variants (`"compact" | "default"` not `string`)
- Early returns for edge cases, logic before JSX

```typescript
interface ComponentNameProps {
  variant: 'compact' | 'default'
  onAction: (value: string) => void
}

export const ComponentName = ({ variant, onAction }: ComponentNameProps) => {
  if (variant === 'compact') return <CompactView onAction={onAction} />
  return <DefaultView onAction={onAction} />
}
```

Naming: `ComponentNameProps`, `ComponentNameConfig`

## Composition

- Container/Presentational: container handles state, passes to presentational children
- Extract when: repeated in 2+ places, exceeds 30-40 lines, distinct responsibility
- Parent computes, child displays: don't recalculate derived values in children
- Avoid prop drilling: pass directly to consumers, not through intermediary wrappers

## Custom Hooks

Extract when the same `useState` + mutation pattern appears in 3+ components. Naming: `use[Domain][Action]`.

```typescript
export function useManageDialog<T>(mutationFn: (item: T) => Promise<void>) {
  const [showDialog, setShowDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)

  const openDialog = (item: T) => { setSelectedItem(item); setShowDialog(true) }
  const closeDialog = () => { setShowDialog(false); setSelectedItem(null) }

  const handleConfirm = async () => {
    if (!selectedItem) return
    await mutationFn(selectedItem)
    closeDialog()
  }

  return { showDialog, selectedItem, openDialog, closeDialog, handleConfirm }
}
```

## Styling

- Tailwind CSS v4 with CSS theme variable tokens
- `cn()` utility (clsx + tailwind-merge) for conditional classes
- Never hardcode colors: use theme tokens (`bg-primary`, `text-muted-foreground`)
- shadcn/ui component patterns in `apps/web/src/modules/ui/`

## Module Organization

Organize by domain first within `apps/web/src/`.

1. **Domain first**: start domain-specific, move to shared only when proven
2. **Consistent pattern**: every feature gets components/hooks/utils structure
3. **Minimal shared**: most code lives in domains; shared is for truly cross-domain concerns
4. **Keep related code together**: hooks with their features, not separated
