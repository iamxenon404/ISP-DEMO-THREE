'use client'

import { useEffect, useState } from 'react'
import { getStoredUser } from '@/lib/auth'
import api from '@/lib/api'

const TICKETS = [
  { subject: 'Latency spikes during peak hours', date: '2 days ago', status: 'In Progress' },
  { subject: 'Router firmware mismatch', date: '1 week ago', status: 'Resolved' },
]

const STATUS_STYLE: Record<string, string> = {
  'In Progress': 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/5 border-amber-200 dark:border-amber-400/20',
  'Resolved': 'text-slate-400 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10',
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
      } catch (err) { console.error(err) } 
      finally { setLoading(false) }
    }
    fetchData()
  }, [mounted])

  if (!mounted || loading) return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-[#050505]">
      <div className="w-6 h-6 border-2 border-slate-200 dark:border-white/10 border-t-blue-600 dark:border-t-white rounded-full animate-spin" />
    </div>
  )

  const formatPrice = (price: number) => `₦${(price || 0).toLocaleString()}`

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-16 space-y-12 transition-colors duration-500">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-10 border-b border-slate-100 dark:border-white/[0.03]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
            <p className="text-slate-400 dark:text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">System.Node_{String(user?.id || '000').padStart(3, '0')}</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hello, {user?.name?.split(' ')[0]}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl dark:shadow-white/5">
            Manage Plan
          </button>
        </div>
      </header>

      {/* --- STATS GRID --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Plan', val: sub?.plan?.name || '---', color: 'text-blue-600' },
          { label: 'Bandwidth', val: `${sub?.plan?.speed || 0} Mbps`, color: 'text-slate-900 dark:text-white' },
          { label: 'Time Left', val: `${sub?.daysLeft || 0} Days`, color: 'text-emerald-500' },
          { label: 'Rate', val: formatPrice(sub?.plan?.price), color: 'text-slate-900 dark:text-white' },
        ].map((s, i) => (
          <div key={i} className="group relative overflow-hidden bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/[0.05] p-8 rounded-[2rem] transition-all hover:-translate-y-1">
            {/* Card Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(circle_at_var(--x,_50%)_var(--y,_50%),_rgba(255,255,255,0.06)_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_var(--x,_50%)_var(--y,_50%),_rgba(255,255,255,0.03)_0%,_transparent_50%)]" />
            
            <p className="text-slate-400 dark:text-white/20 text-[10px] font-black uppercase tracking-widest mb-6">{s.label}</p>
            <p className={`text-4xl font-bold tracking-tighter leading-none ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </section>

      {/* --- CONTENT BLOCKS --- */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Details Module */}
        <div className="lg:col-span-7 group relative bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/[0.05] rounded-[2.5rem] overflow-hidden">
          <div className="p-8 md:p-10 border-b border-slate-100 dark:border-white/[0.03] flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Service Infrastructure</h3>
            <span className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">v2.4 Stable</span>
          </div>
          
          <div className="p-8 md:p-10 grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {[
                { label: 'Hardware Spec', value: 'Xenon Fiber v2 Terminal' },
                { label: 'Next Cycle', value: sub?.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : 'N/A' },
                { label: 'Uplink Status', value: 'Synchronized / Optimal' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-400 dark:text-white/20 tracking-wider">{item.label}</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-white/80">{item.value}</p>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col items-center justify-center border-l border-slate-100 dark:border-white/[0.03] pl-0 md:pl-12">
               <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-white/5 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 animate-[spin_3s_linear_infinite]" />
                  <span className="text-xl font-black text-slate-900 dark:text-white leading-none">99%</span>
               </div>
               <p className="mt-4 text-[10px] font-black uppercase text-slate-400 dark:text-white/30 tracking-widest">Uptime Strength</p>
            </div>
          </div>
        </div>

        {/* Support Module */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/[0.05] rounded-[2.5rem] p-8 md:p-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h3>
            <button className="text-[10px] font-black text-blue-600 dark:text-white uppercase tracking-widest px-4 py-2 bg-blue-50 dark:bg-white/5 rounded-full border border-blue-100 dark:border-white/10 hover:scale-105 transition-transform">
              New Ticket
            </button>
          </div>
          
          <div className="space-y-4">
            {TICKETS.map((t, idx) => (
              <div key={idx} className="group/ticket flex items-center justify-between p-5 bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03] rounded-3xl hover:border-slate-300 dark:hover:border-white/10 transition-all cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white/80 mb-1 group-hover/ticket:text-blue-600 dark:group-hover/ticket:text-white transition-colors">{t.subject}</p>
                  <p className="text-[10px] text-slate-400 dark:text-white/20 font-black uppercase tracking-tighter">{t.date}</p>
                </div>
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border shadow-sm ${STATUS_STYLE[t.status]}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* --- FOOTER --- */}
      <footer className="pt-12 flex justify-between items-center text-[10px] font-black text-slate-300 dark:text-white/10 uppercase tracking-[0.4em]">
        <p>© 2026 XENON.ECOSYSTEM</p>
        <div className="flex gap-6">
          <span className="cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors tracking-tighter">PRIVACY</span>
          <span className="cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors tracking-tighter">TERMS</span>
        </div>
      </footer>
    </div>
  )
}