import Providers from "@/components/Providers"
import Sidebar from "@/components/layout/Sidebar"
import TopNav from "@/components/layout/TopNav"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="app-layout">
        <Sidebar />
        <div className="main-wrapper">
          <TopNav />
          <main className="main-content">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  )
}
