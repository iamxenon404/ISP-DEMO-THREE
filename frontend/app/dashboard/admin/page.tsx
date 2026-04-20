'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { getStoredUser } from '@/lib/auth'

interface Stats {
  totalCustomers: number
  totalStaff: number
  totalUsers: number
  activeSubs: number
  suspendedSubs: number
  actualRevenue: number
  estimatedRevenue: number
}

interface RecentUser {
  id: number
  name: string
  email: string
  role: string
  status: string
  subscription?: { status: string; plan: { name: string; price: number } } | null
}

const ROLE_STYLE: Record<string, string> = {
  customer:   'text-blue-600   bg-blue-50   border-blue-100',
  admin:      'text-purple-600 bg-purple-50 border-purple-100',
  support:    'text-amber-600  bg-amber-50  border-amber-100',
  technician: 'text-emerald-600 bg-emerald-50 border-emerald-100',
}

const STATUS_STYLE: Record<string, string> = {
  active:    'text-emerald-600 bg-emerald-50 border-emerald-100',
  suspended: 'text-red-500    bg-red-50    border-red-100',
  pending:   'text-amber-600  bg-amber-50  border-amber-100',
}

export default function AdminOverview() {
  const user   = getStoredUser()
  const router = useRouter()

  const [stats,       setStats]       = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ])
      setStats(statsRes.data)
      setRecentUsers(usersRes.data.users.slice(0, 5))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-5 h-5 border-2 border-slate-200 border-t-purple-500 rounded-full animate-spin" />
    </div>
  )

  const statCards = [
    { label: 'Total Customers', value: stats?.totalCustomers ?? 0,                   sub: `${stats?.totalStaff ?? 0} staff`,        color: 'text-purple-600' },
    { label: 'Active Subs',     value: stats?.activeSubs ?? 0,                       sub: `${stats?.suspendedSubs ?? 0} suspended`, color: 'text-emerald-600' },
    { label: 'Est. Revenue',    value: formatCurrency(stats?.estimatedRevenue ?? 0), sub: 'Based on active plans',                  color: 'text-amber-600'  },
    { label: 'Actual Revenue',  value: formatCurrency(stats?.actualRevenue ?? 0),    sub: 'Confirmed payments',                     color: 'text-blue-600'   },
  ]

  const actions = [
    { label: 'Manage users',       href: '/dashboard/admin/users',         style: 'text-purple-600 bg-purple-50 border-purple-100' },
    { label: 'View subscriptions', href: '/dashboard/admin/subscriptions', style: 'text-blue-600   bg-blue-50   border-blue-100'   },
    { label: 'Assign technicians', href: '/dashboard/admin/users',         style: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'Support tickets',    href: '/dashboard/support',             style: 'text-amber-600  bg-amber-50  border-amber-100'  },
  ]

  const dotColor: Record<string, string> = {
    'text-purple-600': 'bg-purple-500',
    'text-blue-600':   'bg-blue-500',
    'text-emerald-600': 'bg-emerald-500',
    'text-amber-600':  'bg-amber-500',
  }

  return (
    <div className="flex-1 bg-[#f7f7f5] min-h-screen px-10 py-12 flex flex-col gap-10">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate-400 mb-1">Admin · Full access</p>
          <h1 className="text-[30px] font-semibold tracking-tight text-slate-900 leading-none mb-2">
            Admin dashboard
          </h1>
          <p className="text-[14px] text-slate-400">
            Logged in as <span className="text-slate-600 font-medium">{user?.name}</span>
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/admin/users')}
          className="text-[12px] font-semibold bg-slate-900 text-white rounded-xl px-5 py-2.5 hover:opacity-80 transition-opacity"
        >
          + Add user
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border border-black/[0.08] rounded-2xl p-6 hover:-translate-y-0.5 transition-transform cursor-default">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 mb-4">{s.label}</p>
            <p className={`text-[22px] font-semibold tracking-tight leading-none mb-2 ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main row */}
      <div className="grid grid-cols-[1fr_220px] gap-3 items-start">

        {/* Recent users */}
        <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
            <span className="text-[13px] font-semibold text-slate-800">Recent users</span>
            <button
              onClick={() => router.push('/dashboard/admin/users')}
              className="text-[12px] font-medium text-purple-600 hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="px-6">
            <table className="w-full">
              <thead>
                <tr>
                  {['Name', 'Role', 'Plan', 'Status', ''].map((h) => (
                    <th key={h} className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-left py-3.5 border-b border-black/[0.06] pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-black/[0.04] last:border-0">
                    <td className="py-4 pr-4">
                      <p className="text-[13px] font-medium text-slate-700">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${ROLE_STYLE[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-slate-400 text-[13px]">
                      {u.subscription?.plan?.name ?? '—'}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLE[u.status]}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => router.push('/dashboard/admin/users')}
                        className="text-[11px] font-medium text-slate-400 hover:text-purple-600 border border-black/[0.07] hover:border-purple-100 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.06]">
            <span className="text-[13px] font-semibold text-slate-800">Quick actions</span>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {actions.map((a) => (
              <button
                key={a.label}
                onClick={() => router.push(a.href)}
                className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-black/[0.06] rounded-xl px-4 py-3 text-left transition-all"
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor[a.style.split(' ')[0]]}`} />
                <span className="text-slate-600 text-[12px] font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
        <span className="font-mono text-[10px] tracking-widest text-slate-300">© 2026 XENON.ECOSYSTEM</span>
        <div className="flex gap-5">
          {['Privacy', 'Terms'].map((l) => (
            <span key={l} className="text-[12px] text-slate-300 hover:text-slate-700 cursor-pointer transition-colors">{l}</span>
          ))}
        </div>
      </div>

    </div>
  )
}