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

// Updated styles to match the clean light-mode UI
const SENDER_STYLE: Record<string, string> = {
  customer: 'bg-blue-600 text-white ml-auto rounded-br-none shadow-sm',
  ai:       'bg-purple-50 border border-purple-100 text-purple-900 rounded-bl-none',
  support:  'bg-white border border-black/[0.08] text-slate-900 rounded-bl-none shadow-sm',
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
    new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const isResolved = ticket?.status === 'resolved' || ticket?.status === 'closed'
  const isAIHandling = ticket?.status === 'ai_handling'
  const isWaiting = ticket?.status === 'waiting_human'

  if (loading) {
    return (
      <div className="flex-1 bg-[#f7f7f5] flex items-center justify-center min-h-screen">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!ticket) return null

  return (
    <div className="flex-1 bg-[#f7f7f5] min-h-screen px-10 py-12 flex flex-col gap-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <button
            onClick={() => router.push('/dashboard/customer/support')}
            className="text-slate-400 hover:text-slate-900 text-[12px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-2 transition-all"
          >
            ← Back to Archive
          </button>
          <h1 className="text-slate-900 font-bold text-[24px] tracking-tight">{ticket.subject}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {isAIHandling && (
            <button
              onClick={handleEscalate}
              disabled={escalating}
              className="bg-white border border-black/[0.08] hover:bg-slate-50 text-slate-900 text-[12px] font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {escalating ? 'Connecting...' : 'Request Human Agent'}
            </button>
          )}
          {isWaiting && (
            <div className="bg-amber-50 border border-amber-100 text-amber-600 text-[12px] font-bold px-4 py-2.5 rounded-xl">
              Queue: {ticket.waitTime}m
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Status Banners */}
      {isAIHandling && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="text-lg">🤖</span>
          <p className="text-purple-700 text-[13px] font-medium">
            System synchronized with AI Support. Escalate anytime for human intervention.
          </p>
        </div>
      )}

      {isWaiting && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 flex items-center gap-3">
          <span className="text-lg">⏳</span>
          <p className="text-amber-700 text-[13px] font-medium">
            Agent requested. Average response time: <strong>{ticket.waitTime} minutes</strong>.
          </p>
        </div>
      )}

      {/* Chat Workspace */}
      <div className="flex-1 bg-white border border-black/[0.08] rounded-3xl flex flex-col overflow-hidden shadow-sm h-[600px]">
        
        {/* Scrollable Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfcfb]/50">
          {messages.map((msg) => {
            const isMe = msg.senderType === 'customer'
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${SENDER_STYLE[msg.senderType]}`}>
                  {!isMe && (
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">
                      {SENDER_LABEL[msg.senderType] ?? msg.senderName}
                    </p>
                  )}
                  <p className="text-[14px] leading-relaxed font-medium">
                    {msg.content}
                  </p>
                  <p className={`text-[10px] mt-2 opacity-50 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Action Bar */}
        <div className="border-t border-black/[0.05] p-5 bg-white">
          {isResolved ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
              <p className="text-emerald-600 text-[13px] font-bold uppercase tracking-widest">
                Communication Channel Closed
              </p>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Synchronize message..."
                className="flex-1 bg-[#f7f7f5] border border-black/[0.05] focus:border-blue-500 rounded-xl px-5 py-3 text-slate-900 text-[14px] outline-none transition-all"
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="bg-slate-900 hover:opacity-90 disabled:opacity-30 text-white font-bold text-[13px] px-8 rounded-xl transition-all shadow-lg shadow-slate-900/10"
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