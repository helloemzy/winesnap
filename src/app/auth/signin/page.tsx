import { SigninForm } from '@/components/auth/signin-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - WineSnap',
  description: 'Sign in to your WineSnap wine tasting journal account',
}

export default function SigninPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <SigninForm />
    </div>
  )
}