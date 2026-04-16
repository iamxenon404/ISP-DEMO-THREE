'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  subscription?: {
    status: string
    expiryDate: string
    plan: { name: string; speed: string; price: number }
  } | null
}

interface Technician {
  id: number
  name: string
  email: string
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

const ROLE_FILTERS = ['all', 'customer', 'support', 'technician', 'admin']

export default function AdminUsersPage() {
  const [users,       setUsers]       = useState<User[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading,     setLoading]     = useState(true)
  const [roleFilter,  setRoleFilter]  = useState('all')
  const [updating,    setUpdating]    = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [assignModal,  setAssignModal]  = useState(false)
  const [selectedTech, setSelectedTech] = useState<number | null>(null)
  const [assigning,    setAssigning]    = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, techsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/technicians'),
      ])
      setUsers(usersRes.data.users)
      setTechnicians(techsRes.data.technicians)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId: number, status: string) => {
    setUpdating(userId)
    try {
      await api.patch(`/admin/users/${userId}/status`, { status })
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status } : u))
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  const handleAssign = async () => {
    if (!selectedUser || !selectedTech) return
    setAssigning(true)
    try {
      // Create installation then assign
      await api.post('/admin/installations/assign-direct', {
        userId:      selectedUser.id,
        technicianId: selectedTech,
      })
      setAssignModal(false)
      setSelectedUser(null)
      setSelectedTech(null)
    } catch (err) {
      console.error(err)
    } finally {
      setAssigning(false)
    }
  }

  const filtered = roleFilter === 'all'
    ? users
    : users.filter((u) => u.role === roleFilter)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">User management</h1>
        <p className="text-white/35 text-sm">Manage all users, roles and access.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setRoleFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all capitalize ${
              roleFilter === f
                ? 'text-purple-400 bg-purple-400/10 border-purple-400/25'
                : 'text-white/35 border-white/[0.07] hover:text-white/60'
            }`}
          >
            {f === 'all' ? `All (${users.length})` : `${f} (${users.filter((u) => u.role === f).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <span className="w-5 h-5 border-2 border-white/20 border-t-purple-400 rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {['User', 'Role', 'Plan', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-white/25 text-[11px] font-semibold uppercase tracking-wider text-left px-5 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-all">
                  <td className="px-5 py-4">
                    <p className="text-white/85 text-[13px] font-medium">{u.name}</p>
                    <p className="text-white/30 text-[11px]">{u.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${ROLE_STYLE[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/40 text-[13px]">
                    {u.subscription?.plan?.name ?? '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLE[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/30 text-[13px]">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {u.status !== 'active' && (
                        <button
                          onClick={() => handleStatusChange(u.id, 'active')}
                          disabled={updating === u.id}
                          className="text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/20 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}
                      {u.status !== 'suspended' && (
                        <button
                          onClick={() => handleStatusChange(u.id, 'suspended')}
                          disabled={updating === u.id}
                          className="text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      )}
                      {u.role === 'customer' && (
                        <button
                          onClick={() => { setSelectedUser(u); setAssignModal(true) }}
                          className="text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/20 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          Assign tech
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assign Technician Modal */}
      {assignModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Assign Technician</h3>
              <button onClick={() => setAssignModal(false)} className="text-white/30 hover:text-white/60 text-xl">✕</button>
            </div>

            <p className="text-white/50 text-sm mb-5">
              Assigning a technician to <span className="text-white font-medium">{selectedUser.name}</span>
            </p>

            <div className="flex flex-col gap-2 mb-6">
              {technicians.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-4">No active technicians available</p>
              ) : technicians.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTech(t.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    selectedTech === t.id
                      ? 'bg-emerald-400/10 border-emerald-400/30'
                      : 'bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${selectedTech === t.id ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/[0.06] text-white/40'}`}>
                    {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-white/85 text-sm font-medium">{t.name}</p>
                    <p className="text-white/30 text-xs">{t.email}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAssignModal(false)}
                className="flex-1 bg-white/[0.04] border border-white/10 text-white/60 font-medium text-sm rounded-lg py-2.5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedTech || assigning}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold text-sm rounded-lg py-2.5 flex items-center justify-center transition-all"
              >
                {assigning
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Assign'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}