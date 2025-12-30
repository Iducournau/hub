import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { Search } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border mb-4">
            <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-foreground">OGS</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground text-sm">Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Connexion</h1>
          <p className="text-muted-foreground">Connectez-vous pour accéder à l&apos;outil</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Hub • OGS MVP • YouSchool
        </p>
      </div>
    </div>
  )
}
