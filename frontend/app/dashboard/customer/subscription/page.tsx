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

const STATUS_STYLE: Record<string, string> = {
  active:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
  suspended: 'text-red-400    bg-red-400/10    border-red-400/25',
  pending:   'text-amber-400  bg-amber-400/10  border-amber-400/25',
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
    // Simulate payment processing delay
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
    new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })

  const formatPrice = (price: number) =>
    `₦${price.toLocaleString()}`

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">Subscription</h1>
        <p className="text-white/35 text-sm">Manage your current plan and renewal.</p>
      </div>

      {/* Current subscription card */}
      {sub ? (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">Current plan</p>
              <h2 className="text-white text-xl font-bold">{sub.plan.name} — {sub.plan.speed}</h2>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${STATUS_STYLE[sub.status]}`}>
              {sub.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/[0.03] rounded-xl p-4">
              <p className="text-white/35 text-xs mb-1">Monthly price</p>
              <p className="text-white font-bold text-lg">{formatPrice(sub.plan.price)}</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4">
              <p className="text-white/35 text-xs mb-1">Expiry date</p>
              <p className="text-white font-bold text-lg">{formatDate(sub.expiryDate)}</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4">
              <p className="text-white/35 text-xs mb-1">Days remaining</p>
              <p className={`font-bold text-lg ${sub.daysLeft <= 7 ? 'text-red-400' : 'text-emerald-400'}`}>
                {sub.daysLeft} days
              </p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4">
              <p className="text-white/35 text-xs mb-1">Speed</p>
              <p className="text-white font-bold text-lg">{sub.plan.speed}</p>
            </div>
          </div>

          {/* Expiry warning */}
          {sub.daysLeft <= 7 && sub.status === 'active' && (
            <div className="bg-amber-400/10 border border-amber-400/25 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-amber-400 text-lg">⚠</span>
              <p className="text-amber-400 text-sm font-medium">
                Your subscription expires in {sub.daysLeft} day{sub.daysLeft !== 1 ? 's' : ''}. Renew now to avoid interruption.
              </p>
            </div>
          )}

          {sub.status === 'suspended' && (
            <div className="bg-red-400/10 border border-red-400/25 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-red-400 text-lg">✕</span>
              <p className="text-red-400 text-sm font-medium">
                Your subscription has expired. Renew to restore access.
              </p>
            </div>
          )}

          <button
            onClick={() => setModal(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl py-3 transition-all"
          >
            {sub.status === 'suspended' ? 'Renew Now' : 'Renew Subscription'}
          </button>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 text-center">
          <p className="text-white/40 text-sm">No active subscription found.</p>
          <button
            onClick={() => setModal(true)}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl px-6 py-3 transition-all"
          >
            Subscribe Now
          </button>
        </div>
      )}

      {/* Available plans */}
      <div>
        <h3 className="text-white font-semibold text-[15px] mb-4">Available plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = sub?.plan.id === plan.id
            return (
              <div
                key={plan.id}
                className={`bg-white/[0.03] border rounded-2xl p-5 flex flex-col gap-3 ${
                  isCurrent ? 'border-blue-500/40' : 'border-white/[0.07]'
                }`}
              >
                {isCurrent && (
                  <span className="text-blue-400 bg-blue-400/10 border border-blue-400/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-fit">
                    Current
                  </span>
                )}
                <div>
                  <p className="text-white font-bold text-base">{plan.name}</p>
                  <p className="text-white/40 text-sm">{plan.speed}</p>
                </div>
                <p className="text-white font-bold text-xl">{formatPrice(plan.price)}<span className="text-white/30 text-sm font-normal">/mo</span></p>
                {!isCurrent && (
                  <button
                    onClick={() => { setSelectedPlan(plan); setModal(true) }}
                    className="text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/25 text-xs font-semibold rounded-lg py-2 transition-all"
                  >
                    Switch to {plan.name}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            {success ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-2xl">
                  ✓
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-lg mb-1">Payment Successful!</p>
                  <p className="text-white/40 text-sm">Your subscription has been renewed for 30 days.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold text-lg">Confirm Payment</h3>
                  <button
                    onClick={() => setModal(false)}
                    className="text-white/30 hover:text-white/60 text-xl transition-all"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 mb-6 flex flex-col gap-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Plan</span>
                    <span className="text-white font-medium">{selectedPlan?.name} — {selectedPlan?.speed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Duration</span>
                    <span className="text-white font-medium">30 days</span>
                  </div>
                  <div className="border-t border-white/[0.07] pt-3 flex justify-between">
                    <span className="text-white/40 text-sm">Total</span>
                    <span className="text-white font-bold text-lg">{formatPrice(selectedPlan?.price ?? 0)}</span>
                  </div>
                </div>

                <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3 mb-6">
                  <p className="text-amber-400/80 text-xs text-center">
                    This is a simulated payment — no real transaction will occur.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setModal(false)}
                    className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/60 font-medium text-sm rounded-xl py-3 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRenew}
                    disabled={paying}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold text-sm rounded-xl py-3 flex items-center justify-center transition-all"
                  >
                    {paying
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Confirm Payment'
                    }
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