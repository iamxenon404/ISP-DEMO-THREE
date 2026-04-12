'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface Ticket {
  id: number
  subject: string
  status: string
  createdAt: string
  lastMessage?: string
}

const STATUS_STYLE: Record<string, string> = {
  open:          'text-blue-400   bg-blue-400/10   border-blue-400/20',
  ai_handling:   'text-purple-400 bg-purple-400/10 border-purple-400/20',
  waiting_human: 'text-amber-400  bg-amber-400/10  border-amber-400/20',
  in_progress:   'text-amber-400  bg-amber-400/10  border-amber-400/20',
  resolved:      'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  closed:        'text-white/30   bg-white/[0.04]  border-white/10',
}

const STATUS_LABEL: Record<string, string> = {
  open:          'Open',
  ai_handling:   'AI Handling',
  waiting_human: 'Waiting for Agent',
  in_progress:   'In Progress',
  resolved:      'Resolved',
  closed:        'Closed',
}

export default function CustomerSupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'active' | 'closed'>('active')
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await api.get('/tickets')
      setTickets(res.data.tickets || [])
    } catch (err) {
      console.error('Failed to fetch tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/tickets', {
        subject: subject.trim(),
        message: message.trim(),
      })
      setTickets([res.data.ticket, ...tickets])
      setSubject('')
      setMessage('')
      setShowNewTicket(false)
      // Navigate to the new ticket chat
      router.push(`/dashboard/customer/support/${res.data.ticket.id}`)
    } catch (err) {
      console.error('Failed to create ticket:', err)
    } finally {
      setCreating(false)
    }
  }

  const activeTickets = tickets.filter((t) => !['resolved', 'closed'].includes(t.status))
  const closedTickets = tickets.filter((t) => ['resolved', 'closed'].includes(t.status))
  const displayTickets = tab === 'active' ? activeTickets : closedTickets

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">Support</h1>
          <p className="text-white/35 text-sm">Create and manage your support tickets.</p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-lg px-4 py-2 transition-all"
        >
          + New Ticket
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {(['active', 'closed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
              tab === t
                ? 'text-white border-blue-400'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            {t === 'active' ? 'Active' : 'Closed'} ({t === 'active' ? activeTickets.length : closedTickets.length})
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <span className="w-6 h-6 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
        </div>
      ) : displayTickets.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 text-center">
          <p className="text-white/40 text-sm mb-4">
            {tab === 'active' ? 'No active tickets' : 'No closed tickets'}
          </p>
          {tab === 'active' && (
            <button
              onClick={() => setShowNewTicket(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-lg px-4 py-2 transition-all"
            >
              Create your first ticket
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayTickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => router.push(`/dashboard/customer/support/${ticket.id}`)}
              className="w-full bg-white/[0.03] border border-white/[0.07] hover:border-white/20 rounded-xl p-4 text-left transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium mb-1 truncate">{ticket.subject}</h3>
                  {ticket.lastMessage && (
                    <p className="text-white/30 text-xs truncate mb-1">{ticket.lastMessage}</p>
                  )}
                  <p className="text-white/30 text-xs">Created {formatDate(ticket.createdAt)}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border flex-shrink-0 ${STATUS_STYLE[ticket.status]}`}>
                  {STATUS_LABEL[ticket.status] ?? ticket.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Create Support Ticket</h3>
              <button onClick={() => setShowNewTicket(false)} className="text-white/30 hover:text-white/60 text-xl">✕</button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white/60 text-xs font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Connection issue, Billing question..."
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-white/60 text-xs font-medium mb-2">Describe your issue</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's happening..."
                  rows={4}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 focus:border-blue-500 focus:outline-none resize-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewTicket(false)}
                className="flex-1 bg-white/[0.04] border border-white/10 text-white/60 font-medium text-sm rounded-lg py-2.5 transition-all hover:bg-white/[0.08]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={creating || !subject.trim() || !message.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold text-sm rounded-lg py-2.5 flex items-center justify-center transition-all"
              >
                {creating
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Create Ticket'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}