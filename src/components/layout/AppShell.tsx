'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { LogOut, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/enter', label: 'Enter Data' },
  { href: '/view', label: 'View Data' },
  { href: '/analyse', label: 'Analyse' },
  { href: '/settings', label: 'Settings' },
]

export function AppShell({ children, userEmail }: { children: React.ReactNode; userEmail?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30">
      <header className="bg-white border-b border-amber-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-amber-900">
              <span className="text-xl">🐝</span>
              <span className="hidden sm:inline">Bee Tender</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-gray-500 hover:text-amber-900 hover:bg-amber-50'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="hidden sm:inline text-xs text-gray-400">{userEmail}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-gray-400 hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden border-t border-amber-50 px-4 py-1 flex gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                pathname === item.href
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-gray-500 hover:text-amber-900'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
