'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerUser, saveAuth, type Role } from '@/lib/auth'

const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: 'customer',   label: 'Customer',   desc: 'Manage subscription & support' },
  { value: 'admin',      label: 'Admin',       desc: 'Full system control & oversight' },
  { value: 'support',    label: 'Support',     desc: 'Handle tickets & customer issues' },
  { value: 'technician', label: 'Technician',  desc: 'Manage field installations' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'customer' as Role,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await registerUser(form)
      saveAuth(data.token, data.user)
      document.cookie = `auth_token=${data.token}; path=/`
      document.cookie = `auth_role=${data.user.role}; path=/`
      router.push(data.user.dashboard)
    } catch (err: any) {
      const errors = err?.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0] as string[]
        setError(first[0])
      } else {
        setError(err?.response?.data?.message || 'Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090f] flex">
      {/* Left */}
      <div className="hidden lg:flex w-[380px] flex-shrink-0 flex-col justify-between p-12 border-r border-white/[0.06] bg-[#0c0c14]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
          <span className="text-white font-semibold text-sm">ISP AutoPilot</span>
        </div>
        <div>
          <h1 className="text-white text-2xl font-semibold leading-snug tracking-tight mb-4">
            Set up your account in seconds.
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Get immediate access to your role-specific dashboard — subscriptions, support, or field operations.
          </p>
        </div>
        <p className="text-white/30 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 font-medium hover:underline">Sign in</Link>
        </p>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <h2 className="text-white text-2xl font-semibold tracking-tight mb-2">Create account</h2>
            <p className="text-white/35 text-sm">Fill in your details and choose your role.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-white/55 text-[13px] font-medium">Full name</label>
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="bg-white/[0.04] border border-white/10 focus:border-blue-500/50 focus:bg-blue-500/[0.03] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none transition-all"
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-white/55 text-[13px] font-medium">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="bg-white/[0.04] border border-white/10 focus:border-blue-500/50 focus:bg-blue-500/[0.03] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white/55 text-[13px] font-medium">Confirm password</label>
                <input
                  name="password_confirmation"
                  type="password"
                  required
                  value={form.password_confirmation}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="bg-white/[0.04] border border-white/10 focus:border-blue-500/50 focus:bg-blue-500/[0.03] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white/55 text-[13px] font-medium">Select your role</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, role: r.value }))}
                    className={`flex flex-col gap-1 p-4 rounded-xl border text-left transition-all ${
                      form.role === r.value
                        ? 'bg-blue-500/10 border-blue-500/50'
                        : 'bg-white/[0.03] border-white/[0.07] hover:bg-blue-500/[0.05] hover:border-blue-500/20'
                    }`}
                  >
                    <span className={`text-[13px] font-semibold ${form.role === r.value ? 'text-blue-400' : 'text-white'}`}>
                      {r.label}
                    </span>
                    <span className="text-white/30 text-[11px] leading-snug">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl py-3 h-[46px] flex items-center justify-center transition-all mt-1"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Create account'
              }
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}