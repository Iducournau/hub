import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { FileText, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PagesFilters } from './pages-filters'

interface PageData {
  id: string
  url: string
  title: string | null
  clicks: number | null
  impressions: number | null
  ctr: number | null
  position: number | null
  previous_position: number | null
  formation: string | null
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

// Extract path from URL
function getPath(url: string) {
  try {
    const urlObj = new URL(url)
    return urlObj.pathname || '/'
  } catch {
    return url
  }
}

// Position delta component
function PositionDelta({ current, previous }: { current: number | null; previous: number | null }) {
  if (!current || !previous) return null

  const delta = previous - current // Positive = improved (lower position is better)

  if (delta === 0) {
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

export default async function PagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    page?: string
    sort?: string
    pos?: string
    clicks?: string
    ctr?: string
    formation?: string
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
  const pos = params.pos || ''
  const clicks = params.clicks || ''
  const ctr = params.ctr || ''
  const formation = params.formation || ''
  const page = parseInt(params.page || '1', 10)
  const sort = params.sort || 'position'
  const perPage = 50

  // Fetch distinct formations for filter
  const { data: formationsData } = await supabase
    .from('pages')
    .select('formation')
    .not('formation', 'is', null)
    .order('formation')

  const formations = [...new Set(formationsData?.map(f => f.formation).filter(Boolean) || [])] as string[]

  // Fetch pages - position: ascending (best first), others: descending
  const isPositionSort = sort === 'position'
  let query = supabase
    .from('pages')
    .select('*', { count: 'exact' })
    .order(sort, { ascending: isPositionSort, nullsFirst: false })

  // Search filter
  if (search) {
    query = query.ilike('url', `%${search}%`)
  }

  // Position filter
  if (pos && pos !== 'all') {
    if (pos === 'top3') {
      query = query.lte('position', 3).gt('position', 0)
    } else if (pos === 'top10') {
      query = query.lte('position', 10).gt('position', 0)
    } else if (pos === 'top20') {
      query = query.lte('position', 20).gt('position', 0)
    } else if (pos === 'below20') {
      query = query.gt('position', 20)
    }
  }

  // Clicks filter
  if (clicks && clicks !== 'all') {
    const minClicks = parseInt(clicks, 10)
    query = query.gte('clicks', minClicks)
  }

  // CTR filter
  if (ctr && ctr !== 'all') {
    const minCtr = parseFloat(ctr) / 100
    query = query.gte('ctr', minCtr)
  }

  // Formation filter
  if (formation && formation !== 'all') {
    query = query.eq('formation', formation)
  }

  // Apply pagination after filters
  query = query.range((page - 1) * perPage, page * perPage - 1)

  const { data, count, error } = await query
  const pages = data as PageData[] | null

  if (error) {
    console.error('Error fetching pages:', error)
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / perPage)
  const hasActiveFilters = pos || clicks || ctr || formation

  // Build pagination URL
  const buildPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (pos) params.set('pos', pos)
    if (clicks) params.set('clicks', clicks)
    if (ctr) params.set('ctr', ctr)
    if (formation) params.set('formation', formation)
    if (sort !== 'position') params.set('sort', sort)
    params.set('page', newPage.toString())
    return `/ogs/app/pages?${params.toString()}`
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Pages</h1>
          <p className="text-muted-foreground">
            {totalCount.toLocaleString('fr-FR')} pages
            {hasActiveFilters && ' (filtré)'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <PagesFilters
        initialSearch={search}
        initialPosition={pos}
        initialClicks={clicks}
        initialCtr={ctr}
        initialFormation={formation}
        formations={formations}
      />

      {/* Table */}
      {pages && pages.length > 0 ? (
        <>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
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
                {pages.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate max-w-md" title={p.url}>
                          {getPath(p.url)}
                        </span>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium',
                          getPositionColor(p.position)
                        )}>
                          {p.position?.toFixed(1) || '—'}
                        </span>
                        <PositionDelta current={p.position} previous={p.previous_position} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(p.clicks)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(p.impressions)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {p.ctr ? `${(p.ctr * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                ))}
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
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {hasActiveFilters || search ? 'Aucun résultat' : 'Aucune page'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters || search
              ? 'Aucune page ne correspond aux filtres sélectionnés.'
              : 'Importez vos données pour voir vos pages ici.'
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
