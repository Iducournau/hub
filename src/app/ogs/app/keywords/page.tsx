import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Key, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KeywordsFilters } from './keywords-filters'

interface PositionData {
  position: number | null
  clicks: number | null
  impressions: number | null
  ctr: number | null
  date: string
}

interface KeywordData {
  id: string
  keyword: string
  priority: 'P0' | 'P1' | 'P2' | 'P3' | null
  volume: number | null
  difficulty: number | null
  positions: PositionData[]
}

// Position badge color
function getPositionColor(position: number | null) {
  if (!position) return 'bg-muted text-muted-foreground'
  if (position <= 3) return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
  if (position <= 10) return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
  if (position <= 20) return 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
  return 'bg-red-500/20 text-red-600 dark:text-red-400'
}

// Format numbers
function formatNumber(num: number | null) {
  if (num === null) return '—'
  return num.toLocaleString('fr-FR')
}

// Get latest and previous positions from positions array
function getPositionData(positions: PositionData[] | null) {
  if (!positions || positions.length === 0) return { latest: null, previous: null }
  const sorted = [...positions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return {
    latest: sorted[0] || null,
    previous: sorted[1] || null,
  }
}

// Legacy function for backwards compatibility in filters
function getLatestPosition(positions: PositionData[] | null) {
  return getPositionData(positions).latest
}

// Position delta component for keywords
function PositionDelta({ current, previous }: { current: number | null; previous: number | null }) {
  if (!current || !previous) return null

  const delta = previous - current // Positive = improved (lower position is better)

  if (Math.abs(delta) < 0.5) {
    return (
      <span className="inline-flex items-center gap-0.5 text-muted-foreground text-xs">
        <Minus className="w-3 h-3" />
      </span>
    )
  }

  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <TrendingUp className="w-3 h-3" />
        +{delta.toFixed(0)}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400 text-xs font-medium">
      <TrendingDown className="w-3 h-3" />
      {delta.toFixed(0)}
    </span>
  )
}

