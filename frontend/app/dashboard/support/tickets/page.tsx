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
  open: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  in_progress: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  ai_handling: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  waiting_human: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  resolved: 'text-white/40 bg-white/5 border-white/10',
}

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
      // Fix for .map error: handle both {tickets: []} and []
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

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <span className="w-6 h-6 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ticket Queue</h1>
          <p className="text-white/40 text-sm">Manage and respond to customer inquiries</p>
        </div>

        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-amber-400/50 transition-all"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="waiting_human">Waiting for Human</option>
          <option value="ai_handling">AI Handling</option>
          <option value="in_progress">In Progress</option>
        </select>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.01]">
              <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Ticket</th>
              <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Created</th>
              <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {(filteredTickets || []).map((ticket) => (
              <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <p className="text-white font-medium text-sm">{ticket.subject}</p>
                  <p className="text-white/30 text-xs mt-0.5">#{ticket.id}</p>
                </td>
                <td className="px-6 py-4 text-sm">
                  <p className="text-white/80">{ticket.user?.name || 'Unknown'}</p>
                  <p className="text-white/30 text-xs">{ticket.user?.email || ''}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-tight ${STATUS_COLORS[ticket.status] || 'text-white/40 bg-white/5 border-white/10'}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-white/40 text-xs">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => router.push(`/dashboard/support/tickets/${ticket.id}`)}
                    className="bg-white/5 hover:bg-amber-400 hover:text-black text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    Open Chat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTickets.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-white/20 text-sm italic">No tickets found in this queue.</p>
          </div>
        )}
      </div>
    </div>
  )
}