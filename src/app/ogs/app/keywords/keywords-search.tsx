'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function KeywordsSearch({ initialSearch }: { initialSearch: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(initialSearch)

  const handleSearch = (value: string) => {
    setSearch(value)
    startTransition(() => {
      if (value) {
        router.push(`/ogs/app/keywords?q=${encodeURIComponent(value)}`)
      } else {
        router.push('/ogs/app/keywords')
      }
    })
  }

  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher un mot-clé..."
          className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
