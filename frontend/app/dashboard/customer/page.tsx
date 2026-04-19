'use client'

import { useEffect, useState } from 'react'
import { getStoredUser } from '@/lib/auth'
import api from '@/lib/api'

interface Installation {
  id: number
  status: 'pending' | 'assigned' | 'in_progress' | 'completed'
  notes?: string
  technician?: { name: string; email: string } | null
}

const TICKETS = [
  { subject: 'Connection dropping at night', date: '2 days ago', status: 'In Progress' },
  { subject: 'Speed slower than plan', date: '1 week ago', status: 'Resolved' },
]

const STATUS_STYLE: Record<string, string> = {
  'In Progress': 'text-amber-600 bg-amber-50 border-amber-200/50',
  'Resolved': 'text-gray-400 bg-gray-50 border-gray-200',
  'Open': 'text-blue-600 bg-blue-50 border-blue-200/50',
}

export default function CustomerOverview() {
  const [user, setUser] = useState<any>(null)
  const [sub, setSub] = useState<any>(null)
  const [installation, setInstallation] = useState<Installation | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(getStoredUser())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const fetchData = async () => {
      try {
        const [subRes, instRes] = await Promise.all([
          api.get('/subscriptions/my'),
          api.get(`/admin/installations/my/${getStoredUser()?.id}`)
        ])
        setSub(subRes.data.subscription)
        setInstallation(instRes.data.installation)
      } catch (err) {
        console.error('System Data Fetch Failure', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [mounted])

  if (!mounted || loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )

  const formatPrice = (price: number) => `₦${(price || 0).toLocaleString()}`
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-12 text-gray-900">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Account Overview
          </h1>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-[0.15em] mt-1">
            Session: {user?.name?.split(' ')[0] || 'User'} // Status: Verified
          </p>
        </div>
        <div className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-widest uppercase ${
          sub?.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
        }`}>
          ● {sub?.status || 'OFFLINE'}
        </div>
      </div>

      {/* Installation Tracker (Only active if not completed) */}
      {installation && installation.status !== 'completed' && (
        <div className="bg-blue-600 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-200">
          <div className="relative z-10">
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Service Deployment</p>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Installation in progress</h2>
                <p className="text-blue-100/70 text-sm max-w-sm leading-relaxed">
                  Technician {installation.technician?.name || 'assignment pending'} is synchronizing your local terminal.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                  <span>Progress</span>
                  <span>{installation.status.replace('_', ' ')}</span>
                </div>
                <div className="h-1 w-full bg-white/20 rounded-full">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000" 
                    style={{ width: installation.status === 'pending' ? '25%' : installation.status === 'assigned' ? '60%' : '85%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Network Plan', value: sub?.plan?.name || 'N/A', detail: 'Primary Service' },
          { label: 'Bandwidth', value: `${sub?.plan?.speed || 0}Mbps`, detail: 'Current Limit' },
          { label: 'Uptime Left', value: `${sub?.daysLeft || 0} Days`, detail: 'Auto-renew active' },
          { label: 'Periodic Cost', value: formatPrice(sub?.plan?.price || 0), detail: 'Per Month' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">{s.label}</p>
            <p className="text-2xl font-bold tracking-tighter text-gray-900">{s.value}</p>
            <p className="text-gray-300 text-[10px] mt-1 font-medium italic">{s.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Card */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-tight">Contract Details</h3>
            <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Manage</button>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Plan Identifier', value: sub?.plan?.name },
              { label: 'Cost Basis', value: `${formatPrice(sub?.plan?.price)} / cycle` },
              { label: 'Termination Date', value: sub?.expiryDate ? formatDate(sub.expiryDate) : 'N/A' },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.label}</span>
                <span className="text-gray-900 font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets Card */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-tight">Active Logs</h3>
            <button className="text-[10px] font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-md border border-gray-100 uppercase tracking-widest">Request Support</button>
          </div>
          <div className="p-6 space-y-3">
            {TICKETS.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-gray-50 rounded-xl hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-800">{t.subject}</span>
                  <span className="text-[10px] text-gray-400 font-mono italic">{t.date}</span>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-tighter ${STATUS_STYLE[t.status]}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}