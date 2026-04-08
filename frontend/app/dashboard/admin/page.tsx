'use client'

import { getStoredUser } from '@/lib/auth'

const stats = [
  { label: 'Total Users',  value: '1,284',  sub: '+12 this week',  color: 'text-purple-400' },
  { label: 'Active Subs',  value: '1,091',  sub: '84.9% of users', color: 'text-emerald-400'},
  { label: 'Suspended',    value: '193',    sub: 'Needs attention', color: 'text-red-400'    },
  { label: 'Est. Revenue', value: '₦16.4M', sub: 'This month',     color: 'text-amber-400'  },
]

const users = [
  { name: 'Emeka Obi',    email: 'emeka@gmail.com', role: 'customer',   status: 'active'    },
  { name: 'Aisha Bello',  email: 'aisha@mail.com',  role: 'customer',   status: 'suspended' },
  { name: 'Chidi Nwosu',  email: 'chidi@corp.ng',   role: 'support',    status: 'active'    },
  { name: 'Fatima Garba', email: 'fatima@isp.ng',   role: 'technician', status: 'active'    },
]

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

const actions = [
  { label: 'Verify pending users',      color: 'text-blue-400   bg-blue-400/10   border-blue-400/20',    count: 8  },
  { label: 'Review suspended accounts', color: 'text-red-400    bg-red-400/10    border-red-400/20',     count: 14 },
  { label: 'Assign technicians',        color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', count: 3  },
  { label: 'Pending installations',     color: 'text-amber-400  bg-amber-400/10  border-amber-400/20',   count: 6  },
]

export default function AdminOverview() {
  const user = getStoredUser()

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
        <div className="flex gap-2">
          <button className="text-white/50 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-xs font-semibold px-4 py-2 rounded-lg transition-all">
            Export report
          </button>
          <button className="text-white bg-purple-500 hover:bg-purple-600 text-xs font-semibold px-4 py-2 rounded-lg transition-all">
            + Add user
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-2">
            <span className="text-white/35 text-xs font-medium">{s.label}</span>
            <span className={`text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</span>
            <span className="text-white/30 text-xs">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Table + actions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 items-start">
        {/* Users table */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold text-[15px]">Recent users</h3>
            <button className="text-purple-400 text-sm font-medium hover:underline">View all →</button>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-white/25 text-[11px] font-semibold uppercase tracking-wider text-left pb-3 border-b border-white/[0.06] pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b border-white/[0.04] last:border-0">
                  <td className="py-3.5 pr-4 text-white/85 text-[13px] font-medium">{u.name}</td>
                  <td className="py-3.5 pr-4 text-white/35 text-[13px]">{u.email}</td>
                  <td className="py-3.5 pr-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${ROLE_STYLE[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLE[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <button className="text-white/35 hover:text-purple-400 bg-white/[0.03] hover:bg-purple-400/10 border border-white/[0.07] hover:border-purple-400/25 text-xs font-medium px-3 py-1.5 rounded-lg transition-all">
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
                className="flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/10 rounded-xl p-3.5 text-left transition-all"
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.color.split(' ')[2]}`} />
                <span className="flex-1 text-white/60 text-[13px] font-medium">{a.label}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${a.color}`}>{a.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}