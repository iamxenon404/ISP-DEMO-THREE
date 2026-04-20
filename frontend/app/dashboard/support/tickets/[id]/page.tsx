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
  customer: 'bg-white border border-black/[0.08] text-slate-700 shadow-sm',
  ai:       'bg-purple-50 border border-purple-100 text-purple-900',
  support:  'bg-slate-900 border border-slate-900 text-white ml-auto shadow-md',
}

const SENDER_LABEL: Record<string, string> = {
  ai:       'AI Assistant',
  customer: 'Customer',
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
    new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!ticket) return null

  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed'

  return (
    <div className="flex-1 bg-[#f7f7f5] h-[calc(100vh-40px)] flex gap-8 px-10 py-8">
      {/* Chat Console */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-4 mb-6 flex-shrink-0">
          <button
            onClick={() => router.push('/dashboard/support')}
            className="w-10 h-10 flex items-center justify-center bg-white border border-black/[0.08] rounded-xl hover:border-slate-900 transition-all shadow-sm"
          >
            <span className="text-slate-900 text-lg">←</span>
          </button>
          <div>
            <h1 className="text-slate-900 font-bold text-[20px] tracking-tight">{ticket.subject}</h1>
            <p className="text-slate-400 text-[12px] font-mono uppercase tracking-widest">Case: {ticket.id} • {ticket.user?.name}</p>
          </div>
        </div>

        <div className="flex-1 bg-white border border-black/[0.08] rounded-3xl flex flex-col overflow-hidden shadow-sm">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => {
              const isSupport = msg.senderType === 'support'
              return (
                <div key={msg.id} className={`flex ${isSupport ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] md:max-w-md rounded-2xl px-5 py-4 ${SENDER_STYLE[msg.senderType]}`}>
                    {!isSupport && (
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50">
                        {SENDER_LABEL[msg.senderType] ?? msg.senderName}
                      </p>
                    )}
                    <p className="text-[14px] whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</p>
                    <p className={`text-[10px] mt-2 font-mono opacity-40 ${isSupport ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-black/[0.05] p-5 bg-[#fcfcfb]">
            {isResolved ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                <p className="text-emerald-700 text-[13px] font-bold uppercase tracking-widest">Protocol Finalized: This ticket is closed</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type your response..."
                  className="flex-1 bg-white border border-black/[0.08] focus:border-slate-900 rounded-2xl px-5 py-3.5 text-slate-900 text-[14px] placeholder:text-slate-300 outline-none transition-all shadow-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="bg-slate-900 hover:opacity-90 disabled:opacity-50 text-white font-bold text-[13px] px-8 py-3.5 rounded-2xl transition-all shadow-md active:scale-95"
                >
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-6">
        <div className="bg-white border border-black/[0.08] rounded-3xl p-6 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">Customer Profile</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500 text-[12px]">
              {ticket.user?.name.charAt(0)}
            </div>
            <div className="min-w-0">
               <p className="text-slate-900 font-bold text-[14px] truncate">{ticket.user?.name}</p>
               <p className="text-slate-400 text-[12px] truncate">{ticket.user?.email}</p>
            </div>
          </div>
          <button className="w-full py-2.5 bg-slate-50 border border-black/[0.03] rounded-xl text-slate-600 text-[11px] font-bold hover:bg-slate-100 transition-all uppercase tracking-tight">
            View Account History
          </button>
        </div>

        <div className="bg-white border border-black/[0.08] rounded-3xl p-6 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">Lifecycle State</p>
          <div className="flex flex-col gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={updating || ticket.status === s}
                className={`text-[11px] font-bold px-4 py-3 rounded-xl border transition-all capitalize tracking-tight disabled:opacity-40 ${
                  ticket.status === s
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : 'bg-slate-50 border-transparent text-slate-400 hover:text-slate-900 hover:bg-slate-100'
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