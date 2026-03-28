import { useState, useEffect, useCallback } from 'react'
import { RefreshCwIcon } from 'lucide-react'
import { Button } from '@ui/components/button'
import { Badge } from '@ui/components/badge'
import { Card, CardContent } from '@ui/components/card'
import { Progress } from '@ui/components/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/components/table'

interface WorkerInfo {
  email: string
  folder: string
  department: string
  status: 'connected' | 'idle' | 'error' | 'connecting' | 'processing'
  error: string
  is_timeout: boolean
  last_polled_at: string | null
  counts: { request: number; spam: number; irrelevant: number }
}

interface StatusResponse {
  workers_total: number
  workers_connected: number
  workers_error: number
  total_counts: { request: number; spam: number; irrelevant: number }
  forwarded_total: number
  stats_since: string | null
  poll_interval: number
  cycle_start_at: string | null
  cycle_end_at: string | null
  workers: WorkerInfo[]
}

function relativeTime(iso: string | null): string {
  if (!iso) return '-'
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 5) return 'just now'
  if (diff < 60) return `${diff}s ago`
  const m = Math.floor(diff / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

function WorkerBadge({ w }: { w: WorkerInfo }) {
  if (w.status === 'connecting' || w.status === 'processing')
    return <Badge variant="info">processing</Badge>
  if (w.is_timeout) return <Badge variant="warning">timeout</Badge>
  if (w.status === 'error')
    return (
      <Badge variant="error" title={w.error}>
        {w.error ? w.error.slice(0, 24) : 'error'}
      </Badge>
    )
  if (w.status === 'connected') return <Badge variant="success">connected</Badge>
  return <Badge variant="secondary">idle</Badge>
}

function ActivityBar({
  lastPolledAt,
  pollInterval,
}: {
  lastPolledAt: string | null
  pollInterval: number
}) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const update = () => {
      if (!lastPolledAt) {
        setPct(0)
        return
      }
      const elapsed = (Date.now() - new Date(lastPolledAt).getTime()) / 1000
      setPct(Math.min(100, (elapsed / pollInterval) * 100))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [lastPolledAt, pollInterval])

  return (
    <div className="flex min-w-[110px] flex-col gap-1">
      <span className="text-xs text-muted-foreground">{relativeTime(lastPolledAt)}</span>
      <Progress value={pct} className="h-1.5" />
    </div>
  )
}

const SEGMENTS = [
  { key: 'request' as const, label: 'Requests', color: '#22c55e' },
  { key: 'spam' as const, label: 'Spam', color: '#f97316' },
  { key: 'irrelevant' as const, label: 'Irrelevant', color: '#64748b' },
]

function SummaryBar({ status }: { status: StatusResponse }) {
  const tc = status.total_counts
  const total = (tc.request ?? 0) + (tc.spam ?? 0) + (tc.irrelevant ?? 0)
  const segments = SEGMENTS.map((s) => ({
    ...s,
    val: tc[s.key] ?? 0,
    pct: total > 0 ? (tc[s.key] ?? 0) / total : 0,
  }))

  return (
    <Card>
      <CardContent className="px-6 py-5">
        <div className="flex items-center gap-8">
          <div className="shrink-0">
            <div className="text-3xl font-semibold tabular-nums">{status.workers_total}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {status.workers_connected} connected
            </div>
          </div>

          <div className="h-8 w-px shrink-0 bg-border" />

          <div className="flex flex-1 items-center gap-10">
            {segments.map((s) => (
              <div key={s.key}>
                <div className="text-2xl font-semibold tabular-nums text-foreground">{s.val}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ background: s.color }}
                  />
                  {s.label}
                  {total > 0 && <span className="opacity-40">{Math.round(s.pct * 100)}%</span>}
                </div>
              </div>
            ))}
          </div>

          {status.stats_since && (
            <div className="ml-auto shrink-0 text-right text-xs text-muted-foreground">
              since {new Date(status.stats_since).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function MonitorTab() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [resetting, setResetting] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status', { credentials: 'include' })
      if (res.ok) setStatus(await res.json())
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const id = setInterval(fetchStatus, 1000)
    return () => clearInterval(id)
  }, [fetchStatus])

  const resetStats = async () => {
    setResetting(true)
    try {
      await fetch('/api/admin/reset-stats', { method: 'POST', credentials: 'include' })
      await fetchStatus()
    } finally {
      setResetting(false)
    }
  }

  if (!status)
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-4">
      <SummaryBar status={status} />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Accounts</h2>
        <Button variant="outline" size="sm" onClick={resetStats} disabled={resetting}>
          <RefreshCwIcon className={resetting ? 'animate-spin' : ''} />
          Reset statistics
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Folder</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Requests</TableHead>
              <TableHead className="text-right">Spam</TableHead>
              <TableHead className="text-right">Irrel.</TableHead>
              <TableHead>Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status.workers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  No accounts
                </TableCell>
              </TableRow>
            )}
            {status.workers.map((w) => (
              <TableRow key={`${w.email}:${w.folder}`}>
                <TableCell className="font-medium">{w.email}</TableCell>
                <TableCell>{w.folder}</TableCell>
                <TableCell>{w.department}</TableCell>
                <TableCell>
                  <WorkerBadge w={w} />
                </TableCell>
                <TableCell className="text-right font-mono text-green-500">
                  {w.counts.request ?? 0}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {w.counts.spam ?? 0}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {w.counts.irrelevant ?? 0}
                </TableCell>
                <TableCell>
                  <ActivityBar
                    lastPolledAt={w.last_polled_at}
                    pollInterval={status.poll_interval}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
