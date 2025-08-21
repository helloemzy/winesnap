'use client'

import * as React from 'react'
import { Wine, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  )
}

interface WineLoadingProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function WineLoading({ className, size = 'md' }: WineLoadingProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Wine className={cn('animate-pulse text-wine', sizeClasses[size])} />
    </div>
  )
}

interface LoadingScreenProps {
  message?: string
  showWineIcon?: boolean
}

export function LoadingScreen({ message = 'Loading...', showWineIcon = true }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        {showWineIcon ? (
          <WineLoading size="lg" />
        ) : (
          <LoadingSpinner size="lg" />
        )}
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ 
  isLoading, 
  message = 'Loading...', 
  className 
}: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className={cn(
      'absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
      className
    )}>
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  )
}

// Specific skeleton components for wine app
export function WineTastingSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[80%]" />
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-14" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="mt-1 h-4 w-full" />
        </div>
        <div className="text-center">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="mt-1 h-4 w-full" />
        </div>
        <div className="text-center">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="mt-1 h-4 w-full" />
        </div>
      </div>
    </div>
  )
}