'use client'

import * as React from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { ToastContainer } from '@/components/ui/toast'
import { ModalContainer } from '@/components/ui/modal'
import { LoadingOverlay } from '@/components/ui/loading'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { 
    toasts, 
    modals, 
    globalLoading,
    removeToast, 
    closeModal 
  } = useUIStore()
  const { user } = useAuthStore()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - only show if user is authenticated */}
      {user && <Sidebar />}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="relative">
            {children}
            
            {/* Global loading overlay */}
            <LoadingOverlay isLoading={globalLoading} />
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Modal container */}
      <ModalContainer modals={modals} onClose={closeModal} />
    </div>
  )
}