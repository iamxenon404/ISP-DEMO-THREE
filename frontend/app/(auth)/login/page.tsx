'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser, saveAuth } from '@/lib/auth'

const DEMO_ACCOUNTS = [
  { role: 'Admin',      email: 'admin@isp.com'      },
  { role: 'Customer',   email: 'customer@isp.com'   },
  { role: 'Support',    email: 'support@isp.com'    },
  { role: 'Tech',       email: 'technician@isp.com' },
]

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await loginUser(form)
      saveAuth(data.token, data.user)
      document.cookie = `auth_token=${data.token}; path=/`
      document.cookie = `auth_role=${data.user.role}; path=/`
      router.push(data.user.dashboard)
    } catch (err: any) {
      setError(
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.message ||
        'Invalid credentials. Try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090f] flex">
      {/* Left */}
      <div className="hidden lg:flex w-[460px] flex-shrink-0 flex-col justify-between p-12 border-r border-white/[0.06] bg-[#0c0c14]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
          <span className="text-white font-semibold text-sm">ISP AutoPilot</span>
        </div>

        <div>
          <h1 className="text-white text-3xl font-semibold leading-snug tracking-tight mb-4">
            Manage your network.<br />Serve your customers.
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            A complete ISP operations platform — subscriptions, support, and field operations in one place.
          </p>
        </div>

        <div>
          <p className="text-white/25 text-[11px] font-semibold uppercase tracking-widest mb-3">
            Demo accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.role}
                type="button"
                onClick={() => setForm({ email: a.email, password: 'password' })}
                className="flex flex-col gap-1 bg-white/[0.03] hover:bg-blue-500/[0.08] border border-white/[0.07] hover:border-blue-500/30 rounded-xl p-3 text-left transition-all"
              >
                <span className="text-blue-400 text-[11px] font-bold">{a.role}</span>
                <span className="text-white/30 text-[11px]">{a.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-white text-2xl font-semibold tracking-tight mb-2">Sign in</h2>
            <p className="text-white/35 text-sm">Welcome back. Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-white/55 text-[13px] font-medium">Email address</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="bg-white/[0.04] border border-white/10 focus:border-blue-500/50 focus:bg-blue-500/[0.03] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white/55 text-[13px] font-medium">Password</label>
              <input
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-white/[0.04] border border-white/10 focus:border-blue-500/50 focus:bg-blue-500/[0.03] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl py-3 h-[46px] flex items-center justify-center transition-all"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Sign in'
              }
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-400 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}