'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { getStoredUser } from '@/lib/auth'

interface Ticket {
  id: number
  subject: string
  status: string
  createdAt: string
  updatedAt: string
  user: { id: number; name: string; email: string }
}

const STATUS_MAP: Record<string, { label: string; style: string }> = {
  open:          { label: 'Open',            style: 'text-blue-400    bg-blue-400/10    border-blue-400/20'   },
  ai_handling:   { label: 'AI Handling',     style: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  waiting_human: { label: 'Waiting',         style: 'text-amber-400  bg-amber-400/10  border-amber-400/20'  },
  in_progress:   { label: 'In Progress',     style: 'text-amber-400  bg-amber-400/10  border-amber-400/20'  },
  resolved:      { label: 'Resolved',        style: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  closed:        { label: 'Closed',          style: 'text-white/30   bg-white/[0.04]  border-white/10'      },
}

const FILTERS = ['all', 'waiting_human', 'in_progress', 'open', 'resolved']
const FILTER_LABELS: Record<string, string> = {
  all: 'All',
  waiting_human: 'Waiting',
  in_progress: 'In Progress',
  open: 'Open',
  resolved: 'Resolved',
}

export default function SupportOverview() {
  const router = useRouter()
  const [userName, setUserName] = useState('') // Fix for Hydration
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // Hydration Fix: Fetch user data only on client
    const user = getStoredUser()
    if (user?.name) setUserName(user.name.split(' ')[0])

    fetchTickets()
    const interval = setInterval(fetchTickets, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets')
      // Safety fix: ensure tickets is always an array
      const data = Array.isArray(res.data) ? res.data : (res.data.tickets || [])
      setTickets(data)
    } catch (err) {
      console.error(err)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'all'
    ? tickets
    : tickets.filter((t) => t.status === filter)

  const stats = [
    { label: 'Open',        value: tickets.filter((t) => t.status === 'open').length,          color: 'text-blue-400'    },
    { label: 'Waiting',     value: tickets.filter((t) => t.status === 'waiting_human').length, color: 'text-amber-400'   },
    { label: 'In Progress', value: tickets.filter((t) => t.status === 'in_progress').length,   color: 'text-amber-400'   },
    { label: 'Resolved',    value: tickets.filter((t) => t.status === 'resolved').length,      color: 'text-emerald-400' },
  ]

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">Support dashboard</h1>
          <p className="text-white/35 text-sm">Welcome back, {userName || 'Agent'}. Here&apos;s your queue.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-2">
            <span className="text-white/35 text-xs font-medium">{s.label}</span>
            <span className={`text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-[15px]">Ticket queue</h3>
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  filter === f
                    ? 'text-amber-400 bg-amber-400/10 border-amber-400/25'
                    : 'text-white/35 bg-transparent border-white/[0.07] hover:text-white/60'
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <span className="w-5 h-5 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/30 text-sm">No tickets in this category</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((t) => {
              const s = STATUS_MAP[t.status] ?? STATUS_MAP.open
              return (
                <div key={t.id} className="flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-xl px-4 py-3.5 transition-all">
                  <span className="text-white/20 text-[11px] font-bold font-mono w-10 flex-shrink-0">#{t.id}</span>
                  <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <span className="text-white/80 text-[13px] font-medium truncate">{t.subject}</span>
                    <span className="text-white/30 text-[11px]">{t.user?.name ?? 'Unknown'}</span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${s.style}`}>
                    {s.label}
                  </span>
                  <span className="text-white/20 text-[11px] flex-shrink-0 w-16 text-right">{formatTime(t.updatedAt)}</span>
                  <button
                    onClick={() => router.push(`/dashboard/support/tickets/${t.id}`)}
                    className="text-white/30 hover:text-amber-400 border border-white/[0.07] hover:border-amber-400/25 hover:bg-amber-400/[0.08] text-[12px] font-medium px-3 py-1.5 rounded-lg flex-shrink-0 transition-all"
                  >
                    Open →
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 