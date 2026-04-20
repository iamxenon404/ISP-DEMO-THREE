'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface Plan {
  id: number
  name: string
  speed: string
  price: number
}

interface Subscription {
  id: number
  status: string
  expiryDate: string
  daysLeft: number
  plan: Plan
}

// Updated styles to match your clean light-mode UI
const STATUS_STYLE: Record<string, string> = {
  active:    'text-emerald-600 bg-emerald-50 border-emerald-100',
  suspended: 'text-red-600 bg-red-50 border-red-100',
  pending:   'text-amber-600 bg-amber-50 border-amber-100',
}

export default function SubscriptionPage() {
  const [sub, setSub]         = useState<Subscription | null>(null)
  const [plans, setPlans]     = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [paying, setPaying]   = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [subRes, plansRes] = await Promise.all([
        api.get('/subscriptions/my'),
        api.get('/plans'),
      ])
      setSub(subRes.data.subscription)
      setPlans(plansRes.data)
      if (subRes.data.subscription) {
        setSelectedPlan(subRes.data.subscription.plan)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRenew = async () => {
    setPaying(true)
    await new Promise((r) => setTimeout(r, 1500))
    try {
      const res = await api.post('/subscriptions/renew', {
        planId: selectedPlan?.id,
      })
      setSub(res.data.subscription)
      setSuccess(true)
      setTimeout(() => {
        setModal(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setPaying(false)
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#f7f7f5] min-h-screen px-10 py-12 flex flex-col gap-10">
      
      {/* Header */}
      <div>
        <h1 className="text-[30px] font-semibold tracking-tight text-slate-900 leading-none mb-2">
          Subscription
        </h1>
        <p className="text-[14px] text-slate-400">Manage your network node and billing cycle.</p>
      </div>

      {/* Current subscription card */}
      {sub ? (
        <div className="bg-white border border-black/[0.08] rounded-2xl p-8 overflow-hidden relative">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-2">Current Active Node</p>
              <h2 className="text-[24px] font-semibold text-slate-900">{sub.plan.name} — {sub.plan.speed}</h2>
            </div>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${STATUS_STYLE[sub.status]}`}>
              {sub.status}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
                { label: 'Monthly Rate', value: formatPrice(sub.plan.price) },
                { label: 'Expiry Date', value: formatDate(sub.expiryDate) },
                { label: 'Days Left', value: `${sub.daysLeft} Days`, color: sub.daysLeft <= 7 ? 'text-red-500' : 'text-emerald-500' },
                { label: 'Uplink Speed', value: sub.plan.speed },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#fcfcfb] border border-black/[0.04] rounded-xl p-5">
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <p className={`text-[18px] font-semibold tracking-tight ${stat.color ?? 'text-slate-900'}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Warnings */}
          {(sub.daysLeft <= 7 || sub.status === 'suspended') && (
            <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border mb-8 ${
                sub.status === 'suspended' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-amber-50 border-amber-100 text-amber-600'
            }`}>
              <span className="font-mono font-bold text-sm">!</span>
              <p className="text-[13px] font-medium">
                {sub.status === 'suspended' 
                    ? 'Node suspended. Immediate renewal required to restore sync.' 
                    : `Warning: Node expires in ${sub.daysLeft} days. Renew to prevent downtime.`}
              </p>
            </div>
          )}

          <button
            onClick={() => setModal(true)}
            className="w-full bg-slate-900 hover:opacity-90 text-white font-semibold text-[13px] rounded-xl py-4 transition-all"
          >
            {sub.status === 'suspended' ? 'Restore Service' : 'Extend Cycle'}
          </button>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-black/[0.15] rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-[14px] mb-6">No active node configuration found.</p>
          <button
            onClick={() => setModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[13px] rounded-xl px-8 py-3.5 transition-all shadow-lg shadow-blue-500/20"
          >
            Deploy New Node
          </button>
        </div>
      )}

      {/* Available plans */}
      <div>
        <h3 className="text-[13px] font-semibold text-slate-800 uppercase tracking-widest mb-5">Available Protocols</h3>
        <div className="grid grid-cols-3 gap-3">
          {plans.map((plan) => {
            const isCurrent = sub?.plan.id === plan.id
            return (
              <div
                key={plan.id}
                className={`bg-white border rounded-2xl p-6 flex flex-col gap-4 transition-all ${
                  isCurrent ? 'border-blue-500 shadow-[0_0_0_1px_#2563eb]' : 'border-black/[0.08] hover:border-black/[0.15]'
                }`}
              >
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-900 font-bold text-[16px]">{plan.name}</p>
                        <p className="text-slate-400 text-[12px]">{plan.speed}</p>
                    </div>
                    {isCurrent && (
                        <span className="text-blue-600 bg-blue-50 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-blue-100">
                            Current
                        </span>
                    )}
                </div>
                <p className="text-slate-900 font-bold text-[22px] tracking-tight">
                    {formatPrice(plan.price)}
                    <span className="text-slate-300 text-[13px] font-normal font-mono ml-1">/mo</span>
                </p>
                {!isCurrent && (
                  <button
                    onClick={() => { setSelectedPlan(plan); setModal(true) }}
                    className="mt-2 w-full text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[12px] font-semibold rounded-xl py-2.5 transition-all"
                  >
                    Select Plan
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-black/[0.08] shadow-2xl rounded-2xl p-8 w-full max-w-md">
            {success ? (
              <div className="flex flex-col items-center gap-5 py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl border border-emerald-100">
                  ✓
                </div>
                <div className="text-center">
                  <p className="text-slate-900 font-semibold text-[18px] mb-1">Transaction Verified</p>
                  <p className="text-slate-400 text-[13px]">Your node cycle has been updated successfully.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-slate-900 font-semibold text-[18px]">Confirm Renewal</h3>
                  <button onClick={() => setModal(false)} className="text-slate-300 hover:text-slate-900 transition-colors">✕</button>
                </div>

                <div className="bg-[#fcfcfb] border border-black/[0.05] rounded-xl p-5 mb-8 flex flex-col gap-4">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-400">Selected Protocol</span>
                    <span className="text-slate-900 font-medium">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-400">Duration</span>
                    <span className="text-slate-900 font-medium">30 Day Cycle</span>
                  </div>
                  <div className="border-t border-black/[0.05] pt-4 flex justify-between items-end">
                    <span className="text-slate-400 text-[13px]">Total Due</span>
                    <span className="text-slate-900 font-bold text-[22px] tracking-tight leading-none">{formatPrice(selectedPlan?.price ?? 0)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setModal(false)}
                    className="flex-1 bg-white border border-black/[0.08] text-slate-600 font-semibold text-[13px] rounded-xl py-3.5 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRenew}
                    disabled={paying}
                    className="flex-1 bg-slate-900 hover:opacity-90 disabled:opacity-50 text-white font-semibold text-[13px] rounded-xl py-3.5 flex items-center justify-center transition-all"
                  >
                    {paying ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Authorize'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}