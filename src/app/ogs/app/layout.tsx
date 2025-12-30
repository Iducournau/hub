'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LogoutButton } from '@/components/auth/logout-button'
import {
  LayoutDashboard,
  Key,
  FileText,
  Upload,
  AlertTriangle,
  Search,
  ChevronLeft
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/ogs/app', icon: LayoutDashboard },
  { name: 'Keywords', href: '/ogs/app/keywords', icon: Key },
  { name: 'Pages', href: '/ogs/app/pages', icon: FileText },
  { name: 'Import', href: '/ogs/app/import', icon: Upload },
  { name: 'Alertes', href: '/ogs/app/alerts', icon: AlertTriangle },
]

export default function OGSAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-3">
            <ChevronLeft className="w-4 h-4" />
            Retour au Hub
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">OGS</h1>
              <p className="text-xs text-slate-500">Outil de Gestion SEO</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/ogs/app' && pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <LogoutButton className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full px-3 py-2 rounded-lg hover:bg-slate-800" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
