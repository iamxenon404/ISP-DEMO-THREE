'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getStoredUser } from '@/lib/auth'

interface Job {
  id: number
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  user: { id: number; name: string; email: string }
}

const STATUS_MAP: Record<string, { label: string; style: string; btn?: string; btnStyle?: string }> = {
  pending:     { label: 'Pending',     style: 'text-amber-600 bg-amber-50 border-amber-100',     btn: 'Initialize Job', btnStyle: 'bg-amber-600 text-white border-amber-600' },
  assigned:    { label: 'Assigned',    style: 'text-blue-600 bg-blue-50 border-blue-100',       btn: 'Start Installation', btnStyle: 'bg-blue-600 text-white border-blue-600' },
  in_progress: { label: 'In Progress', style: 'text-purple-600 bg-purple-50 border-purple-100',   btn: 'Mark as Complete', btnStyle: 'bg-purple-600 text-white border-purple-600' },
  completed:   { label: 'Completed',   style: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
}

const NEXT_STATUS: Record<string, string> = {
  pending:     'in_progress',
  assigned:    'in_progress',
  in_progress: 'completed',
}

export default function TechnicianJobsPage() {
  const user = getStoredUser()
  const [jobs,      setJobs]     = useState<Job[]>([])
  const [loading,   setLoading]  = useState(true)
  const [updating,  setUpdating] = useState<number | null>(null)
  const [filter,    setFilter]   = useState('all')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await api.get(`/admin/technicians/${user?.id}/jobs`)
      setJobs(res.data.jobs || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (jobId: number, currentStatus: string) => {
    const nextStatus = NEXT_STATUS[currentStatus]
    if (!nextStatus) return
    setUpdating(jobId)
    try {
      await api.patch(`/admin/installations/${jobId}/status`, { status: nextStatus })
      setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: nextStatus } : j))
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="flex-1 bg-[#f7f7f5] min-h-screen px-10 py-12 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 text-[30px] font-semibold tracking-tight leading-none mb-2">Field Operations</h1>
        <p className="text-slate-400 text-[14px] font-medium">
          Manage your assigned installations and service tasks.
        </p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: jobs.length, color: 'text-slate-900' },
          { label: 'Awaiting',    value: jobs.filter((j) => j.status === 'assigned').length, color: 'text-blue-600' },
          { label: 'Active',      value: jobs.filter((j) => j.status === 'in_progress').length, color: 'text-purple-600' },
          { label: 'Fulfilled',   value: jobs.filter((j) => j.status === 'completed').length, color: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-black/[0.08] rounded-2xl p-6 shadow-sm flex flex-col gap-1">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{s.label}</span>
            <span className={`text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Main Schedule Container */}
      <div className="bg-white border border-black/[0.08] rounded-3xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-black/[0.05] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-slate-900 font-bold text-[16px] tracking-tight">Deployment Schedule</h3>
          
          <div className="flex bg-[#f7f7f5] p-1 rounded-xl border border-black/[0.03]">
            {['all', 'assigned', 'in_progress', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-all capitalize tracking-tight ${
                  filter === f
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="w-5 h-5 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-slate-200 text-3xl mb-2">⊘</div>
              <p className="text-slate-400 text-[13px] font-medium italic">No entries found for this lifecycle state.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((job) => {
                const s = STATUS_MAP[job.status] ?? STATUS_MAP.pending
                return (
                  <div key={job.id} className="group flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white hover:bg-[#fcfcfb] border border-black/[0.06] rounded-2xl p-5 transition-all shadow-sm hover:shadow-md">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[14px] flex-shrink-0 ${s.style}`}>
                        {job.user?.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-900 text-[15px] font-bold tracking-tight">{job.user?.name}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border uppercase tracking-wider ${s.style}`}>
                            {s.label}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[12px] font-medium">{job.user?.email}</span>
                        {job.notes && (
                          <div className="mt-2 text-slate-500 text-[11px] bg-slate-50 p-2 rounded-lg border border-black/[0.03]">
                            <span className="font-bold uppercase text-[9px] block text-slate-400 mb-1">Field Notes:</span>
                            "{job.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 flex-shrink-0 border-t md:border-t-0 border-black/[0.05] pt-4 md:pt-0">
                      <div className="flex flex-col md:items-end">
                         <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Job ID</span>
                         <span className="text-slate-600 font-mono text-[12px]">#OP-{job.id}</span>
                      </div>
                      
                      {s.btn ? (
                        <button
                          onClick={() => handleUpdate(job.id, job.status)}
                          disabled={updating === job.id}
                          className={`text-[11px] font-bold px-5 py-2.5 rounded-xl border transition-all active:scale-95 disabled:opacity-50 shadow-sm ${s.btnStyle}`}
                        >
                          {updating === job.id ? 'Updating...' : s.btn}
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          Finalized
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-slate-300 text-[10px] font-mono uppercase tracking-widest">
         Terminal Secure • Operator ID: {user?.id} • {formatDate(new Date().toISOString())}
      </div>
    </div>
  )
}