export default async function KeywordsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    page?: string
    priority?: string
    pos?: string
    clicks?: string
    quickwins?: string
    from?: string
    to?: string
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

  const search = params.q || ''
  const priority = params.priority || ''
  const pos = params.pos || ''
  const clicks = params.clicks || ''
  const quickwins = params.quickwins === '1'
  const fromDate = params.from || ''
  const toDate = params.to || ''
  const page = parseInt(params.page || '1', 10)
  const perPage = 50

  // Fetch keywords with positions
  let query = supabase
    .from('keywords')
    .select(`
      id,
      keyword,
      priority,
      volume,
      difficulty,
      positions (
        position,
        clicks,
        impressions,
        ctr,
        date
      )
    `)
    .order('keyword', { ascending: true })

  // Filter by search
  if (search) {
    query = query.ilike('keyword', `%${search}%`)
  }

  // Filter by priority (direct column)
  if (priority && priority !== 'all') {
    query = query.eq('priority', priority)
  }

  const { data, error } = await query
  let keywords = data as KeywordData[] | null

  if (error) {
    console.error('Error fetching keywords:', error)
  }

  // Helper to filter positions by date range
  const filterPositionsByDate = (positions: PositionData[] | null): PositionData[] => {
    if (!positions || positions.length === 0) return []
    if (!fromDate || !toDate) return positions

    const from = new Date(fromDate)
    const to = new Date(toDate)
    to.setHours(23, 59, 59, 999) // Include the entire end day

    return positions.filter(p => {
      const posDate = new Date(p.date)
      return posDate >= from && posDate <= to
    })
  }

  // Apply position/clicks filters client-side (on positions data)
  if (keywords) {
    keywords = keywords.map(kw => ({
      ...kw,
      positions: filterPositionsByDate(kw.positions),
    })).filter((kw) => {
      // If date filter is active, only keep keywords with positions in that range
      if (fromDate && toDate && kw.positions.length === 0) return false

      const latestPos = getLatestPosition(kw.positions)

      // Position filter
      if (pos && pos !== 'all') {
        if (!latestPos?.position) return false
        if (pos === 'top3' && latestPos.position > 3) return false
        if (pos === 'top10' && latestPos.position > 10) return false
        if (pos === 'top20' && latestPos.position > 20) return false
        if (pos === 'below20' && latestPos.position <= 20) return false
      }

      // Clicks filter
      if (clicks && clicks !== 'all') {
        const minClicks = parseInt(clicks, 10)
        if (!latestPos?.clicks || latestPos.clicks < minClicks) return false
      }

      // Quick Wins filter (position 4-10)
      if (quickwins) {
        if (!latestPos?.position) return false
        if (latestPos.position < 4 || latestPos.position > 10) return false
      }

      return true
    })
  }

  // Pagination
  const totalCount = keywords?.length || 0
  const totalPages = Math.ceil(totalCount / perPage)
  const paginatedKeywords = keywords?.slice((page - 1) * perPage, page * perPage) || []

  // Build pagination URL
  const buildPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (priority) params.set('priority', priority)
    if (pos) params.set('pos', pos)
    if (clicks) params.set('clicks', clicks)
    if (quickwins) params.set('quickwins', '1')
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    params.set('page', newPage.toString())
    return `/ogs/app/keywords?${params.toString()}`
  }

  const hasActiveFilters = priority || pos || clicks || quickwins || fromDate

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Keywords</h1>
          <p className="text-muted-foreground">
            {totalCount.toLocaleString('fr-FR')} mots-clés
            {hasActiveFilters && ' (filtré)'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <KeywordsFilters
        initialSearch={search}
        initialPriority={priority}
        initialPosition={pos}
        initialClicks={clicks}
        initialQuickWins={quickwins}
        initialFrom={fromDate}
        initialTo={toDate}
      />

      {/* Table */}
      {paginatedKeywords.length > 0 ? (
        <>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Mot-clé</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground w-24">Position</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground w-24">Clics</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground w-28">Impressions</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground w-20">CTR</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground w-20">Priorité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedKeywords.map((kw) => {
                  const { latest, previous } = getPositionData(kw.positions)

                  return (
                    <tr key={kw.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{kw.keyword}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={cn(
                            'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium',
                            getPositionColor(latest?.position ?? null)
                          )}>
                            {latest?.position?.toFixed(1) || '—'}
                          </span>
                          <PositionDelta
                            current={latest?.position ?? null}
                            previous={previous?.position ?? null}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {formatNumber(latest?.clicks ?? null)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {formatNumber(latest?.impressions ?? null)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {latest?.ctr ? `${(latest.ctr * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {kw.priority ? (
                          <span className={cn(
                            'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                            kw.priority === 'P0' && 'bg-violet-500/20 text-violet-600 dark:text-violet-400',
                            kw.priority === 'P1' && 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
                            kw.priority === 'P2' && 'bg-muted text-muted-foreground',
                            kw.priority === 'P3' && 'bg-muted/50 text-muted-foreground/70',
                          )}>
                            {kw.priority}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} sur {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <a
                    href={buildPaginationUrl(page - 1)}
                    className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm hover:bg-accent transition-colors"
                  >
                    Précédent
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={buildPaginationUrl(page + 1)}
                    className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm hover:bg-accent transition-colors"
                  >
                    Suivant
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className="bg-muted/30 border border-dashed border-border rounded-xl p-12 text-center">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {hasActiveFilters || search ? 'Aucun résultat' : 'Aucun mot-clé'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters || search
              ? 'Aucun mot-clé ne correspond aux filtres sélectionnés.'
              : 'Importez vos données pour voir vos mots-clés ici.'
            }
          </p>
          {!search && !hasActiveFilters && (
            <a
              href="/ogs/app/import"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Aller à l&apos;import →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
