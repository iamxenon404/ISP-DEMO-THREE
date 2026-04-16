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

const STEP_LABEL: Record<string, string> = {
  pending: 'Request Received',
  assigned: 'Technician Assigned',
  in_progress: 'Installation In Progress',
  completed: 'Installation Completed',
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
        console.error('Data fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [mounted])

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-6 h-6 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin" />
    </div>
  )

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-semibold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/35 text-sm">Everything looks good with your connection.</p>
        </div>
      </div>

      {/* 🚀 REAL-TIME INSTALLATION TRACKER (Only shows if not finished) */}
      {installation && installation.status !== 'completed' && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
             <span className="text-6xl text-blue-400">🔧</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Active Tracking</span>
              </div>
              <h2 className="text-white text-xl font-bold mb-1">{STEP_LABEL[installation.status]}</h2>
              <p className="text-white/40 text-sm max-w-md">
                {installation.status === 'assigned' 
                  ? `Technician ${installation.technician?.name} is preparing for your visit.` 
                  : "We're processing your request. Sit tight!"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {installation.technician && (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3">
                  <p className="text-white/30 text-[10px] uppercase font-bold mb-1">Technician</p>
                  <p className="text-white text-sm font-medium">{installation.technician.name}</p>
                </div>
              )}
              <div className="w-12 h-12 rounded-full border-4 border-white/[0.05] border-t-blue-500 flex items-center justify-center animate-spin" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000" 
              style={{ width: installation.status === 'pending' ? '25%' : installation.status === 'assigned' ? '60%' : '85%' }}
            />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Plan', value: sub?.plan?.name || 'N/A', color: 'text-blue-400' },
          { label: 'Speed', value: `${sub?.plan?.speed || 0}Mbps`, color: 'text-emerald-400' },
          { label: 'Days Left', value: sub?.daysLeft || 0, color: 'text-amber-400' },
          { label: 'Renewal', value: formatPrice(sub?.plan?.price || 0), color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-white/35 text-xs font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subscription Info */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Account Details</h3>
            <span className="text-emerald-400 text-[10px] font-bold px-2 py-1 bg-emerald-400/10 rounded-md border border-emerald-400/20">ACTIVE</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-white/30">Member Since</span><span className="text-white/70">{formatDate(user?.createdAt)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/30">Expiry Date</span><span className="text-white/70">{formatDate(sub?.expiryDate)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/30">Auto-Renew</span><span className="text-white/70">Enabled</span></div>
          </div>
        </div>

        {/* Quick Actions/Support */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">Help & Support</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white/[0.05] hover:bg-white/[0.08] text-white p-4 rounded-xl text-left transition-all">
              <p className="text-sm font-medium mb-1">Open Ticket</p>
              <p className="text-white/30 text-xs text-balance">Report connection issues</p>
            </button>
            <button className="bg-white/[0.05] hover:bg-white/[0.08] text-white p-4 rounded-xl text-left transition-all">
              <p className="text-sm font-medium mb-1">Chat AI</p>
              <p className="text-white/30 text-xs text-balance">Get instant troubleshooting</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}