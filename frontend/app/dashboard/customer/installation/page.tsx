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
  { key: 'pending',     label: 'Pending',      desc: 'Your installation request has been received.'         },
  { key: 'assigned',    label: 'Tech Assigned', desc: 'A technician has been assigned to your installation.' },
  { key: 'in_progress', label: 'In Progress',   desc: 'Your technician is on the way or working on site.'   },
  { key: 'completed',   label: 'Completed',     desc: "Your installation is complete. You're all set!"       },
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
    new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">Installation tracking</h1>
        <p className="text-white/35 text-sm">Track the status of your internet installation.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <span className="w-6 h-6 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
        </div>
      ) : !installation ? (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-white/60 font-medium mb-1">No installation scheduled</p>
          <p className="text-white/30 text-sm">Contact support to schedule your installation.</p>
        </div>
      ) : (
        <>
          {installation.status === 'assigned' && (
            <div className="bg-blue-500/10 border border-blue-500/25 rounded-2xl p-5 flex items-start gap-4">
              <span className="text-2xl">🚀</span>
              <div>
                <p className="text-white font-semibold mb-1">Technician assigned!</p>
                <p className="text-white/50 text-sm">
                  <span className="text-white/80 font-medium">{installation.technician?.name}</span> has been assigned to your installation. They will contact you before arrival.
                </p>
              </div>
            </div>
          )}

          {installation.status === 'in_progress' && (
            <div className="bg-amber-400/10 border border-amber-400/25 rounded-2xl p-5 flex items-start gap-4">
              <span className="text-2xl">🔧</span>
              <div>
                <p className="text-white font-semibold mb-1">Installation in progress</p>
                <p className="text-white/50 text-sm">
                  <span className="text-white/80 font-medium">{installation.technician?.name}</span> is currently working on your installation.
                </p>
              </div>
            </div>
          )}

          {installation.status === 'completed' && (
            <div className="bg-emerald-400/10 border border-emerald-400/25 rounded-2xl p-5 flex items-start gap-4">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-white font-semibold mb-1">Installation complete!</p>
                <p className="text-white/50 text-sm">Your internet connection has been set up successfully. Enjoy your service!</p>
              </div>
            </div>
          )}

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            <h3 className="text-white font-semibold text-[15px] mb-6">Installation progress</h3>
            <div className="flex flex-col gap-0">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentStep
                const isCurrent   = index === currentStep

                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all ${
                        isCompleted ? 'bg-emerald-400 text-black' :
                        isCurrent   ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' :
                                      'bg-white/[0.06] text-white/25'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      {index < STEPS.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${isCompleted ? 'bg-emerald-400/40' : 'bg-white/[0.07]'}`} />
                      )}
                    </div>

                    <div className={`pb-6 flex-1 ${index === STEPS.length - 1 ? 'pb-0' : ''}`}>
                      <p className={`font-semibold text-sm mb-0.5 ${
                        isCurrent ? 'text-white' : isCompleted ? 'text-white/60' : 'text-white/25'
                      }`}>
                        {step.label}
                        {isCurrent && (
                          <span className="ml-2 text-[10px] font-bold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Current
                          </span>
                        )}
                      </p>
                      <p className={`text-xs leading-relaxed ${isCurrent ? 'text-white/50' : 'text-white/20'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {installation.technician && (
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <h3 className="text-white font-semibold text-[15px] mb-4">Your technician</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-400/15 border border-emerald-400/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
                  {installation.technician.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-white font-semibold">{installation.technician.name}</p>
                  <p className="text-white/40 text-sm">{installation.technician.email}</p>
                </div>
              </div>
              {installation.notes && (
                <div className="mt-4 bg-white/[0.03] rounded-xl p-3">
                  <p className="text-white/40 text-xs font-medium mb-1">Notes</p>
                  <p className="text-white/65 text-sm">{installation.notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="text-white/20 text-xs">
            Installation created {formatDate(installation.createdAt)} · Last updated {formatDate(installation.updatedAt)}
          </div>
        </>
      )}
    </div>
  )
}