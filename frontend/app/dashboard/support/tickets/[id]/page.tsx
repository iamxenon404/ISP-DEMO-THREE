'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'

interface Message {
  id: number
  content: string
  senderType: 'customer' | 'ai' | 'support'
  senderName?: string
  createdAt: string
}

interface Ticket {
  id: number
  subject: string
  status: string
  user: { id: number; name: string; email: string }
}

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']

const SENDER_STYLE: Record<string, string> = {
  customer: 'bg-blue-500/15 border border-blue-500/20 text-blue-100',
  ai:       'bg-purple-500/15 border border-purple-500/20 text-white/80',
  support:  'bg-white/[0.08] border border-white/10 text-white/85 ml-auto',
}

const SENDER_LABEL: Record<string, string> = {
  ai:       '🤖 AI Assistant',
  customer: '👤 Customer',
}

export default function SupportTicketPage() {
  const params   = useParams()
  const router   = useRouter()
  const ticketId = params.id as string
  const bottomRef = useRef<HTMLDivElement>(null)

  const [ticket,   setTicket]   = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading,  setLoading]  = useState(true)
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchTicket()
    const interval = setInterval(fetchTicket, 4000)
    return () => clearInterval(interval)
  }, [ticketId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${ticketId}`)
      setTicket(res.data.ticket)
      setMessages(res.data.messages)
    } catch {
      router.push('/dashboard/support')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    try {
      await api.post(`/tickets/${ticketId}/messages`, { content })
      await fetchTicket()
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    setUpdating(true)
    try {
      await api.patch(`/tickets/${ticketId}/status`, { status })
      await fetchTicket()
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="w-6 h-6 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!ticket) return null

  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed'

  return (
    <div className="flex gap-6 h-[calc(100vh-80px)]">
      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <button
            onClick={() => router.push('/dashboard/support')}
            className="text-white/30 hover:text-white/60 text-sm transition-all"
          >
            ←
          </button>
          <div>
            <h1 className="text-white font-semibold">{ticket.subject}</h1>
            <p className="text-white/35 text-xs">#{ticket.id} · {ticket.user?.name}</p>
          </div>
        </div>

        <div className="flex-1 bg-white/[0.02] border border-white/[0.07] rounded-2xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => {
              const isSupport = msg.senderType === 'support'
              return (
                <div key={msg.id} className={`flex ${isSupport ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-sm rounded-2xl px-4 py-3 ${SENDER_STYLE[msg.senderType]}`}>
                    {!isSupport && (
                      <p className="text-[11px] font-semibold mb-1 opacity-60">
                        {SENDER_LABEL[msg.senderType] ?? msg.senderName}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <p className="text-[10px] opacity-40 mt-1.5 text-right">{formatTime(msg.createdAt)}</p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/[0.07] p-4 flex-shrink-0">
            {isResolved ? (
              <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-3 text-center">
                <p className="text-emerald-400 text-sm font-medium">Ticket is closed</p>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Reply to customer..."
                  className="flex-1 bg-white/[0.05] border border-white/10 focus:border-amber-400/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
                >
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-4">
        {/* Customer info */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Customer</p>
          <p className="text-white font-semibold text-sm">{ticket.user?.name}</p>
          <p className="text-white/40 text-xs mt-0.5">{ticket.user?.email}</p>
        </div>

        {/* Status control */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Update status</p>
          <div className="flex flex-col gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={updating || ticket.status === s}
                className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all capitalize disabled:opacity-40 ${
                  ticket.status === s
                    ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                    : 'bg-white/[0.02] border-white/[0.07] text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}