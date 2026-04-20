'use client'

import { useEffect, useState } from 'react'
import { getStoredUser } from '@/lib/auth'
import api from '@/lib/api'

const tickets = [
  { subject: 'Connection dropping at night', date: '2 days ago', status: 'In Progress' },
  { subject: 'Speed slower than plan', date: '1 week ago', status: 'Resolved' },
]

const STATUS_STYLE: Record<string, string> = {
  'In Progress': 'text-amber-400 bg-amber-400/5 border-amber-400/20',
  'Resolved': 'text-slate-500 bg-white/5 border-white/10',
  'Open': 'text-blue-400 bg-blue-400/5 border-blue-400/20',
}

export default function CustomerOverview() {
  const [user, setUser] = useState<any>(null)
  const [sub, setSub] = useState<any>(null)
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
        const res = await api.get('/subscriptions/my')
        setSub(res.data.subscription)
      } catch (err) {
        console.error('Data sync failed', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [mounted])

  if (!mounted || loading) return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#050505]">
      <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin" />
    </div>
  )

  const formatPrice = (price: number) => `₦${(price || 0).toLocaleString()}`

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12 space-y-10 selection:bg-white selection:text-black">
      
      {/* --- PREMIUM HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/[0.03] pb-10">
        <div className="space-y-1">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">Network Environment</p>
          <h1 className="text-4xl font-bold tracking-tighter text-white">
            Welcome, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-bold uppercase text-emerald-500 tracking-widest">Active Link</span>
            </div>
            <span className="text-white/20 font-mono text-[10px]">NODE_{String(user?.id || '0000').padStart(4, '0')}</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-white text-black text-xs font-bold rounded-full hover:bg-white/90 transition-all shadow-[0_8px_20px_rgba(255,255,255,0.1)]">
            Manage Subscription
          </button>
        </div>
      </header>

      {/* --- STATS GRID (CLEAN & BOLD) --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Network Plan', val: sub?.plan?.name || '---', detail: 'Current Tier' },
          { label: 'Throughput', val: `${sub?.plan?.speed || 0} Mbps`, detail: 'Fiber Link' },
          { label: 'Renewal In', val: `${sub?.daysLeft || 0} Days`, detail: 'Cycle End' },
          { label: 'Rate', val: formatPrice(sub?.plan?.price), detail: 'Per Month' },
        ].map((s, i) => (
          <div key={i} className="bg-[#0A0A0A] border border-white/[0.05] p-6 rounded-3xl hover:border-white/10 transition-all group">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-4 group-hover:text-white/50 transition-colors">{s.label}</p>
            <p className="text-3xl font-bold text-white tracking-tight leading-none">{s.val}</p>
            <p className="text-white/10 text-[10px] mt-2 font-medium tracking-wide uppercase italic">{s.detail}</p>
          </div>
        ))}
      </section>

      {/* --- CONTENT MODULES --- */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Service Details Panel */}
        <div className="lg:col-span-7 bg-[#0A0A0A] border border-white/[0.05] rounded-[32px] overflow-hidden">
          <div className="p-8 border-b border-white/[0.03]">
            <h3 className="text-lg font-bold text-white tracking-tight">Technical Breakdown</h3>
            <p className="text-white/30 text-xs mt-1">Real-time parameters for your localized uplink.</p>
          </div>
          <div className="p-8 grid sm:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                { label: 'Bandwidth Limit', value: `${sub?.plan?.speed}Mbps Dedicated` },
                { label: 'Billing Period', value: 'Monthly Automated' },
                { label: 'Expiry Date', value: sub?.expiryDate ? new Date(sub.expiryDate).toDateString() : 'N/A' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-white/20 tracking-[0.1em]">{item.label}</span>
                  <span className="text-sm font-semibold text-white/80">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.01] border border-white/[0.03] rounded-3xl p-6 flex flex-col justify-center items-center text-center">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="251.2" strokeDashoffset="25.12" className="text-white" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white leading-none">90%</span>
                </div>
              </div>
              <p className="text-[10px] font-bold text-white/30 uppercase mt-4 tracking-widest">Uptime Strength</p>
            </div>
          </div>
        </div>

        {/* Support Sidebar */}
        <div className="lg:col-span-5 bg-[#0A0A0A] border border-white/[0.05] rounded-[32px] p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white tracking-tight">Active Logs</h3>
            <button className="text-[10px] font-bold bg-white/5 text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest">
              Report Issue
            </button>
          </div>
          <div className="space-y-3">
            {tickets.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-white/80 mb-1">{t.subject}</p>
                  <p className="text-[10px] text-white/20 font-medium uppercase">{t.date}</p>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${STATUS_STYLE[t.status]}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* --- FOOTER (SUBTLE) --- */}
      <footer className="pt-10 flex justify-between items-center text-[10px] font-bold text-white/10 uppercase tracking-[0.3em]">
        <p>© XENON NETWORKS 2026</p>
        <p>SECURE TERMINAL</p>
      </footer>
    </div>
  )
}