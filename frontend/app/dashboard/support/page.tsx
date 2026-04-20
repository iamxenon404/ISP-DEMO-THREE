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
  open:          { label: 'Open',        style: 'text-blue-600   bg-blue-50   border-blue-100'    },
  ai_handling:   { label: 'AI Handling', style: 'text-purple-600 bg-purple-50 border-purple-100'  },
  waiting_human: { label: 'Waiting',     style: 'text-amber-600  bg-amber-50  border-amber-100'   },
  in_progress:   { label: 'In Progress', style: 'text-amber-600  bg-amber-50  border-amber-100'   },
  resolved:      { label: 'Resolved',    style: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  closed:        { label: 'Closed',      style: 'text-slate-400  bg-slate-50  border-slate-200'   },
}

const FILTERS = ['all', 'waiting_human', 'in_progress', 'open', 'resolved']
const FILTER_LABELS: Record<string, string> = {
  all:           'All',
  waiting_human: 'Waiting',
  in_progress:   'In Progress',
  open:          'Open',
  resolved:      'Resolved',
}

export default function SupportOverview() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [tickets,  setTickets]  = useState<Ticket[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    const user = getStoredUser()
    if (user?.name) setUserName(user.name.split(' ')[0])
    fetchTickets()
    const interval = setInterval(fetchTickets, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchTickets = async () => {
    try {
      const res  = await api.get('/tickets')
      const data = Array.isArray(res.data) ? res.data : (res.data.tickets || [])
      setTickets(data)
    } catch (err) {
      console.error(err)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)

  const stats = [
    { label: 'Open',        value: tickets.filter((t) => t.status === 'open').length,          color: 'text-blue-600'    },
    { label: 'Waiting',     value: tickets.filter((t) => t.status === 'waiting_human').length, color: 'text-amber-600'   },
    { label: 'In Progress', value: tickets.filter((t) => t.status === 'in_progress').length,   color: 'text-amber-600'   },
    { label: 'Resolved',    value: tickets.filter((t) => t.status === 'resolved').length,      color: 'text-emerald-600' },
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
    <div className="flex-1 bg-[#f7f7f5] min-h-screen px-10 py-12 flex flex-col gap-10">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate-400 mb-1">Support · Live queue</p>
          <h1 className="text-[30px] font-semibold tracking-tight text-slate-900 leading-none mb-2">
            Support dashboard
          </h1>
          <p className="text-[14px] text-slate-400">
            Welcome back, {userName || 'Agent'}. Here's your queue.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-black/[0.08] rounded-xl px-4 py-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-600 text-[12px] font-semibold">Live</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-black/[0.08] rounded-2xl p-6 hover:-translate-y-0.5 transition-transform cursor-default">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 mb-4">{s.label}</p>
            <p className={`text-[28px] font-semibold tracking-tight leading-none ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Ticket queue */}
      <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
          <span className="text-[13px] font-semibold text-slate-800">Ticket queue</span>
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  filter === f
                    ? 'text-amber-600 bg-amber-50 border-amber-100'
                    : 'text-slate-400 border-black/[0.07] hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <span className="w-5 h-5 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-400 text-[13px]">No tickets in this category</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((t) => {
                const s = STATUS_MAP[t.status] ?? STATUS_MAP.open
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-4 bg-slate-50 hover:bg-slate-100/70 border border-black/[0.06] rounded-xl px-5 py-3.5 transition-all"
                  >
                    <span className="text-slate-400 text-[11px] font-semibold font-mono w-10 flex-shrink-0">
                      #{t.id}
                    </span>
                    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                      <span className="text-slate-700 text-[13px] font-medium truncate">{t.subject}</span>
                      <span className="text-slate-400 text-[11px]">{t.user?.name ?? 'Unknown'}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${s.style}`}>
                      {s.label}
                    </span>
                    <span className="text-slate-400 text-[11px] flex-shrink-0 w-16 text-right">
                      {formatTime(t.updatedAt)}
                    </span>
                    <button
                      onClick={() => router.push(`/dashboard/support/tickets/${t.id}`)}
                      className="text-slate-400 hover:text-amber-600 border border-black/[0.07] hover:border-amber-100 hover:bg-amber-50 text-[11px] font-medium px-3 py-1.5 rounded-lg flex-shrink-0 transition-all"
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

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
        <span className="font-mono text-[10px] tracking-widest text-slate-300">© 2026 XENON.ECOSYSTEM</span>
        <div className="flex gap-5">
          {['Privacy', 'Terms'].map((l) => (
            <span key={l} className="text-[12px] text-slate-300 hover:text-slate-700 cursor-pointer transition-colors">{l}</span>
          ))}
        </div>
      </div>

    </div>
  )
}