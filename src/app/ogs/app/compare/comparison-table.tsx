import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AggregatedMetrics {
  clicks: number
  impressions: number
  avgPosition: number | null
  avgCtr: number | null
}

interface ComparisonTableProps {
  title: string
  icon: LucideIcon
  periodALabel: string
  periodBLabel: string
  periodA: AggregatedMetrics
  periodB: AggregatedMetrics
  visibleMetrics: string[]
}

function formatCompactNumber(num: number | null) {
  if (num === null || num === undefined) return '—'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toLocaleString('fr-FR')
}

function calcPercentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return ((current - previous) / previous) * 100
}

function EvolutionIndicator({
  valueA,
  valueB,
  inverted = false,
  isPercent = true
}: {
  valueA: number | null
  valueB: number | null
  inverted?: boolean
  isPercent?: boolean
}) {
  if (valueA === null || valueB === null) {
    return <span className="text-muted-foreground">—</span>
  }

  const change = isPercent
    ? calcPercentChange(valueA, valueB)
    : valueA - valueB

  if (change === null || Math.abs(change) < 0.1) {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <Minus className="w-4 h-4" />
        <span className="text-sm">0%</span>
      </span>
    )
  }

  // For position, lower is better, so we invert the color logic
  const isPositive = inverted ? change < 0 : change > 0
  const isNegative = inverted ? change > 0 : change < 0

  if (isPositive) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="w-4 h-4" />
        <span className="text-sm font-medium">
          {isPercent ? `+${Math.abs(change).toFixed(1)}%` : `+${Math.abs(change).toFixed(1)}`}
        </span>
      </span>
    )
  }

  if (isNegative) {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
        <TrendingDown className="w-4 h-4" />
        <span className="text-sm font-medium">
          {isPercent ? `${change.toFixed(1)}%` : change.toFixed(1)}
        </span>
      </span>
    )
  }

  return <span className="text-muted-foreground">—</span>
}

const metricsConfig = [
  {
    key: 'clicks',
    label: 'Clics',
    getValue: (m: AggregatedMetrics) => m.clicks,
    format: formatCompactNumber,
    inverted: false,
    isPercent: true,
  },
  {
    key: 'impressions',
    label: 'Impressions',
    getValue: (m: AggregatedMetrics) => m.impressions,
    format: formatCompactNumber,
    inverted: false,
    isPercent: true,
  },
  {
    key: 'position',
    label: 'Position moyenne',
    getValue: (m: AggregatedMetrics) => m.avgPosition,
    format: (n: number | null) => n !== null ? n.toFixed(1) : '—',
    inverted: true, // Lower is better
    isPercent: false,
  },
  {
    key: 'ctr',
    label: 'CTR moyen',
    getValue: (m: AggregatedMetrics) => m.avgCtr,
    format: (n: number | null) => n !== null ? `${(n * 100).toFixed(2)}%` : '—',
    inverted: false,
    isPercent: true,
  },
]

export function ComparisonTable({
  title,
  icon: Icon,
  periodALabel,
  periodBLabel,
  periodA,
  periodB,
  visibleMetrics,
}: ComparisonTableProps) {
  const visibleMetricsConfig = metricsConfig.filter(m => visibleMetrics.includes(m.key))

  if (visibleMetricsConfig.length === 0) return null

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead className="bg-muted/20 border-b border-border">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Metrique</th>
            <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">{periodALabel}</th>
            <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">{periodBLabel}</th>
            <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Evolution</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {visibleMetricsConfig.map((metric) => {
            const valueA = metric.getValue(periodA)
            const valueB = metric.getValue(periodB)

            return (
              <tr key={metric.key} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{metric.label}</td>
                <td className="px-4 py-3 text-right text-sm text-foreground font-medium">
                  {metric.format(valueA)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                  {metric.format(valueB)}
                </td>
                <td className="px-4 py-3 text-right">
                  <EvolutionIndicator
                    valueA={valueA}
                    valueB={valueB}
                    inverted={metric.inverted}
                    isPercent={metric.isPercent}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
