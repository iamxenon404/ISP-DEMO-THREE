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
  open:          'text-blue-600 bg-blue-50 border-blue-100',
  ai_handling:   'text-purple-600 bg-purple-50 border-purple-100',
  waiting_human: 'text-amber-600 bg-amber-50 border-amber-100',
  in_progress:   'text-amber-600 bg-amber-50 border-amber-100',
  resolved:      'text-emerald-600 bg-emerald-50 border-emerald-100',
  closed:        'text-slate-400 bg-slate-50 border-slate-200',
}

const STATUS_LABEL: Record<string, string> = {
  open:          'Open',
  ai_handling:   'AI Syncing',
  waiting_human: 'Agent Queue',
  in_progress:   'Processing',
  resolved:      'Resolved',
  closed:        'Archived',
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
    new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="flex-1 bg-[#f7f7f5] min-h-screen px-10 py-12 flex flex-col gap-10">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight text-slate-900 leading-none mb-2">
            Support Center
          </h1>
          <p className="text-[14px] text-slate-400">Manage your node protocols and technical inquiries.</p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="bg-slate-900 hover:opacity-90 text-white font-semibold text-[13px] rounded-xl px-6 py-3 transition-all"
        >
          Initialize Ticket
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-8 border-b border-black/[0.05]">
        {(['active', 'closed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-4 text-[13px] font-semibold uppercase tracking-widest transition-all border-b-2 ${
              tab === t
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            {t} Requests ({t === 'active' ? activeTickets.length : closedTickets.length})
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : displayTickets.length === 0 ? (
        <div className="bg-white border border-dashed border-black/[0.15] rounded-2xl p-16 text-center">
          <p className="text-slate-400 text-[14px] mb-6 font-medium">
            {tab === 'active' ? 'No operational tickets found.' : 'Archive is currently empty.'}
          </p>
          {tab === 'active' && (
            <button
              onClick={() => setShowNewTicket(true)}
              className="text-blue-600 font-bold text-[13px] hover:underline"
            >
              Open a technical request →
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {displayTickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => router.push(`/dashboard/customer/support/${ticket.id}`)}
              className="group w-full bg-white border border-black/[0.08] hover:border-black/[0.15] rounded-2xl p-6 text-left transition-all flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-slate-900 font-bold text-[16px] truncate group-hover:text-blue-600 transition-colors">
                    {ticket.subject}
                  </h3>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${STATUS_STYLE[ticket.status]}`}>
                    {STATUS_LABEL[ticket.status] ?? ticket.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                   {ticket.lastMessage && (
                    <p className="text-slate-400 text-[13px] truncate max-w-md italic">
                      "{ticket.lastMessage}"
                    </p>
                  )}
                  <p className="text-slate-300 text-[11px] font-mono uppercase">
                    ID-{ticket.id.toString().padStart(4, '0')} • {formatDate(ticket.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-slate-300 group-hover:text-slate-900 transition-colors ml-4">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 5l5 5-5 5" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-black/[0.08] shadow-2xl rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-slate-900 font-semibold text-[18px]">New Technical Request</h3>
              <button onClick={() => setShowNewTicket(false)} className="text-slate-300 hover:text-slate-900 transition-colors">✕</button>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-2">Subject Header</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summarize the issue..."
                  className="w-full bg-[#fcfcfb] border border-black/[0.05] rounded-xl px-4 py-3 text-slate-900 placeholder-slate-300 focus:border-blue-500 focus:outline-none text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-2">Protocol Description</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide details for the AI sync..."
                  rows={4}
                  className="w-full bg-[#fcfcfb] border border-black/[0.05] rounded-xl px-4 py-3 text-slate-900 placeholder-slate-300 focus:border-blue-500 focus:outline-none resize-none text-[14px]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewTicket(false)}
                className="flex-1 bg-white border border-black/[0.08] text-slate-600 font-semibold text-[13px] rounded-xl py-3.5 hover:bg-slate-50 transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={creating || !subject.trim() || !message.trim()}
                className="flex-1 bg-slate-900 hover:opacity-90 disabled:opacity-50 text-white font-semibold text-[13px] rounded-xl py-3.5 flex items-center justify-center transition-all"
              >
                {creating
                  ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  : 'Open Ticket'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}