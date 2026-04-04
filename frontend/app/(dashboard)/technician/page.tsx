'use client'

import { getStoredUser } from '@/lib/auth'

const stats = [
  { label: 'Assigned Jobs', value: '7',  sub: '2 today',         color: 'text-emerald-400' },
  { label: 'In Progress',   value: '2',  sub: 'Active right now', color: 'text-blue-400'    },
  { label: 'Completed',     value: '41', sub: 'All time',         color: 'text-purple-400'  },
  { label: 'Pending',       value: '5',  sub: 'Not started',      color: 'text-amber-400'   },
]

const jobs = [
  { id: 'JOB-088', customer: 'Emeka Obi',      address: '14 Awolowo Rd, Ikoyi, Lagos',    type: 'New installation',  status: 'in_progress', time: 'Today, 10:00 AM'  },
  { id: 'JOB-087', customer: 'Ngozi Eze',       address: '3 Allen Ave, Ikeja, Lagos',       type: 'Router replacement', status: 'pending',     time: 'Today, 2:00 PM'   },
  { id: 'JOB-086', customer: 'Bola Tinubu Jr.', address: '9 Marina St, Lagos Island',       type: 'New installation',  status: 'pending',     time: 'Tomorrow, 9:00 AM'},
  { id: 'JOB-085', customer: 'Aisha Garba',     address: '22 Gwarinpa Estate, Abuja',       type: 'Cable fault repair', status: 'completed',   time: 'Yesterday'        },
]

const STATUS_MAP: Record<string, { label: string; style: string; btn: string }> = {
  pending:     { label: 'Pending',     style: 'text-amber-400  bg-amber-400/10  border-amber-400/20',   btn: 'Start job'      },
  in_progress: { label: 'In Progress', style: 'text-blue-400   bg-blue-400/10   border-blue-400/20',    btn: 'Mark complete'  },
  completed:   { label: 'Completed',   style: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', btn: ''             },
}

export default function TechnicianOverview() {
  const user = getStoredUser()

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-semibold tracking-tight mb-1">My jobs</h1>
          <p className="text-white/35 text-sm">
            Hey {user?.name?.split(' ')[0]}, you have{' '}
            <span className="text-emerald-400 font-semibold">2 active jobs</span> today.
          </p>
        </div>
        <div className="text-white/40 bg-white/[0.03] border border-white/[0.07] text-xs font-medium px-4 py-2.5 rounded-lg">
          📅 {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'short' })}
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

      {/* Jobs */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-[15px]">Job schedule</h3>
          <div className="flex gap-1.5">
            {['All', 'Today', 'Pending', 'Completed'].map((f, i) => (
              <button
                key={f}
                className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  i === 0
                    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25'
                    : 'text-white/35 bg-transparent border-white/[0.07] hover:text-white/60'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {jobs.map((job) => {
            const s = STATUS_MAP[job.status]
            return (
              <div
                key={job.id}
                className="flex items-start justify-between gap-6 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-xl p-4 transition-all"
              >
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-white/20 text-[11px] font-bold font-mono">{job.id}</span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${s.style}`}>
                      {s.label}
                    </span>
                  </div>
                  <span className="text-white/85 text-[14px] font-semibold">{job.customer}</span>
                  <span className="text-white/30 text-[12px]">📍 {job.address}</span>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-white/45 text-[12px] font-medium">{job.type}</span>
                  <span className="text-white/25 text-[11px]">{job.time}</span>
                  <div className="flex gap-2 mt-1">
                    {job.status !== 'completed' && (
                      <button className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-75 ${s.style}`}>
                        {s.btn}
                      </button>
                    )}
                    <button className="text-white/30 hover:text-white/60 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}