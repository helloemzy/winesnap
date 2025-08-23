import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password - WineSnap',
  description: 'Reset your WineSnap account password',
}

export default function ResetPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <ResetPasswordForm />
    </div>
  )
}