// import Sidebar from '@/components/Sidebar'

import Sidebar from "../components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090f] flex">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-10 overflow-y-auto text-white">
        {children}
      </main>
    </div>
  )
}