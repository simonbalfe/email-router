import { useState } from 'react'
import { cn } from '@ui/lib/utils'
import MonitorTab from '@/components/monitor-tab'
import IncomingTab from '@/components/incoming-tab'
import OutgoingTab from '@/components/outgoing-tab'

type Tab = 'monitor' | 'incoming' | 'outgoing'

const TABS: { id: Tab; label: string }[] = [
  { id: 'monitor', label: 'Monitoring' },
  { id: 'incoming', label: 'Incoming' },
  { id: 'outgoing', label: 'Outgoing' },
]

export function DashboardPage() {
  const [tab, setTab] = useState<Tab>('monitor')

  return (
    <div>
      <div className="mb-6 flex gap-0.5 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px rounded-t-md border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === t.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'monitor' && <MonitorTab />}
      {tab === 'incoming' && <IncomingTab />}
      {tab === 'outgoing' && <OutgoingTab />}
    </div>
  )
}
