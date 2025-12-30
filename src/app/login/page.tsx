import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { Search } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700 mb-4">
            <Search className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white">OGS</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 text-sm">Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Connexion</h1>
          <p className="text-slate-400">Connectez-vous pour accéder à l&apos;outil</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <Suspense fallback={<div className="h-48 animate-pulse bg-slate-700/50 rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Hub • OGS MVP • YouSchool
        </p>
      </div>
    </div>
  )
}
