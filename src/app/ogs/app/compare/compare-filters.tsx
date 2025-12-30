'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import {
  DateRangePicker,
  DateRange,
  formatDateForUrl,
  parseDateFromUrl,
} from '@/components/ui/date-range-picker'
import { cn } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, subMonths, subQuarters, startOfQuarter, endOfQuarter } from 'date-fns'
import { fr } from 'date-fns/locale'

interface CompareFiltersProps {
  periodA: { from: string; to: string }
  periodB: { from: string; to: string }
  metrics: string[]
}

const availableMetrics = [
  { key: 'clicks', label: 'Clics' },
  { key: 'impressions', label: 'Impressions' },
  { key: 'position', label: 'Position' },
  { key: 'ctr', label: 'CTR' },
]

const quickPresets = [
  {
    label: 'Ce mois vs Mois dernier',
    getA: () => ({ from: startOfMonth(new Date()), to: new Date() }),
    getB: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }),
  },
  {
    label: 'Ce trimestre vs Trimestre dernier',
    getA: () => ({ from: startOfQuarter(new Date()), to: new Date() }),
    getB: () => ({ from: startOfQuarter(subQuarters(new Date(), 1)), to: endOfQuarter(subQuarters(new Date(), 1)) }),
  },
]

export function CompareFilters({ periodA, periodB, metrics }: CompareFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [dateRangeA, setDateRangeA] = useState<DateRange | null>(
    periodA.from && periodA.to
      ? { from: parseDateFromUrl(periodA.from)!, to: parseDateFromUrl(periodA.to)! }
      : { from: startOfMonth(new Date()), to: new Date() }
  )
  const [dateRangeB, setDateRangeB] = useState<DateRange | null>(
    periodB.from && periodB.to
      ? { from: parseDateFromUrl(periodB.from)!, to: parseDateFromUrl(periodB.to)! }
      : { from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }
  )
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    metrics.length > 0 ? metrics : ['clicks', 'impressions', 'position']
  )

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    startTransition(() => {
      router.push(`/ogs/app/compare?${params.toString()}`)
    })
  }, [router, searchParams])

  const handlePeriodAChange = (range: DateRange | null) => {
    setDateRangeA(range)
    if (range) {
      updateUrl({
        a_from: formatDateForUrl(range.from),
        a_to: formatDateForUrl(range.to),
      })
    }
  }

  const handlePeriodBChange = (range: DateRange | null) => {
    setDateRangeB(range)
    if (range) {
      updateUrl({
        b_from: formatDateForUrl(range.from),
        b_to: formatDateForUrl(range.to),
      })
    }
  }

  const handleMetricToggle = (metricKey: string) => {
    const newMetrics = selectedMetrics.includes(metricKey)
      ? selectedMetrics.filter(m => m !== metricKey)
      : [...selectedMetrics, metricKey]

    if (newMetrics.length === 0) return // At least one metric required

    setSelectedMetrics(newMetrics)
    updateUrl({ metrics: newMetrics.join(',') })
  }

  const handleQuickPreset = (preset: typeof quickPresets[0]) => {
    const rangeA = preset.getA()
    const rangeB = preset.getB()
    setDateRangeA(rangeA)
    setDateRangeB(rangeB)
    updateUrl({
      a_from: formatDateForUrl(rangeA.from),
      a_to: formatDateForUrl(rangeA.to),
      b_from: formatDateForUrl(rangeB.from),
      b_to: formatDateForUrl(rangeB.to),
    })
  }

  const formatPeriodLabel = (range: DateRange | null) => {
    if (!range) return '—'
    return `${format(range.from, 'dd MMM', { locale: fr })} - ${format(range.to, 'dd MMM yyyy', { locale: fr })}`
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {quickPresets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPreset(preset)}
            className="px-3 py-1.5 text-sm bg-card border border-border rounded-lg hover:bg-accent transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Period Selectors */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Periode A :</span>
          <DateRangePicker value={dateRangeA} onChange={handlePeriodAChange} />
        </div>

        <span className="text-lg font-bold text-muted-foreground">vs</span>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Periode B :</span>
          <DateRangePicker value={dateRangeB} onChange={handlePeriodBChange} />
        </div>

        {isPending && (
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Metrics Selection */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-2">Metriques :</span>
        {availableMetrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => handleMetricToggle(metric.key)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg border transition-colors',
              selectedMetrics.includes(metric.key)
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-card border-border text-muted-foreground hover:bg-accent'
            )}
          >
            {metric.label}
          </button>
        ))}
      </div>
    </div>
  )
}
