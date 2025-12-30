'use client'

import { Search, Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DateRangePicker,
  DateRange,
  formatDateForUrl,
  parseDateFromUrl,
  getDefaultDateRange,
} from '@/components/ui/date-range-picker'
import { cn } from '@/lib/utils'

interface KeywordsFiltersProps {
  initialSearch: string
  initialPriority: string
  initialPosition: string
  initialClicks: string
  initialQuickWins: boolean
  initialFrom: string
  initialTo: string
}

export function KeywordsFilters({
  initialSearch,
  initialPriority,
  initialPosition,
  initialClicks,
  initialQuickWins,
  initialFrom,
  initialTo,
}: KeywordsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(initialSearch)

  // Initialize date range from URL params or default
  const initialDateRange: DateRange | null = initialFrom && initialTo
    ? { from: parseDateFromUrl(initialFrom)!, to: parseDateFromUrl(initialTo)! }
    : getDefaultDateRange()
  const [dateRange, setDateRange] = useState<DateRange | null>(initialDateRange)

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
      router.push(`/ogs/app/keywords?${params.toString()}`)
    })
  }, [router, searchParams])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    updateFilters({ q: value || null })
  }

  const handleDateRangeChange = (range: DateRange | null) => {
    setDateRange(range)
    if (range) {
      updateFilters({
        from: formatDateForUrl(range.from),
        to: formatDateForUrl(range.to),
      })
    } else {
      updateFilters({ from: null, to: null })
    }
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
          placeholder="Rechercher un mot-clé..."
          className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Date Range */}
        <DateRangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
        />

        {/* Priority */}
        <Select
          value={initialPriority || 'all'}
          onValueChange={(value) => updateFilters({ priority: value })}
        >
          <SelectTrigger className="w-[130px] bg-card">
            <SelectValue placeholder="Priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes priorités</SelectItem>
            <SelectItem value="P0">P0</SelectItem>
            <SelectItem value="P1">P1</SelectItem>
            <SelectItem value="P2">P2</SelectItem>
            <SelectItem value="P3">P3</SelectItem>
          </SelectContent>
        </Select>

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
            <SelectItem value="1000">&gt; 1 000</SelectItem>
            <SelectItem value="500">&gt; 500</SelectItem>
            <SelectItem value="100">&gt; 100</SelectItem>
            <SelectItem value="10">&gt; 10</SelectItem>
          </SelectContent>
        </Select>

        {/* Quick Wins Toggle */}
        <button
          onClick={() => updateFilters({ quickwins: initialQuickWins ? null : '1' })}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-colors',
            initialQuickWins
              ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400'
              : 'bg-card border-border text-muted-foreground hover:bg-accent'
          )}
        >
          <Sparkles className="w-4 h-4" />
          Quick Wins
        </button>
      </div>
    </div>
  )
}
