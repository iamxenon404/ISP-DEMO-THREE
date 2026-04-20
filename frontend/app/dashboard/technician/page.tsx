'use client'

import { getStoredUser } from '@/lib/auth'

const stats = [
  { label: 'Assigned Jobs', value: '7',  sub: '2 today',          color: 'text-emerald-600' },
  { label: 'In Progress',   value: '2',  sub: 'Active right now',  color: 'text-blue-600'    },
  { label: 'Completed',     value: '41', sub: 'All time',          color: 'text-purple-600'  },
  { label: 'Pending',       value: '5',  sub: 'Not started',       color: 'text-amber-600'   },
]

const jobs = [
  { id: 'JOB-088', customer: 'Emeka Obi',      address: '14 Awolowo Rd, Ikoyi, Lagos',  type: 'New installation',   status: 'in_progress', time: 'Today, 10:00 AM'   },
  { id: 'JOB-087', customer: 'Ngozi Eze',       address: '3 Allen Ave, Ikeja, Lagos',    type: 'Router replacement', status: 'pending',     time: 'Today, 2:00 PM'    },
  { id: 'JOB-086', customer: 'Bola Tinubu Jr.', address: '9 Marina St, Lagos Island',   type: 'New installation',   status: 'pending',     time: 'Tomorrow, 9:00 AM' },
  { id: 'JOB-085', customer: 'Aisha Garba',     address: '22 Gwarinpa Estate, Abuja',   type: 'Cable fault repair', status: 'completed',   time: 'Yesterday'          },
]

const STATUS_MAP: Record<string, { label: string; style: string; btn: string }> = {
  pending:     { label: 'Pending',     style: 'text-amber-600  bg-amber-50  border-amber-100',   btn: 'Start job'     },
  in_progress: { label: 'In Progress', style: 'text-blue-600   bg-blue-50   border-blue-100',    btn: 'Mark complete' },
  completed:   { label: 'Completed',   style: 'text-emerald-600 bg-emerald-50 border-emerald-100', btn: ''            },
}

export default function TechnicianOverview() {
  const user = getStoredUser()

  return (
    <div className="flex-1 bg-[#f7f7f5] min-h-screen px-10 py-12 flex flex-col gap-10">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate-400 mb-1">Technician · Field ops</p>
          <h1 className="text-[30px] font-semibold tracking-tight text-slate-900 leading-none mb-2">My jobs</h1>
          <p className="text-[14px] text-slate-400">
            Hey {user?.name?.split(' ')[0]}, you have{' '}
            <span className="text-emerald-600 font-semibold">2 active jobs</span> today.
          </p>
        </div>
        <div className="bg-white border border-black/[0.08] text-slate-500 text-[12px] font-medium px-4 py-2.5 rounded-xl">
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'short' })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-black/[0.08] rounded-2xl p-6 hover:-translate-y-0.5 transition-transform cursor-default">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 mb-4">{s.label}</p>
            <p className={`text-[28px] font-semibold tracking-tight leading-none mb-2 ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Jobs */}
      <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
          <span className="text-[13px] font-semibold text-slate-800">Job schedule</span>
          <div className="flex gap-1.5">
            {['All', 'Today', 'Pending', 'Completed'].map((f, i) => (
              <button
                key={f}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  i === 0
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                    : 'text-slate-400 border-black/[0.07] hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 flex flex-col gap-3">
          {jobs.map((job) => {
            const s = STATUS_MAP[job.status]
            return (
              <div
                key={job.id}
                className="flex items-start justify-between gap-6 bg-slate-50 hover:bg-slate-100/70 border border-black/[0.06] rounded-xl p-5 transition-all"
              >
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400 text-[11px] font-semibold font-mono">{job.id}</span>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${s.style}`}>
                      {s.label}
                    </span>
                  </div>
                  <span className="text-[14px] font-semibold text-slate-800">{job.customer}</span>
                  <span className="text-slate-400 text-[12px]">📍 {job.address}</span>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-slate-500 text-[12px] font-medium">{job.type}</span>
                  <span className="text-slate-400 text-[11px]">{job.time}</span>
                  <div className="flex gap-2 mt-1">
                    {job.status !== 'completed' && (
                      <button className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-75 ${s.style}`}>
                        {s.btn}
                      </button>
                    )}
                    <button className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-black/[0.08] text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
        <span className="font-mono text-[10px] tracking-widest text-slate-300">© 2026 XENON.ECOSYSTEM</span>
        <div className="flex gap-5">
          {['Privacy', 'Terms'].map((l) => (
            <span key={l} className="text-[12px] text-slate-300 hover:text-slate-700 cursor-pointer transition-colors">{l}</span>
          ))}
        </div>
      </div>

    </div>
  )
}