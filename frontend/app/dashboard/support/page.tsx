'use client'

import { getStoredUser } from '@/lib/auth'

const stats = [
  { label: 'Open Tickets',   value: '24',  sub: '6 unread',        color: 'text-amber-400'   },
  { label: 'In Progress',    value: '11',  sub: 'Assigned to you', color: 'text-blue-400'    },
  { label: 'Resolved Today', value: '8',   sub: 'Great work',      color: 'text-emerald-400' },
  { label: 'Avg. Response',  value: '14m', sub: 'Last 7 days',     color: 'text-purple-400'  },
]

const tickets = [
  { id: '#1042', subject: 'Connection dropping at night',      customer: 'Emeka Obi',   status: 'open',        time: '5m ago'  },
  { id: '#1041', subject: 'Unable to connect after payment',   customer: 'Ngozi Eze',   status: 'in_progress', time: '22m ago' },
  { id: '#1040', subject: 'Speed slower than subscribed plan', customer: 'Aisha Bello', status: 'in_progress', time: '1h ago'  },
  { id: '#1039', subject: 'Router config help needed',         customer: 'Tunde Alabi', status: 'open',        time: '2h ago'  },
  { id: '#1038', subject: 'Billing discrepancy on renewal',    customer: 'Chukwu Kalu', status: 'resolved',    time: '3h ago'  },
]

const STATUS_MAP: Record<string, { label: string; style: string }> = {
  open:        { label: 'Open',        style: 'text-amber-400  bg-amber-400/10  border-amber-400/20'  },
  in_progress: { label: 'In Progress', style: 'text-blue-400   bg-blue-400/10   border-blue-400/20'   },
  resolved:    { label: 'Resolved',    style: 'text-white/30   bg-white/[0.04]  border-white/10'      },
}

const FILTERS = ['All', 'Open', 'In Progress', 'Resolved']

export default function SupportOverview() {
  const user = getStoredUser()

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">Support dashboard</h1>
          <p className="text-white/35 text-sm">Welcome back, {user?.name?.split(' ')[0]}. Here&apos;s your queue.</p>
        </div>
        <button className="text-black bg-amber-400 hover:bg-amber-500 text-xs font-bold px-4 py-2.5 rounded-lg transition-all">
          + New ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-2">
            <span className="text-white/35 text-xs font-medium">{s.label}</span>
            <span className={`text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</span>
            <span className="text-white/30 text-xs">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Ticket queue */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-[15px]">Ticket queue</h3>
          <div className="flex gap-1.5">
            {FILTERS.map((f, i) => (
              <button
                key={f}
                className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  i === 0
                    ? 'text-amber-400 bg-amber-400/10 border-amber-400/25'
                    : 'text-white/35 bg-transparent border-white/[0.07] hover:text-white/60 hover:border-white/15'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {tickets.map((t) => {
            const s = STATUS_MAP[t.status]
            return (
              <div
                key={t.id}
                className="flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-xl px-4 py-3.5 transition-all"
              >
                <span className="text-white/20 text-[11px] font-bold font-mono w-10 flex-shrink-0">{t.id}</span>
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <span className="text-white/80 text-[13px] font-medium truncate">{t.subject}</span>
                  <span className="text-white/30 text-[11px]">{t.customer}</span>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${s.style}`}>
                  {s.label}
                </span>
                <span className="text-white/20 text-[11px] flex-shrink-0 w-12 text-right">{t.time}</span>
                <button className="text-white/30 hover:text-amber-400 border border-white/[0.07] hover:border-amber-400/25 hover:bg-amber-400/[0.08] text-[12px] font-medium px-3 py-1.5 rounded-lg flex-shrink-0 transition-all">
                  Open →
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}