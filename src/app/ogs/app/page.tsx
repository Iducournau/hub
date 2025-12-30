import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  Key, FileText, TrendingUp, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Minus, MousePointerClick, Eye
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

function ChangeIndicator({ change, inverted = false }: { change: number | null; inverted?: boolean }) {
  if (change === null || change === undefined) return <Minus className="w-4 h-4 text-muted-foreground" />

  // For position, lower is better, so we invert the color logic
  const isPositive = inverted ? change < 0 : change > 0
  const isNegative = inverted ? change > 0 : change < 0

  if (isPositive) return (
    <span className="flex items-center text-emerald-500 text-sm font-medium">
      <ArrowUpRight className="w-4 h-4" />
      {inverted ? change.toFixed(1) : `+${change.toFixed(0)}%`}
    </span>
  )
  if (isNegative) return (
    <span className="flex items-center text-red-500 text-sm font-medium">
      <ArrowDownRight className="w-4 h-4" />
      {inverted ? `+${Math.abs(change).toFixed(1)}` : `${change.toFixed(0)}%`}
    </span>
  )
  return <Minus className="w-4 h-4 text-muted-foreground" />
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

  // Fetch all stats in parallel
  const [keywordsResult, pagesResult, alertsResult, topPagesResult] = await Promise.all([
    supabase.from('keywords').select('id', { count: 'exact', head: true }),
    supabase.from('pages').select('id, position, previous_position, clicks, impressions', { count: 'exact' }),
    supabase.from('alerts').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('pages').select('url, position, clicks, impressions, ctr').order('clicks', { ascending: false, nullsFirst: false }).limit(5),
  ])

  const totalKeywords = keywordsResult.count || 0
  const totalPages = pagesResult.count || 0
  const totalAlerts = alertsResult.count || 0
  const topPages = topPagesResult.data || []

  // Calculate average position and total clicks/impressions
  const pagesData = pagesResult.data || []
  const pagesWithPosition = pagesData.filter(p => p.position && p.position > 0)
  const avgPosition = pagesWithPosition.length > 0
    ? pagesWithPosition.reduce((sum, p) => sum + (p.position || 0), 0) / pagesWithPosition.length
    : null

  // Calculate position change (comparing current avg to previous avg)
  const pagesWithBothPositions = pagesData.filter(p => p.position && p.previous_position)
  const avgPreviousPosition = pagesWithBothPositions.length > 0
    ? pagesWithBothPositions.reduce((sum, p) => sum + (p.previous_position || 0), 0) / pagesWithBothPositions.length
    : null
  const positionChange = avgPosition && avgPreviousPosition
    ? avgPreviousPosition - avgPosition // Positive = improved
    : null

  // Total clicks and impressions
  const totalClicks = pagesData.reduce((sum, p) => sum + (p.clicks || 0), 0)
  const totalImpressions = pagesData.reduce((sum, p) => sum + (p.impressions || 0), 0)

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
                <ChangeIndicator change={stat.change} inverted={stat.inverted} />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.name}</div>
            </Link>
          )
        })}
      </div>

      {/* Secondary stats */}
      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-violet-600 p-2 rounded-lg">
                <MousePointerClick className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{formatNumber(totalClicks)}</div>
                <div className="text-sm text-muted-foreground">Clics totaux</div>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-pink-600 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{formatNumber(totalImpressions)}</div>
                <div className="text-sm text-muted-foreground">Impressions totales</div>
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
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune donnée</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Commencez par importer vos données SEO depuis Google Search Console.
          </p>
          <Link
            href="/ogs/app/import"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Importer des données
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
