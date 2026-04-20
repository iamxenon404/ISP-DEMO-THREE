'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getStoredUser } from '@/lib/auth'

interface Installation {
  id: number
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  technician?: {
    id: number
    name: string
    email: string
  } | null
}

const STEPS = [
  { key: 'pending',     label: 'Pending',      desc: 'Deployment request received and queued for review.'         },
  { key: 'assigned',    label: 'Tech Assigned', desc: 'A field engineer has been allocated to your node location.' },
  { key: 'in_progress', label: 'In Progress',   desc: 'On-site configuration and hardware sync currently active.'  },
  { key: 'completed',   label: 'Completed',     desc: "Deployment successful. Your network node is now live."     },
]

const STEP_INDEX: Record<string, number> = {
  pending:     0,
  assigned:    1,
  in_progress: 2,
  completed:   3,
}

export default function InstallationPage() {
  const [user,         setUser]         = useState<any>(null)
  const [installation, setInstallation] = useState<Installation | null>(null)
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    const u = getStoredUser()
    setUser(u)
  }, [])

  useEffect(() => {
    if (!user?.id) return
    fetchInstallation()
    const interval = setInterval(fetchInstallation, 10000)
    return () => clearInterval(interval)
  }, [user])

  const fetchInstallation = async () => {
    try {
      const res = await api.get(`/admin/installations/my/${user?.id}`)
      setInstallation(res.data.installation)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const currentStep = installation ? (STEP_INDEX[installation.status] ?? 0) : -1

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="flex-1 bg-[#f7f7f5] min-h-screen px-10 py-12 flex flex-col gap-10 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-[30px] font-semibold tracking-tight text-slate-900 leading-none mb-2">
          Node Deployment
        </h1>
        <p className="text-[14px] text-slate-400">Track the real-time synchronization of your network installation.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : !installation ? (
        <div className="bg-white border border-dashed border-black/[0.15] rounded-2xl p-16 text-center">
          <div className="text-3xl mb-4 opacity-20">📡</div>
          <p className="text-slate-900 font-bold text-[16px] mb-1">No Active Deployment</p>
          <p className="text-slate-400 text-[13px]">Contact technical support to initialize your site installation.</p>
        </div>
      ) : (
        <>
          {/* Status Alert Cards */}
          {installation.status === 'assigned' && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
              <span className="text-xl">🚀</span>
              <div>
                <p className="text-blue-900 font-bold text-[14px] mb-1">Field Engineer Allocated</p>
                <p className="text-blue-700/70 text-[13px] leading-relaxed">
                  <strong className="text-blue-900">{installation.technician?.name}</strong> has been dispatched. They will verify your site protocols before arrival.
                </p>
              </div>
            </div>
          )}

          {installation.status === 'in_progress' && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
              <span className="text-xl">🔧</span>
              <div>
                <p className="text-amber-900 font-bold text-[14px] mb-1">Configuration In Progress</p>
                <p className="text-amber-700/70 text-[13px] leading-relaxed">
                   Hardware sync is active. <strong className="text-amber-900">{installation.technician?.name}</strong> is currently finalizing your node setup.
                </p>
              </div>
            </div>
          )}

          {installation.status === 'completed' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-emerald-900 font-bold text-[14px] mb-1">Deployment Complete</p>
                <p className="text-emerald-700/70 text-[13px] leading-relaxed">Your network node is fully operational and synchronized with our backbone.</p>
              </div>
            </div>
          )}

          {/* Stepper Workspace */}
          <div className="bg-white border border-black/[0.08] rounded-3xl p-8 shadow-sm">
            <h3 className="text-slate-900 font-bold text-[15px] uppercase tracking-widest mb-8">Installation Pipeline</h3>
            <div className="flex flex-col">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentStep
                const isCurrent   = index === currentStep

                return (
                  <div key={step.key} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-bold transition-all ${
                        isCompleted ? 'bg-emerald-500 text-white' :
                        isCurrent   ? 'bg-slate-900 text-white ring-4 ring-slate-900/10' :
                                      'bg-slate-50 text-slate-300 border border-slate-100'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      {index < STEPS.length - 1 && (
                        <div className={`w-[2px] h-10 my-1 ${isCompleted ? 'bg-emerald-500/30' : 'bg-slate-100'}`} />
                      )}
                    </div>

                    <div className={`pb-8 flex-1 ${index === STEPS.length - 1 ? 'pb-0' : ''}`}>
                      <div className="flex items-center gap-3 mb-1">
                        <p className={`font-bold text-[15px] ${
                          isCurrent ? 'text-slate-900' : isCompleted ? 'text-slate-500' : 'text-slate-300'
                        }`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                            Active Sync
                          </span>
                        )}
                      </div>
                      <p className={`text-[13px] leading-relaxed ${isCurrent ? 'text-slate-500' : 'text-slate-400'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Technician Info */}
          {installation.technician && (
            <div className="bg-white border border-black/[0.08] rounded-3xl p-8 shadow-sm">
              <h3 className="text-slate-900 font-bold text-[15px] uppercase tracking-widest mb-6">Field Engineer</h3>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-[16px] font-bold flex-shrink-0">
                  {installation.technician.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-[16px]">{installation.technician.name}</p>
                  <p className="text-slate-400 text-[13px] font-mono lowercase">{installation.technician.email}</p>
                </div>
              </div>
              {installation.notes && (
                <div className="mt-6 bg-[#fcfcfb] border border-black/[0.03] rounded-2xl p-5">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Technical Notes</p>
                  <p className="text-slate-600 text-[14px] leading-relaxed font-medium">{installation.notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="text-slate-300 text-[11px] font-mono uppercase tracking-tighter">
            Manifest Created: {formatDate(installation.createdAt)} • Latency Updated: {formatDate(installation.updatedAt)}
          </div>
        </>
      )}
    </div>
  )
}