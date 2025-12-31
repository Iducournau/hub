'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className={className || 'flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors'}
    >
      <LogOut className="w-4 h-4" />
      <span>Déconnexion</span>
    </button>
  )
}
