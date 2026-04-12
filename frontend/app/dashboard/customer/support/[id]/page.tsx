'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { getStoredUser } from '@/lib/auth'

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
  waitTime?: number
}

const SENDER_STYLE: Record<string, string> = {
  customer: 'bg-blue-500/20 border border-blue-500/30 text-blue-100 ml-auto',
  ai:       'bg-purple-500/15 border border-purple-500/25 text-white/85',
  support:  'bg-white/[0.08] border border-white/10 text-white/85',
}

const SENDER_LABEL: Record<string, string> = {
  ai:      '🤖 AI Assistant',
  support: '👤 Support Agent',
}

export default function TicketChatPage() {
  const params   = useParams()
  const router   = useRouter()
  const ticketId = params.id as string
  const user     = getStoredUser()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [ticket,    setTicket]    = useState<Ticket | null>(null)
  const [messages,  setMessages]  = useState<Message[]>([])
  const [loading,   setLoading]   = useState(true)
  const [input,     setInput]     = useState('')
  const [sending,   setSending]   = useState(false)
  const [escalating,setEscalating]= useState(false)

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
      router.push('/dashboard/customer/support')
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

  const handleEscalate = async () => {
    setEscalating(true)
    try {
      await api.post(`/tickets/${ticketId}/escalate`)
      await fetchTicket()
    } catch (err) {
      console.error(err)
    } finally {
      setEscalating(false)
    }
  }

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })

  const isResolved = ticket?.status === 'resolved' || ticket?.status === 'closed'
  const isAIHandling = ticket?.status === 'ai_handling'
  const isWaiting = ticket?.status === 'waiting_human'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="w-6 h-6 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!ticket) return null

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div>
          <button
            onClick={() => router.push('/dashboard/customer/support')}
            className="text-white/30 hover:text-white/60 text-sm mb-2 flex items-center gap-1 transition-all"
          >
            ← Back to tickets
          </button>
          <h1 className="text-white font-semibold text-lg">{ticket.subject}</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAIHandling && (
            <button
              onClick={handleEscalate}
              disabled={escalating}
              className="text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/25 text-xs font-semibold px-3 py-2 rounded-lg transition-all disabled:opacity-60"
            >
              {escalating ? '...' : '👤 Talk to human'}
            </button>
          )}
          {isWaiting && (
            <div className="text-amber-400 bg-amber-400/10 border border-amber-400/20 text-xs font-medium px-3 py-2 rounded-lg">
              ⏳ Est. wait: {ticket.waitTime} min
            </div>
          )}
        </div>
      </div>

      {/* Status banner */}
      {isAIHandling && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 flex-shrink-0">
          <span className="text-purple-400 text-sm">🤖</span>
          <p className="text-purple-300 text-xs">You&apos;re chatting with our AI assistant. Click <strong>Talk to human</strong> anytime to connect with a support agent.</p>
        </div>
      )}

      {isWaiting && (
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 flex-shrink-0">
          <span className="text-amber-400 text-sm">⏳</span>
          <p className="text-amber-300 text-xs">A support agent will join shortly. Estimated wait: <strong>{ticket.waitTime} minutes</strong>.</p>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 bg-white/[0.02] border border-white/[0.07] rounded-2xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.senderType === 'customer'
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-sm rounded-2xl px-4 py-3 ${SENDER_STYLE[msg.senderType]}`}>
                  {!isMe && (
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

        {/* Input */}
        <div className="border-t border-white/[0.07] p-4 flex-shrink-0">
          {isResolved ? (
            <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-3 text-center">
              <p className="text-emerald-400 text-sm font-medium">This ticket is closed</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-white/[0.05] border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none transition-all"
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
              >
                {sending ? '...' : 'Send'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}