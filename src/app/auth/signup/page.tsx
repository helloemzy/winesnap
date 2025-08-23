import { SignupForm } from '@/components/auth/signup-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - WineSnap',
  description: 'Create your WineSnap wine tasting journal account',
}

export default function SignupPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <SignupForm />
    </div>
  )
}