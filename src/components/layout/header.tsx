'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Wine,
  Plus,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuthStore()
  const { 
    toggleSidebar, 
    setSearchModalOpen, 
    isInstallable, 
    triggerInstallPrompt 
  } = useUIStore()

  const [showUserMenu, setShowUserMenu] = React.useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mr-2 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Wine className="h-6 w-6 text-wine" />
          <span className="hidden font-bold sm:inline-block">WineSnap</span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/dashboard"
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname === '/dashboard' ? 'text-foreground' : 'text-foreground/60'
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/tastings"
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname === '/tastings' ? 'text-foreground' : 'text-foreground/60'
            )}
          >
            Tastings
          </Link>
          <Link
            href="/discover"
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname === '/discover' ? 'text-foreground' : 'text-foreground/60'
            )}
          >
            Discover
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchModalOpen(true)}
            className="h-9 w-9"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Add Tasting */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9"
          >
            <Link href="/tastings/new">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>

          {/* PWA Install */}
          {isInstallable && (
            <Button
              variant="ghost"
              size="icon"
              onClick={triggerInstallPrompt}
              className="h-9 w-9"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}

          {user ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Bell className="h-4 w-4" />
              </Button>

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || profile.username || 'User'}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-popover p-1 shadow-md">
                    <div className="px-3 py-2 text-sm">
                      <p className="font-medium">
                        {profile?.full_name || profile?.username || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="h-px bg-border" />
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <div className="h-px bg-border" />
                    <button
                      className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => {
                        setShowUserMenu(false)
                        handleSignOut()
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}