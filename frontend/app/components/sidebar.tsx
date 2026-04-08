'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { logoutUser, getStoredUser, type Role } from '@/lib/auth'

const NAV: Record<Role, { label: string; href: string }[]> = {
  customer: [
    { label: 'Overview',     href: '/dashboard/customer'              },
    { label: 'Subscription', href: '/dashboard/customer/subscription' },
    { label: 'Support',      href: '/dashboard/customer/support'      },
    { label: 'Installation', href: '/dashboard/customer/installation' },
  ],
  admin: [
    { label: 'Overview',      href: '/dashboard/admin'                },
    { label: 'Users',         href: '/dashboard/admin/users'          },
    { label: 'Subscriptions', href: '/dashboard/admin/subscriptions'  },
    { label: 'Network',       href: '/dashboard/admin/network'        },
    { label: 'Technicians',   href: '/dashboard/admin/technicians'    },
  ],
  support: [
    { label: 'Overview', href: '/dashboard/support'         },
    { label: 'Tickets',  href: '/dashboard/support/tickets' },
  ],
  technician: [
    { label: 'Overview', href: '/dashboard/technician'      },
    { label: 'My Jobs',  href: '/dashboard/technician/jobs' },
  ],
}

const ROLE_COLOR: Record<Role, string> = {
  customer:   'text-blue-400   bg-blue-400/10   border-blue-400/25',
  admin:      'text-purple-400 bg-purple-400/10 border-purple-400/25',
  support:    'text-amber-400  bg-amber-400/10  border-amber-400/25',
  technician: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
}

const ROLE_ACTIVE: Record<Role, string> = {
  customer:   'text-blue-400   bg-blue-400/10   border-blue-400/25',
  admin:      'text-purple-400 bg-purple-400/10 border-purple-400/25',
  support:    'text-amber-400  bg-amber-400/10  border-amber-400/25',
  technician: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
}

const ROLE_DOT: Record<Role, string> = {
  customer:   'bg-blue-400   shadow-[0_0_8px_rgba(96,165,250,0.6)]',
  admin:      'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]',
  support:    'bg-amber-400  shadow-[0_0_8px_rgba(251,191,36,0.6)]',
  technician: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
}

const ROLE_LABEL: Record<Role, string> = {
  customer:   'Customer',
  admin:      'Administrator',
  support:    'Support Agent',
  technician: 'Technician',
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  // Load user data only on client after mount
  useEffect(() => {
    const userData = getStoredUser()
    setUser(userData)
    setMounted(true)
  }, [])

  const role = (user?.role ?? 'customer') as Role
  const nav = NAV[role]

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const handleLogout = async () => {
    setLoggingOut(true)
    try { await logoutUser() } catch {}
    document.cookie = 'auth_token=; path=/; max-age=0'
    document.cookie = 'auth_role=; path=/; max-age=0'
    router.push('/login')
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <aside className="w-[220px] flex-shrink-0 h-screen sticky top-0 bg-[#0c0c14] border-r border-white/[0.06] flex flex-col px-3 py-6">
        {/* Skeleton loading state */}
      </aside>
    )
  }

  return (
    <aside className="w-[220px] flex-shrink-0 h-screen sticky top-0 bg-[#0c0c14] border-r border-white/[0.06] flex flex-col px-3 py-6">
      {/* Brand */}
      <div className="flex items-center gap-2 px-3 mb-5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ROLE_DOT[role]}`} />
        <span className="text-white font-semibold text-[13px]">ISP AutoPilot</span>
      </div>

      {/* Role badge */}
      <div className={`text-[10px] font-bold uppercase tracking-widest border rounded-md px-3 py-1.5 mx-3 mb-6 w-fit ${ROLE_COLOR[role]}`}>
        {ROLE_LABEL[role]}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {nav.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                active
                  ? `${ROLE_ACTIVE[role]} border`
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'opacity-100' : 'opacity-30'} ${ROLE_DOT[role].split(' ')[0]}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] pt-4 flex flex-col gap-3">
        <div className="flex items-center gap-2.5 px-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 border ${ROLE_COLOR[role]}`}>
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white/80 text-[12px] font-semibold truncate">{user?.name ?? 'User'}</span>
            <span className="text-white/25 text-[10px] truncate">{user?.email ?? ''}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="mx-3 text-left text-[12px] font-medium text-white/30 hover:text-red-400 bg-white/[0.03] hover:bg-red-500/[0.08] border border-white/[0.06] hover:border-red-500/20 rounded-lg px-3 py-2 transition-all"
        >
          {loggingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </aside>
  )
}