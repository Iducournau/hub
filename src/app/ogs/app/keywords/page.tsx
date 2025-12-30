import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Key } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KeywordsSearch } from './keywords-search'

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

export default async function KeywordsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
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
  const page = parseInt(params.page || '1', 10)
  const perPage = 50

  // Fetch keywords with latest position
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
    `, { count: 'exact' })
    .order('keyword', { ascending: true })
    .range((page - 1) * perPage, page * perPage - 1)

  if (search) {
    query = query.ilike('keyword', `%${search}%`)
  }

  const { data, count, error } = await query
  const keywords = data as KeywordData[] | null

  if (error) {
    console.error('Error fetching keywords:', error)
  }

  const totalPages = Math.ceil((count || 0) / perPage)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Keywords</h1>
          <p className="text-muted-foreground">
            {count ? `${count.toLocaleString('fr-FR')} mots-clés` : 'Chargement...'}
          </p>
        </div>
      </div>

      {/* Search */}
      <KeywordsSearch initialSearch={search} />

      {/* Table */}
      {keywords && keywords.length > 0 ? (
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
                {keywords.map((kw) => {
                  // Get latest position data
                  const latestPosition = kw.positions && kw.positions.length > 0
                    ? kw.positions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                    : null

                  return (
                    <tr key={kw.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{kw.keyword}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium',
                          getPositionColor(latestPosition?.position ?? null)
                        )}>
                          {latestPosition?.position?.toFixed(1) || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {formatNumber(latestPosition?.clicks ?? null)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {formatNumber(latestPosition?.impressions ?? null)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {latestPosition?.ctr ? `${(latestPosition.ctr * 100).toFixed(1)}%` : '—'}
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
                    href={`/ogs/app/keywords?q=${search}&page=${page - 1}`}
                    className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm hover:bg-accent transition-colors"
                  >
                    Précédent
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`/ogs/app/keywords?q=${search}&page=${page + 1}`}
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
            {search ? 'Aucun résultat' : 'Aucun mot-clé'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search
              ? `Aucun mot-clé ne correspond à "${search}"`
              : 'Importez vos données pour voir vos mots-clés ici.'
            }
          </p>
          {!search && (
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
