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

const STATUS_MAP: Record<string, { label: string; style: string; btn?: string }> = {
  pending:     { label: 'Pending',     style: 'text-amber-400  bg-amber-400/10  border-amber-400/20',    btn: 'Start job'      },
  assigned:    { label: 'Assigned',    style: 'text-blue-400   bg-blue-400/10   border-blue-400/20',     btn: 'Start job'      },
  in_progress: { label: 'In Progress', style: 'text-purple-400 bg-purple-400/10 border-purple-400/20',   btn: 'Mark complete'  },
  completed:   { label: 'Completed',   style: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
}

const NEXT_STATUS: Record<string, string> = {
  pending:     'in_progress',
  assigned:    'in_progress',
  in_progress: 'completed',
}

export default function TechnicianJobsPage() {
  const user = getStoredUser()
  const [jobs,     setJobs]     = useState<Job[]>([])
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await api.get(`/admin/technicians/${user?.id}/jobs`)
      setJobs(res.data.jobs)
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
    new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">My jobs</h1>
        <p className="text-white/35 text-sm">
          {jobs.filter((j) => j.status !== 'completed').length} active job{jobs.filter((j) => j.status !== 'completed').length !== 1 ? 's' : ''} assigned to you.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',       value: jobs.length,                                              color: 'text-white'       },
          { label: 'Assigned',    value: jobs.filter((j) => j.status === 'assigned').length,       color: 'text-blue-400'    },
          { label: 'In Progress', value: jobs.filter((j) => j.status === 'in_progress').length,    color: 'text-purple-400'  },
          { label: 'Completed',   value: jobs.filter((j) => j.status === 'completed').length,      color: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-2">
            <span className="text-white/35 text-xs font-medium">{s.label}</span>
            <span className={`text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filter + list */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-[15px]">Job schedule</h3>
          <div className="flex gap-1.5">
            {['all', 'assigned', 'in_progress', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all capitalize ${
                  filter === f
                    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25'
                    : 'text-white/35 border-white/[0.07] hover:text-white/60'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <span className="w-5 h-5 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-white/30 text-sm">No jobs in this category</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((job) => {
              const s = STATUS_MAP[job.status] ?? STATUS_MAP.pending
              return (
                <div key={job.id} className="flex items-start justify-between gap-6 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-xl p-4 transition-all">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-white/20 text-[11px] font-bold font-mono">#{job.id}</span>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${s.style}`}>
                        {s.label}
                      </span>
                    </div>
                    <span className="text-white/85 text-[14px] font-semibold">{job.user?.name}</span>
                    <span className="text-white/30 text-[12px]">{job.user?.email}</span>
                    {job.notes && <span className="text-white/25 text-[11px] italic">{job.notes}</span>}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-white/25 text-[11px]">Assigned {formatDate(job.createdAt)}</span>
                    {s.btn && (
                      <button
                        onClick={() => handleUpdate(job.id, job.status)}
                        disabled={updating === job.id}
                        className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-75 disabled:opacity-50 ${s.style}`}
                      >
                        {updating === job.id ? '...' : s.btn}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}