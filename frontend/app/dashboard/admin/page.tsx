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
  subscription?: {
    status: string
    plan: { name: string; price: number }
  } | null
}

const ROLE_STYLE: Record<string, string> = {
  customer:   'text-blue-400   bg-blue-400/10   border-blue-400/20',
  admin:      'text-purple-400 bg-purple-400/10 border-purple-400/20',
  support:    'text-amber-400  bg-amber-400/10  border-amber-400/20',
  technician: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
}

const STATUS_STYLE: Record<string, string> = {
  active:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  suspended: 'text-red-400    bg-red-400/10    border-red-400/20',
  pending:   'text-amber-400  bg-amber-400/10  border-amber-400/20',
}

export default function AdminOverview() {
  const user   = getStoredUser()
  const router = useRouter()

  const [stats,       setStats]       = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

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

  const formatCurrency = (amount: number) =>
    `₦${amount.toLocaleString()}`

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 border-white/20 border-t-purple-400 rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Customers', value: stats?.totalCustomers ?? 0,          sub: `${stats?.totalStaff ?? 0} staff`,         color: 'text-purple-400' },
    { label: 'Active Subs',     value: stats?.activeSubs ?? 0,              sub: `${stats?.suspendedSubs ?? 0} suspended`,  color: 'text-emerald-400' },
    { label: 'Est. Revenue',    value: formatCurrency(stats?.estimatedRevenue ?? 0), sub: 'Based on active plans',          color: 'text-amber-400'  },
    { label: 'Actual Revenue',  value: formatCurrency(stats?.actualRevenue ?? 0),    sub: 'Confirmed payments',             color: 'text-blue-400'   },
  ]

  const actions = [
    { label: 'Manage users',        href: '/dashboard/admin/users',         color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
    { label: 'View subscriptions',  href: '/dashboard/admin/subscriptions', color: 'text-blue-400   bg-blue-400/10   border-blue-400/20'   },
    { label: 'Assign technicians',  href: '/dashboard/admin/users',         color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    { label: 'Support tickets',     href: '/dashboard/support',             color: 'text-amber-400  bg-amber-400/10  border-amber-400/20'  },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">Admin dashboard</h1>
          <p className="text-white/35 text-sm">
            Logged in as <span className="text-white/60 font-medium">{user?.name}</span> — full system access.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/admin/users')}
          className="bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all"
        >
          + Add user
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-2">
            <span className="text-white/35 text-xs font-medium">{s.label}</span>
            <span className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</span>
            <span className="text-white/30 text-xs">{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 items-start">
        {/* Recent users */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold text-[15px]">Recent users</h3>
            <button
              onClick={() => router.push('/dashboard/admin/users')}
              className="text-purple-400 text-sm font-medium hover:underline"
            >
              View all →
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                {['Name', 'Role', 'Plan', 'Status', ''].map((h) => (
                  <th key={h} className="text-white/25 text-[11px] font-semibold uppercase tracking-wider text-left pb-3 border-b border-white/[0.06] pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-white/[0.04] last:border-0">
                  <td className="py-3.5 pr-4">
                    <p className="text-white/85 text-[13px] font-medium">{u.name}</p>
                    <p className="text-white/30 text-[11px]">{u.email}</p>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${ROLE_STYLE[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-white/40 text-[13px]">
                    {u.subscription?.plan?.name ?? '—'}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLE[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <button
                      onClick={() => router.push('/dashboard/admin/users')}
                      className="text-white/30 hover:text-purple-400 border border-white/[0.07] hover:border-purple-400/25 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick actions */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <h3 className="text-white font-semibold text-[15px] mb-4">Quick actions</h3>
          <div className="flex flex-col gap-2">
            {actions.map((a) => (
              <button
                key={a.label}
                onClick={() => router.push(a.href)}
                className="flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-xl p-3.5 text-left transition-all"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.color.split(' ')[0].replace('text-', 'bg-')}`} />
                <span className="text-white/60 text-[13px] font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}