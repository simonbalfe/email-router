import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@ui/components/dialog'
import { Button } from '@ui/components/button'
import { Input } from '@ui/components/input'
import { Label } from '@ui/components/label'
import { Textarea } from '@ui/components/textarea'
import { Switch } from '@ui/components/switch'

// ── Types ────────────────────────────────────────────────────────────────

export interface IncomingAccount {
  id: string
  label: string
  email: string
  password: string
  imap_host: string
  imap_port: number
  folder: string
  department: string
  enabled: boolean
}

export type IncomingAccountInput = Omit<IncomingAccount, 'id'>

export interface OutgoingAccount {
  id: string
  label: string
  email: string
  password: string
  smtp_host: string
  smtp_port: number
  routing_condition: string
  enabled: boolean
}

export type OutgoingAccountInput = Omit<OutgoingAccount, 'id'>

// ── Incoming Modal ───────────────────────────────────────────────────────

interface IncomingModalProps {
  open: boolean
  initial?: IncomingAccount | null
  onSave: (data: IncomingAccountInput) => Promise<void>
  onClose: () => void
}

const incomingDefaults: IncomingAccountInput = {
  label: '',
  email: '',
  password: '',
  imap_host: '',
  imap_port: 993,
  folder: 'INBOX',
  department: '',
  enabled: true,
}

export function IncomingModal({ open, initial, onSave, onClose }: IncomingModalProps) {
  const [form, setForm] = useState<IncomingAccountInput>(incomingDefaults)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { ...incomingDefaults })
      setError('')
    }
  }, [open, initial])

  const set = (k: keyof IncomingAccountInput, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await onSave(form)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? 'Edit incoming account' : 'Add incoming account'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Field label="Name" value={form.label} onChange={(v) => set('label', v)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" value={form.email} onChange={(v) => set('email', v)} />
            <Field
              label="Password"
              value={form.password}
              onChange={(v) => set('password', v)}
              type="password"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="IMAP host"
              value={form.imap_host}
              onChange={(v) => set('imap_host', v)}
            />
            <Field
              label="Port"
              value={String(form.imap_port)}
              onChange={(v) => set('imap_port', Number(v))}
              type="number"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Folder" value={form.folder} onChange={(v) => set('folder', v)} />
            <Field
              label="Department"
              value={form.department}
              onChange={(v) => set('department', v)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="inc-enabled"
              checked={form.enabled}
              onCheckedChange={(v) => set('enabled', v)}
            />
            <Label htmlFor="inc-enabled">Enabled</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Outgoing Modal ───────────────────────────────────────────────────────

interface OutgoingModalProps {
  open: boolean
  initial?: OutgoingAccount | null
  onSave: (data: OutgoingAccountInput) => Promise<void>
  onClose: () => void
}

const outgoingDefaults: OutgoingAccountInput = {
  label: '',
  email: '',
  password: '',
  smtp_host: '',
  smtp_port: 587,
  routing_condition: '',
  enabled: true,
}

export function OutgoingModal({ open, initial, onSave, onClose }: OutgoingModalProps) {
  const [form, setForm] = useState<OutgoingAccountInput>(outgoingDefaults)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { ...outgoingDefaults })
      setError('')
    }
  }, [open, initial])

  const set = (k: keyof OutgoingAccountInput, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await onSave(form)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? 'Edit outgoing account' : 'Add outgoing account'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Field label="Name" value={form.label} onChange={(v) => set('label', v)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" value={form.email} onChange={(v) => set('email', v)} />
            <Field
              label="Password"
              value={form.password}
              onChange={(v) => set('password', v)}
              type="password"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="SMTP host"
              value={form.smtp_host}
              onChange={(v) => set('smtp_host', v)}
            />
            <Field
              label="Port"
              value={String(form.smtp_port)}
              onChange={(v) => set('smtp_port', Number(v))}
              type="number"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Routing condition</Label>
            <Textarea
              rows={3}
              placeholder="e.g. forward when the email is related to enterprise sales"
              value={form.routing_condition}
              onChange={(e) => set('routing_condition', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="out-enabled"
              checked={form.enabled}
              onCheckedChange={(v) => set('enabled', v)}
            />
            <Label htmlFor="out-enabled">Enabled</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
