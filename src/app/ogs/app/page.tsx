import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  Key, FileText, TrendingUp, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Minus, MousePointerClick, Eye,
  Sparkles, Calendar
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { startOfMonth, subMonths, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PageSpeedAnalyzer } from './pagespeed-analyzer'

// Position badge color
function getPositionColor(position: number | null) {
  if (!position) return 'bg-muted text-muted-foreground'
  if (position <= 3) return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
  if (position <= 10) return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
  if (position <= 20) return 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
  return 'bg-red-500/20 text-red-600 dark:text-red-400'
}

function formatNumber(num: number | null) {
  if (num === null || num === undefined) return '—'
  return num.toLocaleString('fr-FR')
}

function formatCompactNumber(num: number | null) {
  if (num === null || num === undefined) return '—'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toLocaleString('fr-FR')
}

function ChangeIndicator({ change, inverted = false, showPercent = true }: { change: number | null; inverted?: boolean; showPercent?: boolean }) {
  if (change === null || change === undefined) return <Minus className="w-4 h-4 text-muted-foreground" />

  const isPositive = inverted ? change < 0 : change > 0
  const isNegative = inverted ? change > 0 : change < 0

  if (isPositive) return (
    <span className="flex items-center text-emerald-500 text-sm font-medium">
      <ArrowUpRight className="w-4 h-4" />
      {showPercent ? `+${Math.abs(change).toFixed(0)}%` : (inverted ? change.toFixed(1) : `+${Math.abs(change).toFixed(0)}`)}
    </span>
  )
  if (isNegative) return (
    <span className="flex items-center text-red-500 text-sm font-medium">
      <ArrowDownRight className="w-4 h-4" />
      {showPercent ? `${change.toFixed(0)}%` : (inverted ? `+${Math.abs(change).toFixed(1)}` : change.toFixed(0))}
    </span>
  )
  return <Minus className="w-4 h-4 text-muted-foreground" />
}

// Calculate percentage change
function calcPercentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return ((current - previous) / previous) * 100
}

