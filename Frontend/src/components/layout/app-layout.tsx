import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { CommandPalette } from './command-palette'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          <div className="app-content">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette />
    </div>
  )
}
