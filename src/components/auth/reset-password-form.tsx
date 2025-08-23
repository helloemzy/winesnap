'use client'

import * as React from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Wine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import { createSupabaseClient } from '@/lib/supabase'
import { useUIStore } from '@/stores/ui-store'

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const [loading, setLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const { addToast } = useUIStore()
  const supabase = createSupabaseClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      )

      if (error) {
        throw error
      }

      setSent(true)
      addToast({
        type: 'success',
        title: 'Reset link sent!',
        description: 'Check your email for a password reset link.',
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        description: error.message || 'An error occurred while sending the reset link',
      })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-wine/10">
            <Wine className="h-8 w-8 text-wine" />
          </div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            We've sent you a password reset link. Check your email and follow the instructions to reset your password.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center text-sm text-wine hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-wine/10">
          <Wine className="h-8 w-8 text-wine" />
        </div>
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner className="mr-2" size="sm" />
              Sending reset link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      {/* Back to sign in */}
      <div className="text-center">
        <Link
          href="/auth/signin"
          className="inline-flex items-center text-sm text-wine hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}