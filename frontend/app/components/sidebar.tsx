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
    { label: 'Overview',      href: '/dashboard/admin'               },
    { label: 'Users',         href: '/dashboard/admin/users'         },
    { label: 'Subscriptions', href: '/dashboard/admin/subscriptions' },
    { label: 'Network',       href: '/dashboard/admin/network'       },
    { label: 'Technicians',   href: '/dashboard/admin/technicians'   },
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

const ROLE_DOT: Record<Role, string> = {
  customer:   'bg-blue-500',
  admin:      'bg-purple-500',
  support:    'bg-amber-500',
  technician: 'bg-emerald-500',
}

const ROLE_ACTIVE: Record<Role, string> = {
  customer:   'text-blue-600   bg-blue-50   border-blue-100',
  admin:      'text-purple-600 bg-purple-50 border-purple-100',
  support:    'text-amber-600  bg-amber-50  border-amber-100',
  technician: 'text-emerald-600 bg-emerald-50 border-emerald-100',
}

const ROLE_BADGE: Record<Role, string> = {
  customer:   'text-blue-600   bg-blue-50   border-blue-100',
  admin:      'text-purple-600 bg-purple-50 border-purple-100',
  support:    'text-amber-600  bg-amber-50  border-amber-100',
  technician: 'text-emerald-600 bg-emerald-50 border-emerald-100',
}

const ROLE_AVATAR: Record<Role, string> = {
  customer:   'text-blue-600   bg-blue-50   border-blue-100',
  admin:      'text-purple-600 bg-purple-50 border-purple-100',
  support:    'text-amber-600  bg-amber-50  border-amber-100',
  technician: 'text-emerald-600 bg-emerald-50 border-emerald-100',
}

const ROLE_LABEL: Record<Role, string> = {
  customer:   'Customer',
  admin:      'Administrator',
  support:    'Support Agent',
  technician: 'Technician',
}

const SKELETON = (
  <aside className="w-[200px] flex-shrink-0 h-screen sticky top-0 bg-[#f7f7f5] border-r border-black/[0.06] flex flex-col px-4 py-8" />
)

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [user, setUser]             = useState<any>(null)
  const [mounted, setMounted]       = useState(false)

  useEffect(() => {
    setUser(getStoredUser())
    setMounted(true)
  }, [])

  const role     = (user?.role ?? 'customer') as Role
  const nav      = NAV[role]
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

  if (!mounted) return SKELETON

  return (
    <aside className="w-[200px] flex-shrink-0 h-screen sticky top-0 bg-[#f7f7f5] border-r border-black/[0.06] flex flex-col px-4 py-8">

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ROLE_DOT[role]}`} />
        <span className="text-slate-900 text-[13px] font-semibold tracking-tight">ISP AutoPilot</span>
      </div>

      {/* Role badge */}
      <div className={`text-[10px] font-semibold uppercase tracking-widest border rounded-lg px-3 py-1.5 mx-2 mb-8 w-fit ${ROLE_BADGE[role]}`}>
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
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all border ${
                active
                  ? ROLE_ACTIVE[role]
                  : 'text-slate-400 hover:text-slate-700 hover:bg-black/[0.03] border-transparent'
              }`}
            >
              <span className={`w-1 h-1 rounded-full flex-shrink-0 ${ROLE_DOT[role]} ${active ? 'opacity-100' : 'opacity-30'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-black/[0.06] pt-6 flex flex-col gap-4">

        {/* User */}
        <div className="flex items-center gap-2.5 px-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 border ${ROLE_AVATAR[role]}`}>
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-slate-700 text-[12px] font-medium truncate">{user?.name ?? 'User'}</span>
            <span className="text-slate-400 text-[10px] truncate">{user?.email ?? ''}</span>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="mx-2 text-left text-[12px] font-medium text-slate-400 hover:text-red-500 bg-black/[0.02] hover:bg-red-50 border border-black/[0.06] hover:border-red-100 rounded-lg px-3 py-2 transition-all disabled:opacity-50"
        >
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>

      </div>
    </aside>
  )
}