// Predict next value using simple linear trend
function predictNextValue(values: number[]): number | null {
  if (values.length < 2) return null
  const trend = (values[values.length - 1] - values[0]) / (values.length - 1)
  return Math.max(0, values[values.length - 1] + trend)
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore
          }
        },
      },
    }
  )

  // Date ranges for comparison
  const now = new Date()
  const thisMonthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = new Date(thisMonthStart)
  lastMonthEnd.setDate(lastMonthEnd.getDate() - 1)

  // Fetch all stats in parallel
  const [
    keywordsResult,
    pagesResult,
    alertsResult,
    topPagesResult,
    thisMonthHistoryResult,
    lastMonthHistoryResult,
    last3MonthsHistoryResult,
    pageSpeedResult,
  ] = await Promise.all([
    supabase.from('keywords').select('id', { count: 'exact', head: true }),
    supabase.from('pages').select('id, position, previous_position, clicks, impressions', { count: 'exact' }),
    supabase.from('alerts').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('pages').select('url, position, clicks, impressions, ctr').order('clicks', { ascending: false, nullsFirst: false }).limit(5),
    // This month metrics
    supabase.from('page_metrics_history')
      .select('clicks, impressions, position')
      .gte('date', thisMonthStart.toISOString().split('T')[0]),
    // Last month metrics
    supabase.from('page_metrics_history')
      .select('clicks, impressions, position')
      .gte('date', lastMonthStart.toISOString().split('T')[0])
      .lt('date', thisMonthStart.toISOString().split('T')[0]),
    // Last 3 months for predictions (monthly aggregates)
    supabase.from('page_metrics_history')
      .select('clicks, impressions, position, date')
      .gte('date', startOfMonth(subMonths(now, 2)).toISOString().split('T')[0])
      .order('date', { ascending: true }),
    // PageSpeed scores
    supabase.from('pages')
      .select('seo_score, performance_score, accessibility_score, best_practices_score'),
  ])

  const totalKeywords = keywordsResult.count || 0
  const totalPages = pagesResult.count || 0
  const totalAlerts = alertsResult.count || 0
  const topPages = topPagesResult.data || []

  // PageSpeed scores
  const pageSpeedData = pageSpeedResult.data || []
  const pagesWithSeoScore = pageSpeedData.filter(p => p.seo_score !== null)
  const avgSeoScore = pagesWithSeoScore.length > 0
    ? Math.round(pagesWithSeoScore.reduce((sum, p) => sum + (p.seo_score || 0), 0) / pagesWithSeoScore.length)
    : null
  const avgPerformanceScore = pagesWithSeoScore.length > 0
    ? Math.round(pagesWithSeoScore.filter(p => p.performance_score !== null).reduce((sum, p) => sum + (p.performance_score || 0), 0) / pagesWithSeoScore.filter(p => p.performance_score !== null).length) || null
    : null
  const avgAccessibilityScore = pagesWithSeoScore.length > 0
    ? Math.round(pagesWithSeoScore.filter(p => p.accessibility_score !== null).reduce((sum, p) => sum + (p.accessibility_score || 0), 0) / pagesWithSeoScore.filter(p => p.accessibility_score !== null).length) || null
    : null
  const avgBestPracticesScore = pagesWithSeoScore.length > 0
    ? Math.round(pagesWithSeoScore.filter(p => p.best_practices_score !== null).reduce((sum, p) => sum + (p.best_practices_score || 0), 0) / pagesWithSeoScore.filter(p => p.best_practices_score !== null).length) || null
    : null
  const pagesAnalyzed = pagesWithSeoScore.length

  // Current metrics from pages table
  const pagesData = pagesResult.data || []
  const pagesWithPosition = pagesData.filter(p => p.position && p.position > 0)
  const avgPosition = pagesWithPosition.length > 0
    ? pagesWithPosition.reduce((sum, p) => sum + (p.position || 0), 0) / pagesWithPosition.length
    : null

  const pagesWithBothPositions = pagesData.filter(p => p.position && p.previous_position)
  const avgPreviousPosition = pagesWithBothPositions.length > 0
    ? pagesWithBothPositions.reduce((sum, p) => sum + (p.previous_position || 0), 0) / pagesWithBothPositions.length
    : null
  const positionChange = avgPosition && avgPreviousPosition
    ? avgPreviousPosition - avgPosition
    : null

  const totalClicks = pagesData.reduce((sum, p) => sum + (p.clicks || 0), 0)
  const totalImpressions = pagesData.reduce((sum, p) => sum + (p.impressions || 0), 0)

  // Historical data for month comparison
  const thisMonthData = thisMonthHistoryResult.data || []
  const lastMonthData = lastMonthHistoryResult.data || []
  const hasHistoricalData = thisMonthData.length > 0 || lastMonthData.length > 0

  // Calculate monthly aggregates
  const thisMonthClicks = thisMonthData.reduce((sum, d) => sum + (d.clicks || 0), 0)
  const thisMonthImpressions = thisMonthData.reduce((sum, d) => sum + (d.impressions || 0), 0)
  const thisMonthPositions = thisMonthData.filter(d => d.position && d.position > 0)
  const thisMonthAvgPosition = thisMonthPositions.length > 0
    ? thisMonthPositions.reduce((sum, d) => sum + (d.position || 0), 0) / thisMonthPositions.length
    : null

  const lastMonthClicks = lastMonthData.reduce((sum, d) => sum + (d.clicks || 0), 0)
  const lastMonthImpressions = lastMonthData.reduce((sum, d) => sum + (d.impressions || 0), 0)
  const lastMonthPositions = lastMonthData.filter(d => d.position && d.position > 0)
  const lastMonthAvgPosition = lastMonthPositions.length > 0
    ? lastMonthPositions.reduce((sum, d) => sum + (d.position || 0), 0) / lastMonthPositions.length
    : null

  // Calculate changes
  const clicksChange = lastMonthClicks > 0 ? calcPercentChange(thisMonthClicks, lastMonthClicks) : null
  const impressionsChange = lastMonthImpressions > 0 ? calcPercentChange(thisMonthImpressions, lastMonthImpressions) : null

  // Predictions (need at least 2 months of data)
  const last3MonthsData = last3MonthsHistoryResult.data || []
  const monthlyAggregates: { [key: string]: { clicks: number; impressions: number; positions: number[]; count: number } } = {}

  for (const record of last3MonthsData) {
    const monthKey = record.date?.substring(0, 7) // YYYY-MM
    if (!monthKey) continue
    if (!monthlyAggregates[monthKey]) {
      monthlyAggregates[monthKey] = { clicks: 0, impressions: 0, positions: [], count: 0 }
    }
    monthlyAggregates[monthKey].clicks += record.clicks || 0
    monthlyAggregates[monthKey].impressions += record.impressions || 0
    if (record.position && record.position > 0) {
      monthlyAggregates[monthKey].positions.push(record.position)
    }
    monthlyAggregates[monthKey].count++
  }

  const monthKeys = Object.keys(monthlyAggregates).sort()
  const clicksHistory = monthKeys.map(k => monthlyAggregates[k].clicks)
  const impressionsHistory = monthKeys.map(k => monthlyAggregates[k].impressions)
  const positionHistory = monthKeys.map(k => {
    const positions = monthlyAggregates[k].positions
    return positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : 0
  }).filter(p => p > 0)

  const predictedClicks = predictNextValue(clicksHistory)
  const predictedImpressions = predictNextValue(impressionsHistory)
  const predictedPosition = predictNextValue(positionHistory)
  const canPredict = monthKeys.length >= 2

  const nextMonth = format(subMonths(now, -1), 'MMMM yyyy', { locale: fr })

  const stats = [
    {
      name: 'Keywords',
      value: formatNumber(totalKeywords),
      change: null,
      icon: Key,
      color: 'bg-blue-600',
      href: '/ogs/app/keywords',
    },
    {
      name: 'Pages',
      value: formatNumber(totalPages),
      change: null,
      icon: FileText,
      color: 'bg-cyan-600',
      href: '/ogs/app/pages',
    },
    {
      name: 'Position moyenne',
      value: avgPosition ? avgPosition.toFixed(1) : '—',
      change: positionChange,
      inverted: true,
      icon: TrendingUp,
      color: 'bg-emerald-600',
      href: '/ogs/app/pages',
    },
    {
      name: 'Alertes actives',
      value: formatNumber(totalAlerts),
      change: null,
      icon: AlertTriangle,
      color: 'bg-amber-600',
      href: '/ogs/app/alerts',
    },
  ]

  const hasData = totalKeywords > 0 || totalPages > 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de vos performances SEO</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-card border border-border rounded-xl p-5 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ChangeIndicator change={stat.change} inverted={stat.inverted} showPercent={false} />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.name}</div>
            </Link>
          )
        })}
      </div>

      {/* Monthly Comparison & Predictions */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* This Month vs Last Month */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Ce mois vs mois dernier</h3>
            </div>
            {hasHistoricalData ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4 text-violet-500" />
                    <span className="text-sm text-muted-foreground">Clics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-foreground">{formatCompactNumber(thisMonthClicks)}</span>
                    <ChangeIndicator change={clicksChange} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-pink-500" />
                    <span className="text-sm text-muted-foreground">Impressions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-foreground">{formatCompactNumber(thisMonthImpressions)}</span>
                    <ChangeIndicator change={impressionsChange} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">Position moy.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-foreground">
                      {thisMonthAvgPosition ? thisMonthAvgPosition.toFixed(1) : '—'}
                    </span>
                    {thisMonthAvgPosition && lastMonthAvgPosition && (
                      <ChangeIndicator change={lastMonthAvgPosition - thisMonthAvgPosition} inverted showPercent={false} />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">Pas encore de donnees historiques.</p>
                <p className="text-xs mt-1">Importez vos donnees GSC pour voir les comparaisons.</p>
              </div>
            )}
          </div>

          {/* Predictions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-foreground">Predictions {nextMonth}</h3>
            </div>
            {canPredict ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4 text-violet-500" />
                    <span className="text-sm text-muted-foreground">Clics estimes</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">
                    ~{formatCompactNumber(predictedClicks)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-pink-500" />
                    <span className="text-sm text-muted-foreground">Impressions estimees</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">
                    ~{formatCompactNumber(predictedImpressions)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">Position estimee</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">
                    ~{predictedPosition ? predictedPosition.toFixed(1) : '—'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Base sur la tendance des {monthKeys.length} derniers mois
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">Donnees insuffisantes pour les predictions.</p>
                <p className="text-xs mt-1">Importez des donnees sur au moins 2 mois.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PageSpeed & Secondary stats */}
      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* PageSpeed Analyzer */}
          <PageSpeedAnalyzer
            avgSeoScore={avgSeoScore}
            avgPerformanceScore={avgPerformanceScore}
            avgAccessibilityScore={avgAccessibilityScore}
            avgBestPracticesScore={avgBestPracticesScore}
            pagesAnalyzed={pagesAnalyzed}
            totalPages={totalPages}
          />
          {/* Clics totaux */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-violet-600 p-2 rounded-lg">
                <MousePointerClick className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{formatNumber(totalClicks)}</div>
                <div className="text-sm text-muted-foreground">Clics totaux (cumul)</div>
              </div>
            </div>
          </div>
          {/* Impressions totales */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-pink-600 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{formatNumber(totalImpressions)}</div>
                <div className="text-sm text-muted-foreground">Impressions totales (cumul)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Pages */}
      {topPages.length > 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Top 5 Pages (par clics)</h2>
          </div>
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">URL</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground w-24">Position</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground w-24">Clics</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground w-28">Impressions</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground w-20">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topPages.map((page, i) => {
                const path = (() => {
                  try {
                    return new URL(page.url).pathname || '/'
                  } catch {
                    return page.url
                  }
                })()
                return (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground truncate block max-w-xs" title={page.url}>
                        {path}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium',
                        getPositionColor(page.position)
                      )}>
                        {page.position?.toFixed(1) || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(page.clicks)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(page.impressions)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {page.ctr ? `${(page.ctr * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-border">
            <Link
              href="/ogs/app/pages"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
            >
              Voir toutes les pages →
            </Link>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="bg-muted/30 border border-dashed border-border rounded-xl p-12 text-center">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune donnee</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Commencez par importer vos donnees SEO depuis Google Search Console.
          </p>
          <Link
            href="/ogs/app/import"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Importer des donnees
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
