'use client'

import { useEffect, useState } from 'react'
import { getStoredUser } from '@/lib/auth'
import api from '@/lib/api'

export default function CustomerOverview() {
  const [user, setUser] = useState<any>(null)
  const [sub, setSub] = useState<any>(null)
  const [installation, setInstallation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const u = getStoredUser()
        setUser(u)
        const [s, i] = await Promise.all([
          api.get('/subscriptions/my'),
          api.get(`/admin/installations/my/${u?.id}`)
        ])
        setSub(s.data.subscription)
        setInstallation(i.data.installation)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-8 font-mono text-[10px] uppercase tracking-widest animate-pulse text-black/40">Initializing_System...</div>

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-[1px] bg-black/5 border border-black/5">
      
      {/* HEADER / TOP BAR */}
      <div className="bg-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-black leading-none">
            User_Overview <span className="text-blue-600">.01</span>
          </h1>
          <p className="text-[10px] font-mono text-black/40 uppercase tracking-[0.2em] mt-2">
            ID: {user?.id} // Node: {user?.name?.split(' ')[0]}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[9px] font-mono text-black/30 uppercase tracking-widest">Connection_Status</p>
            <p className="text-xs font-bold uppercase text-emerald-500">Signal_Locked</p>
          </div>
          <div className="h-8 w-[1px] bg-black/10 hidden md:block" />
          <div className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-blue-600 transition-colors">
            Manage_Account
          </div>
        </div>
      </div>

      {/* INSTALLATION TRACKER (The "Xen" Module) */}
      {installation && installation.status !== 'completed' && (
        <div className="bg-white p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-8 items-center border-t border-b border-black/5">
          <div className="md:col-span-1">
            <p className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-[0.3em] mb-2">Active_Deployment</p>
            <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Installation</h2>
          </div>
          <div className="md:col-span-2">
            <div className="flex justify-between mb-2">
              <span className="text-[9px] font-mono uppercase text-black/40">Hardware_Sync_Progress</span>
              <span className="text-[9px] font-mono font-bold text-black uppercase">{installation.status}</span>
            </div>
            <div className="h-[2px] w-full bg-black/5">
              <div 
                className="h-full bg-blue-600 transition-all duration-700" 
                style={{ width: installation.status === 'pending' ? '20%' : '65%' }} 
              />
            </div>
          </div>
          <div className="md:col-span-1 text-right">
            <p className="text-[9px] font-mono text-black/40 uppercase mb-1">Technician</p>
            <p className="text-xs font-bold uppercase">{installation.technician?.name || 'Awaiting_Assignment'}</p>
          </div>
        </div>
      )}

      {/* STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px]">
        {[
          { label: 'Network_Tier', val: sub?.plan?.name || 'NULL', unit: 'Fiber' },
          { label: 'Throughput', val: sub?.plan?.speed || '0', unit: 'Mbps' },
          { label: 'System_Clock', val: sub?.daysLeft || '0', unit: 'Days_Rem' },
          { label: 'Billing_Value', val: (sub?.plan?.price || 0).toLocaleString(), unit: 'NGN' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 group hover:bg-gray-50 transition-colors">
            <p className="text-[9px] font-mono text-black/30 uppercase tracking-widest mb-4 group-hover:text-blue-600">{s.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tighter">{s.val}</span>
              <span className="text-[10px] font-mono text-black/40 uppercase">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px]">
        {/* Support Logs */}
        <div className="bg-white p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black/40">Technical_Logs</h3>
            <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline uppercase tracking-widest">New_Entry</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-black/5 text-[11px]">
              <span className="font-bold uppercase tracking-tight text-black/70 italic">Conn_Latency_Drop</span>
              <span className="font-mono text-black/30 uppercase">02_Days_Ago</span>
            </div>
            <div className="flex justify-between py-3 border-b border-black/5 text-[11px]">
              <span className="font-bold uppercase tracking-tight text-black/70 italic">Package_Sync_Issue</span>
              <span className="font-mono text-black/30 uppercase">01_Week_Ago</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-8 border-l border-black/5">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black/40 mb-8">Terminal_Actions</h3>
          <div className="grid grid-cols-1 gap-2">
            <button className="w-full py-4 px-6 border border-black/10 text-[10px] font-bold uppercase tracking-[0.2em] text-left hover:bg-black hover:text-white transition-all">
              Request_Bandwidth_Upgrade
            </button>
            <button className="w-full py-4 px-6 border border-black/10 text-[10px] font-bold uppercase tracking-[0.2em] text-left hover:bg-black hover:text-white transition-all">
              System_Diagnostics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}