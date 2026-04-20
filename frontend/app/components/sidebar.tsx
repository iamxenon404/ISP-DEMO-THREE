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
  customer:   'bg-blue-400',
  admin:      'bg-purple-400',
  support:    'bg-amber-400',
  technician: 'bg-emerald-400',
}

const ROLE_ACTIVE: Record<Role, string> = {
  customer:   'text-blue-400   bg-blue-400/10   border-blue-400/20',
  admin:      'text-purple-400 bg-purple-400/10 border-purple-400/20',
  support:    'text-amber-400  bg-amber-400/10  border-amber-400/20',
  technician: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
}

const ROLE_BADGE: Record<Role, string> = {
  customer:   'text-blue-400   bg-blue-400/10   border-blue-400/20',
  admin:      'text-purple-400 bg-purple-400/10 border-purple-400/20',
  support:    'text-amber-400  bg-amber-400/10  border-amber-400/20',
  technician: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
}

const ROLE_AVATAR: Record<Role, string> = {
  customer:   'text-blue-400   bg-blue-400/10   border-blue-400/20',
  admin:      'text-purple-400 bg-purple-400/10 border-purple-400/20',
  support:    'text-amber-400  bg-amber-400/10  border-amber-400/20',
  technician: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
}

const ROLE_LABEL: Record<Role, string> = {
  customer:   'Customer',
  admin:      'Administrator',
  support:    'Support Agent',
  technician: 'Technician',
}

const SKELETON = (
  <aside className="w-[200px] flex-shrink-0 h-screen sticky top-0 bg-[#0a0a0a] border-r border-white/[0.05] flex flex-col px-4 py-8" />
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

  const role = (user?.role ?? 'customer') as Role
  const nav  = NAV[role]
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
    <aside className="w-[200px] flex-shrink-0 h-screen sticky top-0 bg-[#0a0a0a] border-r border-white/[0.05] flex flex-col px-4 py-8">

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ROLE_DOT[role]}`} />
        <span className="text-white text-[13px] font-semibold tracking-tight">ISP AutoPilot</span>
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
                  : 'text-white/35 hover:text-white/65 hover:bg-white/[0.04] border-transparent'
              }`}
            >
              <span className={`w-1 h-1 rounded-full flex-shrink-0 ${ROLE_DOT[role]} ${active ? 'opacity-100' : 'opacity-25'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.05] pt-6 flex flex-col gap-4">

        {/* User */}
        <div className="flex items-center gap-2.5 px-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 border ${ROLE_AVATAR[role]}`}>
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white/75 text-[12px] font-medium truncate">{user?.name ?? 'User'}</span>
            <span className="text-white/25 text-[10px] truncate">{user?.email ?? ''}</span>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="mx-2 text-left text-[12px] font-medium text-white/25 hover:text-red-400 bg-white/[0.03] hover:bg-red-500/[0.07] border border-white/[0.05] hover:border-red-500/20 rounded-lg px-3 py-2 transition-all disabled:opacity-50"
        >
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>

      </div>
    </aside>
  )
}