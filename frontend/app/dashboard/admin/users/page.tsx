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
  customer:   'text-blue-600 bg-blue-50 border-blue-100',
  admin:      'text-purple-600 bg-purple-50 border-purple-100',
  support:    'text-amber-600 bg-amber-50 border-amber-100',
  technician: 'text-emerald-600 bg-emerald-50 border-emerald-100',
}

const STATUS_STYLE: Record<string, string> = {
  active:    'text-emerald-600 bg-emerald-50 border-emerald-100',
  suspended: 'text-red-600 bg-red-50 border-red-100',
  pending:   'text-amber-600 bg-amber-50 border-amber-100',
}

const ROLE_FILTERS = ['all', 'customer', 'support', 'technician', 'admin']

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')
  const [updating, setUpdating] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [assignModal, setAssignModal] = useState(false)
  const [selectedTech, setSelectedTech] = useState<number | null>(null)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, techsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/technicians'),
      ])
      setUsers(usersRes.data.users || [])
      setTechnicians(techsRes.data.technicians || [])
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
      await api.post('/admin/installations/assign-direct', {
        userId: selectedUser.id,
        technicianId: selectedTech,
      })
      
      setAssignModal(false)
      setSelectedUser(null)
      setSelectedTech(null)
      fetchData()
    } catch (err) {
      alert("Could not assign technician. An installation record may already exist.")
    } finally {
      setAssigning(false)
    }
  }

  const filtered = roleFilter === 'all'
    ? users
    : users.filter((u) => u.role === roleFilter)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="flex-1 bg-[#f7f7f5] min-h-screen px-10 py-12 flex flex-col gap-8">
      <div>
        <h1 className="text-slate-900 text-[30px] font-semibold tracking-tight leading-none mb-2">User Management</h1>
        <p className="text-slate-400 text-[14px]">Manage customer accounts, staff roles, and service access.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setRoleFilter(f)}
            className={`text-[12px] font-bold px-4 py-2 rounded-xl border transition-all capitalize tracking-tight ${
              roleFilter === f
                ? 'text-slate-900 bg-white border-slate-200 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            {f === 'all' ? `All Users (${users.length})` : `${f}s (${users.filter((u) => u.role === f).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <span className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.05] bg-[#fcfcfb]">
                {['User Details', 'Account Role', 'Active Plan', 'Status', 'Joined Date', 'Actions'].map((h) => (
                  <th key={h} className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-6 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#fcfcfb] transition-colors">
                  <td className="px-6 py-5">
                    <p className="text-slate-900 text-[14px] font-semibold">{u.name}</p>
                    <p className="text-slate-400 text-[12px]">{u.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${ROLE_STYLE[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-600 text-[13px] font-medium">
                    {u.subscription?.plan?.name ?? 'No active plan'}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${STATUS_STYLE[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-400 text-[13px]">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(u.id, u.status === 'active' ? 'suspended' : 'active')}
                        disabled={updating === u.id}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all disabled:opacity-50 ${
                          u.status === 'active' 
                            ? 'text-red-600 bg-white border-red-100 hover:bg-red-50' 
                            : 'text-emerald-600 bg-white border-emerald-100 hover:bg-emerald-50'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      
                      {u.role === 'customer' && (
                        <button
                          onClick={() => { setSelectedUser(u); setAssignModal(true) }}
                          className="text-blue-600 bg-white border border-blue-100 hover:bg-blue-50 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all"
                        >
                          Assign Tech
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-black/[0.08] shadow-2xl rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-900 font-semibold text-[18px]">Assign Technician</h3>
              <button onClick={() => setAssignModal(false)} className="text-slate-300 hover:text-slate-900">✕</button>
            </div>

            <p className="text-slate-500 text-[14px] mb-6">
              Select a field engineer to handle the installation for <span className="text-slate-900 font-bold">{selectedUser.name}</span>.
            </p>

            <div className="flex flex-col gap-2 mb-8 max-h-60 overflow-y-auto pr-2">
              {technicians.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4 italic">No available technicians found</p>
              ) : technicians.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTech(t.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                    selectedTech === t.id
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                      : 'bg-[#fcfcfb] border-black/[0.05] hover:border-black/[0.1]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${selectedTech === t.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {t.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 text-[14px] font-bold truncate">{t.name}</p>
                    <p className="text-slate-400 text-[12px] truncate">{t.email}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAssignModal(false)}
                className="flex-1 bg-white border border-black/[0.08] text-slate-600 font-bold text-[13px] rounded-xl py-3.5 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedTech || assigning}
                className="flex-1 bg-slate-900 hover:opacity-90 disabled:opacity-50 text-white font-bold text-[13px] rounded-xl py-3.5 flex items-center justify-center transition-all"
              >
                {assigning ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}