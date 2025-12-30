'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PagesFiltersProps {
  initialSearch: string
  initialPosition: string
  initialClicks: string
  initialCtr: string
  initialFormation: string
  formations: string[]
}

export function PagesFilters({
  initialSearch,
  initialPosition,
  initialClicks,
  initialCtr,
  initialFormation,
  formations,
}: PagesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(initialSearch)

  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    // Reset to page 1 when filters change
    params.delete('page')

    startTransition(() => {
      router.push(`/ogs/app/pages?${params.toString()}`)
    })
  }, [router, searchParams])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    updateFilters({ q: value || null })
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Rechercher une page..."
          className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Position */}
        <Select
          value={initialPosition || 'all'}
          onValueChange={(value) => updateFilters({ pos: value })}
        >
          <SelectTrigger className="w-[130px] bg-card">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes positions</SelectItem>
            <SelectItem value="top3">Top 3</SelectItem>
            <SelectItem value="top10">Top 10</SelectItem>
            <SelectItem value="top20">Top 20</SelectItem>
            <SelectItem value="below20">&gt; 20</SelectItem>
          </SelectContent>
        </Select>

        {/* Clicks */}
        <Select
          value={initialClicks || 'all'}
          onValueChange={(value) => updateFilters({ clicks: value })}
        >
          <SelectTrigger className="w-[130px] bg-card">
            <SelectValue placeholder="Clics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous clics</SelectItem>
            <SelectItem value="10000">&gt; 10k</SelectItem>
            <SelectItem value="1000">&gt; 1k</SelectItem>
            <SelectItem value="100">&gt; 100</SelectItem>
          </SelectContent>
        </Select>

        {/* CTR */}
        <Select
          value={initialCtr || 'all'}
          onValueChange={(value) => updateFilters({ ctr: value })}
        >
          <SelectTrigger className="w-[130px] bg-card">
            <SelectValue placeholder="CTR" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous CTR</SelectItem>
            <SelectItem value="10">&gt; 10%</SelectItem>
            <SelectItem value="5">&gt; 5%</SelectItem>
            <SelectItem value="1">&gt; 1%</SelectItem>
          </SelectContent>
        </Select>

        {/* Formation */}
        {formations.length > 0 && (
          <Select
            value={initialFormation || 'all'}
            onValueChange={(value) => updateFilters({ formation: value })}
          >
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Formation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes formations</SelectItem>
              {formations.map((f) => (
                <SelectItem key={f} value={f}>
                  {f.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
