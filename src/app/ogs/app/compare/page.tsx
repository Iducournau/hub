import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { FileText, Key, GitCompare } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CompareFilters } from './compare-filters'
import { ComparisonTable, AggregatedMetrics } from './comparison-table'

interface MetricRow {
  clicks: number | null
  impressions: number | null
  position: number | null
  ctr: number | null
}

function aggregateMetrics(data: MetricRow[]): AggregatedMetrics {
  const validPositions = data.filter(d => d.position && d.position > 0)
  const validCtrs = data.filter(d => d.ctr !== null && d.ctr !== undefined)

  return {
    clicks: data.reduce((sum, d) => sum + (d.clicks || 0), 0),
    impressions: data.reduce((sum, d) => sum + (d.impressions || 0), 0),
    avgPosition: validPositions.length > 0
      ? validPositions.reduce((sum, d) => sum + (d.position || 0), 0) / validPositions.length
      : null,
    avgCtr: validCtrs.length > 0
      ? validCtrs.reduce((sum, d) => sum + (d.ctr || 0), 0) / validCtrs.length
      : null,
  }
}

function formatPeriodLabel(from: string, to: string): string {
  try {
    const fromDate = new Date(from)
    const toDate = new Date(to)
    return `${format(fromDate, 'dd MMM', { locale: fr })} - ${format(toDate, 'dd MMM yyyy', { locale: fr })}`
  } catch {
    return `${from} - ${to}`
  }
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{
    a_from?: string
    a_to?: string
    b_from?: string
    b_to?: string
    metrics?: string
  }>
}) {
  const params = await searchParams
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

  // Default periods: this month vs last month
  const now = new Date()
  const defaultAFrom = format(startOfMonth(now), 'yyyy-MM-dd')
  const defaultATo = format(now, 'yyyy-MM-dd')
  const defaultBFrom = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')
  const defaultBTo = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')

  const periodA = {
    from: params.a_from || defaultAFrom,
    to: params.a_to || defaultATo,
  }
  const periodB = {
    from: params.b_from || defaultBFrom,
    to: params.b_to || defaultBTo,
  }

  const metricsParam = params.metrics || 'clicks,impressions,position'
  const selectedMetrics = metricsParam.split(',').filter(Boolean)

  // Fetch data in parallel
  const [pagesAResult, pagesBResult, keywordsAResult, keywordsBResult] = await Promise.all([
    // Pages - Period A
    supabase
      .from('page_metrics_history')
      .select('clicks, impressions, position, ctr')
      .gte('date', periodA.from)
      .lte('date', periodA.to),
    // Pages - Period B
    supabase
      .from('page_metrics_history')
      .select('clicks, impressions, position, ctr')
      .gte('date', periodB.from)
      .lte('date', periodB.to),
    // Keywords - Period A
    supabase
      .from('positions')
      .select('clicks, impressions, position, ctr')
      .gte('date', periodA.from)
      .lte('date', periodA.to),
    // Keywords - Period B
    supabase
      .from('positions')
      .select('clicks, impressions, position, ctr')
      .gte('date', periodB.from)
      .lte('date', periodB.to),
  ])

  // Aggregate metrics
  const pagesA = aggregateMetrics((pagesAResult.data || []) as MetricRow[])
  const pagesB = aggregateMetrics((pagesBResult.data || []) as MetricRow[])
  const keywordsA = aggregateMetrics((keywordsAResult.data || []) as MetricRow[])
  const keywordsB = aggregateMetrics((keywordsBResult.data || []) as MetricRow[])

  const periodALabel = formatPeriodLabel(periodA.from, periodA.to)
  const periodBLabel = formatPeriodLabel(periodB.from, periodB.to)

  const hasPageData = (pagesAResult.data?.length || 0) > 0 || (pagesBResult.data?.length || 0) > 0
  const hasKeywordData = (keywordsAResult.data?.length || 0) > 0 || (keywordsBResult.data?.length || 0) > 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-600 text-white">
          <GitCompare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comparateur de periodes</h1>
          <p className="text-muted-foreground">Comparez les performances entre deux periodes</p>
        </div>
      </div>

      {/* Filters */}
      <CompareFilters
        periodA={periodA}
        periodB={periodB}
        metrics={selectedMetrics}
      />

      {/* Comparison Tables */}
      <div className="grid gap-6">
        {/* Pages Comparison */}
        {hasPageData ? (
          <ComparisonTable
            title="Pages"
            icon={FileText}
            periodALabel={periodALabel}
            periodBLabel={periodBLabel}
            periodA={pagesA}
            periodB={pagesB}
            visibleMetrics={selectedMetrics}
          />
        ) : (
          <div className="bg-muted/30 border border-dashed border-border rounded-xl p-8 text-center">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Aucune donnee Pages</h3>
            <p className="text-sm text-muted-foreground">
              L&apos;historique des pages sera disponible apres le prochain import GSC.
            </p>
          </div>
        )}

        {/* Keywords Comparison */}
        {hasKeywordData ? (
          <ComparisonTable
            title="Keywords"
            icon={Key}
            periodALabel={periodALabel}
            periodBLabel={periodBLabel}
            periodA={keywordsA}
            periodB={keywordsB}
            visibleMetrics={selectedMetrics}
          />
        ) : (
          <div className="bg-muted/30 border border-dashed border-border rounded-xl p-8 text-center">
            <Key className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Aucune donnee Keywords</h3>
            <p className="text-sm text-muted-foreground">
              Importez des positions de mots-cles pour les comparer.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
