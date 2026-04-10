'use client'

import { useEffect, useState } from 'react'
import { getStoredUser } from '@/lib/auth'

const stats = [
  { label: 'Current Plan',  value: 'Fiber 50Mbps', sub: 'Active',        color: 'text-blue-400'    },
  { label: 'Expiry Date',   value: 'May 14, 2025', sub: '43 days left',  color: 'text-emerald-400' },
  { label: 'Open Tickets',  value: '1',            sub: 'In Progress',   color: 'text-amber-400'   },
  { label: 'Data Used',     value: '38 GB',        sub: 'of 100 GB',     color: 'text-purple-400'  },
]

const tickets = [
  { subject: 'Connection dropping at night', date: '2 days ago', status: 'In Progress' },
  { subject: 'Speed slower than plan',       date: '1 week ago', status: 'Resolved'    },
]

const STATUS_STYLE: Record<string, string> = {
  'In Progress': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'Resolved':    'text-white/30  bg-white/[0.04] border-white/10',
  'Open':        'text-blue-400  bg-blue-400/10  border-blue-400/20',
}

export default function CustomerOverview() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const userData = getStoredUser()
    setUser(userData)
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">Good morning 👋</h1>
          <p className="text-white/35 text-sm">Loading your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">
            Good morning, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-white/35 text-sm">Here&apos;s a summary of your account.</p>
        </div>
        <span className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 text-xs font-semibold px-3 py-1.5 rounded-full">
          ● Active
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-2">
            <span className="text-white/35 text-xs font-medium">{s.label}</span>
            <span className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</span>
            <span className="text-white/30 text-xs">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Cards row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subscription */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold text-[15px]">Subscription</h3>
            <button className="text-blue-400 bg-blue-400/10 border border-blue-400/25 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-400/20 transition-all">
              Renew
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Plan',    value: 'Fiber 50Mbps' },
              { label: 'Price',   value: '₦15,000 / month' },
              { label: 'Expires', value: 'May 14, 2025' },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-sm">
                <span className="text-white/35">{r.label}</span>
                <span className="text-white/80 font-medium">{r.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/35">Status</span>
              <span className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 text-xs font-semibold px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold text-[15px]">Recent tickets</h3>
            <button className="text-amber-400 bg-amber-400/10 border border-amber-400/25 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-400/20 transition-all">
              New ticket
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {tickets.map((t) => (
              <div key={t.subject} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-white/75 text-[13px] font-medium">{t.subject}</span>
                  <span className="text-white/25 text-[11px]">{t.date}</span>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[t.status]}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}