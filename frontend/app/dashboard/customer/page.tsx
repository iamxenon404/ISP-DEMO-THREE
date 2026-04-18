'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredUser } from '@/lib/auth'
import api from '@/lib/api'

const STATUS_STYLE: Record<string, string> = {
  'ai_handling':   'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'waiting_human': 'text-amber-400  bg-amber-400/10  border-amber-400/20',
  'in_progress':   'text-amber-400  bg-amber-400/10  border-amber-400/20',
  'resolved':      'text-white/30   bg-white/[0.04]  border-white/10',
  'open':          'text-blue-400   bg-blue-400/10   border-blue-400/20',
}

const STATUS_LABEL: Record<string, string> = {
  ai_handling:   'AI Handling',
  waiting_human: 'Waiting',
  in_progress:   'In Progress',
  resolved:      'Resolved',
  open:          'Open',
}

const INSTALL_STEPS = ['pending', 'assigned', 'in_progress', 'completed']
const INSTALL_STEP_LABEL: Record<string, string> = {
  pending:     'Pending',
  assigned:    'Tech Assigned',
  in_progress: 'In Progress',
  completed:   'Completed',
}

export default function CustomerOverview() {
  const router  = useRouter()
  const [user,         setUser]         = useState<any>(null)
  const [sub,          setSub]          = useState<any>(null)
  const [tickets,      setTickets]      = useState<any[]>([])
  const [installation, setInstallation] = useState<any>(null)
  const [mounted,      setMounted]      = useState(false)
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    const userData = getStoredUser()
    setUser(userData)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !user) return
    fetchAll()
  }, [mounted, user])

  const fetchAll = async () => {
    try {
      const [subRes, ticketsRes, installRes] = await Promise.allSettled([
        api.get('/subscriptions/my'),
        api.get('/tickets'),
        api.get(`/admin/installations/my/${user?.id}`),
      ])

      if (subRes.status === 'fulfilled') setSub(subRes.value.data.subscription)
      if (ticketsRes.status === 'fulfilled') setTickets(ticketsRes.value.data.tickets?.slice(0, 3) || [])
      if (installRes.status === 'fulfilled') setInstallation(installRes.value.data.installation)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">Good morning 👋</h1>
          <p className="text-white/35 text-sm">Loading your account...</p>
        </div>
      </div>
    )
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`

  const stats = [
    { label: 'Current Plan',  value: sub?.plan?.name || 'N/A',              sub: sub?.plan?.speed ? `${sub.plan.speed}Mbps` : '—', color: 'text-blue-400'    },
    { label: 'Days Left',     value: `${sub?.daysLeft ?? 0}`,                sub: 'Until expiry',                                   color: sub?.daysLeft <= 7 ? 'text-red-400' : 'text-emerald-400' },
    { label: 'Monthly Price', value: formatPrice(sub?.plan?.price || 0),     sub: 'Recurring',                                      color: 'text-amber-400'   },
    { label: 'Open Tickets',  value: tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length, sub: 'Active', color: 'text-purple-400' },
  ]

  const currentInstallStep = installation ? INSTALL_STEPS.indexOf(installation.status) : -1

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">
            Good morning, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-white/35 text-sm">Here&apos;s a summary of your account.</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
          sub?.status === 'active'
            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
            : 'text-red-400 bg-red-400/10 border-red-400/20'
        }`}>
          ● {sub?.status?.toUpperCase() || 'NO SUB'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-2">
            <span className="text-white/35 text-xs font-medium">{s.label}</span>
            <span className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</span>
            <span className="text-white/30 text-xs">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Expiry warning */}
      {sub?.daysLeft <= 7 && sub?.status === 'active' && (
        <div className="bg-amber-400/10 border border-amber-400/25 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-amber-400 text-sm font-medium">
            ⚠ Your subscription expires in {sub.daysLeft} day{sub.daysLeft !== 1 ? 's' : ''}.
          </p>
          <button
            onClick={() => router.push('/dashboard/customer/subscription')}
            className="text-amber-400 bg-amber-400/15 border border-amber-400/30 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-400/25 transition-all"
          >
            Renew now
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subscription card */}
        {sub && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-[15px]">Subscription</h3>
              <button
                onClick={() => router.push('/dashboard/customer/subscription')}
                className="text-blue-400 bg-blue-400/10 border border-blue-400/25 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-400/20 transition-all"
              >
                Manage
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Plan',    value: `${sub.plan.name} — ${sub.plan.speed}Mbps` },
                { label: 'Price',   value: `${formatPrice(sub.plan.price)} / month`   },
                { label: 'Expires', value: formatDate(sub.expiryDate)                 },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between text-sm">
                  <span className="text-white/35">{r.label}</span>
                  <span className="text-white/80 font-medium">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent tickets */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold text-[15px]">Recent tickets</h3>
            <button
              onClick={() => router.push('/dashboard/customer/support')}
              className="text-amber-400 bg-amber-400/10 border border-amber-400/25 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-400/20 transition-all"
            >
              View all
            </button>
          </div>
          {tickets.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/25 text-sm">No tickets yet</p>
              <button
                onClick={() => router.push('/dashboard/customer/support')}
                className="text-blue-400 text-xs mt-2 hover:underline"
              >
                Create a ticket
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => router.push(`/dashboard/customer/support/${t.id}`)}
                  className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-xl p-3.5 text-left transition-all"
                >
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1 mr-3">
                    <span className="text-white/75 text-[13px] font-medium truncate">{t.subject}</span>
                    <span className="text-white/25 text-[11px]">{new Date(t.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_STYLE[t.status] ?? ''}`}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Installation tracking */}
      {installation && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold text-[15px]">Installation tracking</h3>
            {installation.status === 'assigned' && (
              <span className="text-blue-400 bg-blue-400/10 border border-blue-400/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full animate-pulse">
                Technician assigned
              </span>
            )}
            {installation.status === 'in_progress' && (
              <span className="text-amber-400 bg-amber-400/10 border border-amber-400/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full animate-pulse">
                In progress
              </span>
            )}
            {installation.status === 'completed' && (
              <span className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                ✓ Complete
              </span>
            )}
          </div>

          {/* Technician info if assigned */}
          {installation.technician && installation.status !== 'completed' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-400/20 border border-blue-400/25 flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
                {installation.technician.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">{installation.technician.name}</p>
                <p className="text-white/35 text-xs">Your assigned technician</p>
              </div>
            </div>
          )}

          {/* Progress steps */}
          <div className="flex items-center gap-0">
            {INSTALL_STEPS.map((step, index) => {
              const isCompleted = index < currentInstallStep
              const isCurrent   = index === currentInstallStep
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isCompleted ? 'bg-emerald-400 text-black' :
                      isCurrent   ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' :
                                    'bg-white/[0.06] text-white/25'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <p className={`text-[10px] mt-1.5 font-medium text-center ${
                      isCurrent ? 'text-white/70' : isCompleted ? 'text-white/40' : 'text-white/20'
                    }`}>
                      {INSTALL_STEP_LABEL[step]}
                    </p>
                  </div>
                  {index < INSTALL_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mb-4 ${index < currentInstallStep ? 'bg-emerald-400/40' : 'bg-white/[0.07]'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}