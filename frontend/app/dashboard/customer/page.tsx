'use client'

import { useEffect, useState } from 'react'
import { getStoredUser } from '@/lib/auth'
import api from '@/lib/api'

const TICKETS = [
  { subject: 'Latency spikes during peak hours', date: '2 days ago', status: 'In Progress' },
  { subject: 'Router firmware mismatch', date: '1 week ago', status: 'Resolved' },
]

type Sub = {
  plan?: { name?: string; speed?: number; price?: number }
  daysLeft?: number
  expiryDate?: string
}
type User = { id?: number | string; name?: string }

function UptimeRing({ pct = 99 }: { pct?: number }) {
  const r = 27
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <div className="flex flex-col items-center gap-2 pl-10 border-l border-black/[0.07]">
      <div className="relative w-[66px] h-[66px]">
        <svg width="66" height="66" viewBox="0 0 66 66" className="-rotate-90">
          <circle cx="33" cy="33" r={r} fill="none" stroke="#e8e7e3" strokeWidth="5" />
          <circle
            cx="33" cy="33" r={r} fill="none"
            stroke="#1a56db" strokeWidth="5"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[13px] font-medium text-slate-800">
          {pct}%
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-slate-400">Uptime</span>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl p-6 hover:-translate-y-0.5 transition-transform cursor-default">
      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 mb-4">{label}</p>
      <p className={`text-[22px] font-semibold tracking-tight leading-none ${color ?? 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  )
}

function TicketRow({ subject, date, status }: { subject: string; date: string; status: string }) {
  const active = status === 'In Progress'
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-black/[0.06] hover:bg-slate-50 hover:border-black/[0.12] transition-all cursor-pointer">
      <div>
        <p className="text-[12.5px] font-medium text-slate-700 mb-0.5">{subject}</p>
        <p className="text-[11px] text-slate-400">{date}</p>
      </div>
      <span className={`text-[10px] font-semibold px-3 py-1 rounded-full border tracking-wide ${
        active
          ? 'bg-amber-50 text-amber-600 border-amber-200'
          : 'bg-slate-50 text-slate-400 border-slate-200'
      }`}>
        {status}
      </span>
    </div>
  )
}

export default function CustomerOverview() {
  const [user, setUser]       = useState<User | null>(null)
  const [sub, setSub]         = useState<Sub | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(getStoredUser())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const fetchData = async () => {
      try {
        const res = await api.get('/subscriptions/my')
        setSub(res.data.subscription)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [mounted])

  if (!mounted || loading) return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#f7f7f5]">
      <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
    </div>
  )

  const firstName       = user?.name?.split(' ')[0] ?? 'there'
  const initials        = user?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') ?? 'U'
  const nodeId          = String(user?.id ?? '000').padStart(3, '0')
  const price           = sub?.plan?.price ?? 0
  const formatPrice     = (p: number) => `₦${p.toLocaleString()}`
  const expiryFormatted = sub?.expiryDate
    ? new Date(sub.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A'

  return (
    <div className="flex-1 bg-[#f7f7f5] min-h-screen px-10 py-12 flex flex-col gap-10">

      {/* Topbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.15)]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-400">
            Node_{nodeId} · Active
          </span>
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-[12px] font-semibold cursor-pointer hover:opacity-75 transition-opacity">
          {initials}
        </div>
      </div>

      {/* Heading + plan */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight text-slate-900 leading-none mb-2">
            Hello, {firstName}
          </h1>
          <p className="text-[14px] text-slate-400">Here's your service overview for today.</p>
        </div>

        <div className="flex items-center gap-4 bg-white border border-black/[0.08] rounded-2xl px-5 py-3.5">
          <div>
            <p className="text-[13px] font-semibold text-slate-900">{sub?.plan?.name ?? '—'}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Renews in {sub?.daysLeft ?? 0} days · {formatPrice(price)}/mo
            </p>
          </div>
          <button className="text-[12px] font-semibold bg-slate-900 text-white rounded-xl px-4 py-2 hover:opacity-80 transition-opacity">
            Manage
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Plan"      value={sub?.plan?.name ?? '—'}          color="text-blue-600"    />
        <StatCard label="Bandwidth" value={`${sub?.plan?.speed ?? 0} Mbps`}                          />
        <StatCard label="Time Left" value={`${sub?.daysLeft ?? 0} Days`}    color="text-emerald-500" />
        <StatCard label="Rate"      value={formatPrice(price)}                                       />
      </div>

      {/* Cards row */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-3">

        {/* Infrastructure */}
        <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
            <span className="text-[13px] font-semibold text-slate-800">Service Infrastructure</span>
            <span className="font-mono text-[10px] text-slate-400">v2.4 Stable</span>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-[1fr_auto] gap-6 items-center">
              <div className="flex flex-col gap-5">
                {[
                  { label: 'Hardware Spec', value: 'Xenon Fiber v2 Terminal' },
                  { label: 'Next Cycle',    value: expiryFormatted            },
                  { label: 'Uplink Status', value: 'Synchronized · Optimal'  },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-1">{f.label}</p>
                    <p className="text-[13px] font-medium text-slate-700">{f.value}</p>
                  </div>
                ))}
              </div>
              <UptimeRing pct={99} />
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
            <span className="text-[13px] font-semibold text-slate-800">Recent Activity</span>
            <button className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 hover:bg-blue-100 transition-colors">
              + New Ticket
            </button>
          </div>
          <div className="px-5 py-5 flex flex-col gap-2.5">
            {TICKETS.map((t) => <TicketRow key={t.subject} {...t} />)}
          </div>
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