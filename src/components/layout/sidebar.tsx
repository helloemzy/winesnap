'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home,
  Wine,
  Users,
  Heart,
  BookOpen,
  Settings,
  TrendingUp,
  Camera,
  FileText,
  X,
  Trophy,
  Star,
  Shield,
  Gamepad2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

type NavigationItem = {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: string
}

const navigationItems: NavigationItem[] = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/capture', icon: Camera, label: 'Wine Capture', badge: 'New' },
  { href: '/collection', icon: Wine, label: 'My Collection' },
  { href: '/pet', icon: Heart, label: 'My Pet' },
  { href: '/achievements', icon: Trophy, label: 'Achievements' },
  { href: '/friends', icon: Users, label: 'Friends' },
  { href: '/guilds', icon: Shield, label: 'Guilds' },
  { href: '/battle', icon: Gamepad2, label: 'Battle Arena' },
  { href: '/discover', icon: TrendingUp, label: 'Discover' },
  { href: '/reports', icon: FileText, label: 'Reports' },
]

const bottomItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { user } = useAuthStore()

  const sidebarRef = React.useRef<HTMLDivElement>(null)

  // Close sidebar when clicking outside (mobile)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false)
      }
    }

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarOpen, setSidebarOpen])

  // Close sidebar on route change (mobile)
  React.useEffect(() => {
    setSidebarOpen(false)
  }, [pathname, setSidebarOpen])

  if (!user) return null

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform border-r border-border bg-background transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Wine className="h-6 w-6 text-wine" />
            <span className="font-bold">WineSnap</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex h-[calc(100vh-3.5rem)] flex-col justify-between p-4">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start relative"
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                    {item.badge && (
                      <span className="absolute right-2 top-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Navigation */}
          <nav className="space-y-1 border-t border-border pt-4">
            {bottomItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}