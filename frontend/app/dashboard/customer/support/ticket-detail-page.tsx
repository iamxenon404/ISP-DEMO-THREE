'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'

interface Message {
  id: number
  message: string
  sender: {
    name: string
    role: string
  }
  createdAt: string
}

interface Ticket {
  id: number
  subject: string
  status: string
  createdAt: string
  messages: Message[]
}

const STATUS_STYLE: Record<string, string> = {
  open:        'text-blue-400 bg-blue-400/10 border-blue-400/20',
  in_progress: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  resolved:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
}

export default function TicketDetailPage() {
  const params = useParams()
  const ticketId = params.id as string
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchTicket()
    const interval = setInterval(fetchTicket, 3000) // Poll every 3s for new messages
    return () => clearInterval(interval)
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${ticketId}`)
      setTicket(res.data.ticket)
    } catch (err) {
      console.error('Failed to fetch ticket:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setSending(true)
    try {
      await api.post(`/tickets/${ticketId}/messages`, {
        message: message.trim(),
      })
      setMessage('')
      await fetchTicket() // Refresh immediately
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-NG', { day: 'short', month: 'short', year: '2-digit' })
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="w-6 h-6 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40">Ticket not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl h-screen">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-white text-2xl font-semibold">{ticket.subject}</h1>
          <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full border ${STATUS_STYLE[ticket.status]}`}>
            {ticket.status.replace('_', ' ')}
          </span>
        </div>
        <p className="text-white/40 text-sm">Created {formatDate(ticket.createdAt)}</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-4">
          {ticket.messages.map((msg) => {
            const isCustomer = msg.sender.role === 'customer'
            return (
              <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs rounded-lg p-3 ${
                    isCustomer
                      ? 'bg-blue-500/20 border border-blue-500/30 text-blue-200'
                      : 'bg-white/[0.08] border border-white/10 text-white/80'
                  }`}
                >
                  {!isCustomer && (
                    <p className="text-xs font-semibold text-white/60 mb-1">{msg.sender.name}</p>
                  )}
                  <p className="text-sm break-words">{msg.message}</p>
                  <p className="text-xs text-white/30 mt-1">{formatTime(msg.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        {ticket.status !== 'resolved' && (
          <div className="flex gap-2 border-t border-white/10 pt-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/20 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !message.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg transition-all"
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        )}

        {ticket.status === 'resolved' && (
          <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-lg p-3 text-center">
            <p className="text-emerald-400 text-sm font-medium">This ticket is closed</p>
          </div>
        )}
      </div>
    </div>
  )
}