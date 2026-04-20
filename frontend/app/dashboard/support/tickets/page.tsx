'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface Ticket {
  id: number
  subject: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'ai_handling' | 'waiting_human'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  user: {
    name: string
    email: string
  }
}

const STATUS_COLORS: Record<string, string> = {
  open: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  in_progress: 'text-blue-600 bg-blue-50 border-blue-100',
  ai_handling: 'text-purple-600 bg-purple-50 border-purple-100',
  waiting_human: 'text-amber-600 bg-amber-50 border-amber-100',
  resolved: 'text-slate-400 bg-slate-50 border-slate-100',
  closed: 'text-slate-400 bg-slate-50 border-slate-100',
}

const FILTERS = [
  { label: 'All Tickets', value: 'all' },
  { label: 'Pending Human', value: 'waiting_human' },
  { label: 'AI Active', value: 'ai_handling' },
  { label: 'Open', value: 'open' },
]

export default function SupportQueuePage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets')
      const data = Array.isArray(res.data) ? res.data : (res.data.tickets || [])
      setTickets(data)
    } catch (err) {
      console.error("Failed to load tickets", err)
      setTickets([]) 
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filter)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <span className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 bg-[#f7f7f5] min-h-screen px-10 py-12 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-slate-900 text-[30px] font-semibold tracking-tight leading-none mb-2">Support Queue</h1>
          <p className="text-slate-400 text-[14px] font-medium">Monitor active inquiries and intervention requests.</p>
        </div>

        <div className="flex bg-white border border-black/[0.08] p-1 rounded-xl shadow-sm">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                filter === f.value 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.05] bg-[#fcfcfb]">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inquiry Details</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sync Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-[#fcfcfb] transition-colors group">
                <td className="px-6 py-5">
                  <p className="text-slate-900 font-bold text-[14px] leading-tight">{ticket.subject}</p>
                  <p className="text-slate-400 text-[11px] font-mono mt-1">ID_REF: {ticket.id}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="text-slate-700 text-[13px] font-semibold">{ticket.user?.name || 'Anonymous'}</p>
                  <p className="text-slate-400 text-[12px]">{ticket.user?.email || 'no-email-provided'}</p>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[ticket.status] || 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-5 text-slate-400 text-[13px] font-medium">
                  {formatDate(ticket.createdAt)}
                </td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={() => router.push(`/dashboard/support/tickets/${ticket.id}`)}
                    className="bg-white border border-black/[0.08] hover:border-slate-900 text-slate-900 px-4 py-2 rounded-xl text-[11px] font-bold transition-all shadow-sm active:scale-95"
                  >
                    Enter Console
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTickets.length === 0 && (
          <div className="py-24 text-center">
            <div className="text-slate-200 text-3xl mb-3">○</div>
            <p className="text-slate-400 text-[13px] font-medium">No active tickets found in this segment.</p>
          </div>
        )}
      </div>

      <div className="text-slate-300 text-[10px] font-mono uppercase tracking-widest">
        Automated Queue Refreshing • Interval: 10s
      </div>
    </div>
  )
}