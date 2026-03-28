import { useState, useEffect, useCallback } from 'react'
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@ui/components/button'
import { Badge } from '@ui/components/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/components/table'
import {
  IncomingModal,
  type IncomingAccount,
  type IncomingAccountInput,
} from '@/components/account-modal'

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...init })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

const json = (body: unknown) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export default function IncomingTab() {
  const [accounts, setAccounts] = useState<IncomingAccount[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<IncomingAccount | null>(null)

  const load = useCallback(async () => {
    try {
      setAccounts(await req<IncomingAccount[]>('/api/incoming'))
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (a: IncomingAccount) => {
    setEditing(a)
    setModalOpen(true)
  }

  const handleSave = async (data: IncomingAccountInput) => {
    if (editing) {
      await req(`/api/incoming/${editing.id}`, { method: 'PUT', ...json(data) })
    } else {
      await req('/api/incoming', { method: 'POST', ...json(data) })
    }
    await load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this account?')) return
    await req(`/api/incoming/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Incoming IMAP accounts</h2>
        <Button size="sm" onClick={openCreate}>
          <PlusIcon /> Add
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>IMAP</TableHead>
              <TableHead>Folder</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No accounts
                </TableCell>
              </TableRow>
            )}
            {accounts.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.label || '-'}</TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {a.imap_host}:{a.imap_port}
                </TableCell>
                <TableCell>{a.folder}</TableCell>
                <TableCell>{a.department || '-'}</TableCell>
                <TableCell>
                  {a.enabled ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Disabled</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}>
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(a.id)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <IncomingModal
        open={modalOpen}
        initial={editing}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
