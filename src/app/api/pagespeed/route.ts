import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface PageSpeedResult {
  lighthouseResult?: {
    categories?: {
      seo?: { score: number }
      performance?: { score: number }
      accessibility?: { score: number }
      'best-practices'?: { score: number }
    }
  }
  error?: {
    message: string
  }
}

interface AnalysisResult {
  url: string
  seo_score: number | null
  performance_score: number | null
  accessibility_score: number | null
  best_practices_score: number | null
  error?: string
}

async function analyzeUrl(url: string): Promise<AnalysisResult> {
  try {
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
    apiUrl.searchParams.set('url', url)
    apiUrl.searchParams.set('category', 'seo')
    apiUrl.searchParams.append('category', 'performance')
    apiUrl.searchParams.append('category', 'accessibility')
    apiUrl.searchParams.append('category', 'best-practices')
    apiUrl.searchParams.set('strategy', 'mobile')

    // Ajouter la clé API si disponible (optionnel, mais recommandé pour éviter les limites)
    if (process.env.GOOGLE_PAGESPEED_API_KEY) {
      apiUrl.searchParams.set('key', process.env.GOOGLE_PAGESPEED_API_KEY)
    }

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        url,
        seo_score: null,
        performance_score: null,
        accessibility_score: null,
        best_practices_score: null,
        error: `HTTP ${response.status}: ${errorText.slice(0, 100)}`,
      }
    }

    const data: PageSpeedResult = await response.json()

    if (data.error) {
      return {
        url,
        seo_score: null,
        performance_score: null,
        accessibility_score: null,
        best_practices_score: null,
        error: data.error.message,
      }
    }

    const categories = data.lighthouseResult?.categories
    return {
      url,
      seo_score: categories?.seo?.score ? Math.round(categories.seo.score * 100) : null,
      performance_score: categories?.performance?.score ? Math.round(categories.performance.score * 100) : null,
      accessibility_score: categories?.accessibility?.score ? Math.round(categories.accessibility.score * 100) : null,
      best_practices_score: categories?.['best-practices']?.score ? Math.round(categories['best-practices'].score * 100) : null,
    }
  } catch (error) {
    return {
      url,
      seo_score: null,
      performance_score: null,
      accessibility_score: null,
      best_practices_score: null,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

// Délai entre les requêtes pour éviter le rate limiting (en ms)
const DELAY_BETWEEN_REQUESTS = 2000

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: Request) {
  try {
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
              // Ignore in Server Components
            }
          },
        },
      }
    )

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer les paramètres (optionnel: url spécifique, limit)
    const body = await request.json().catch(() => ({}))
    const specificUrl = body.url as string | undefined
    const limit = Math.min(body.limit || 10, 50) // Max 50 pages par requête

    // Récupérer les pages à analyser
    let query = supabase
      .from('pages')
      .select('id, url')
      .eq('status', 'active')

    if (specificUrl) {
      query = query.eq('url', specificUrl)
    } else {
      // Analyser les pages sans score ou les plus anciennes
      query = query
        .order('pagespeed_analyzed_at', { ascending: true, nullsFirst: true })
        .limit(limit)
    }

    const { data: pages, error: fetchError } = await query

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: `Erreur DB: ${fetchError.message}` },
        { status: 500 }
      )
    }

    if (!pages || pages.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucune page à analyser',
        analyzed: 0,
      })
    }

    const results: AnalysisResult[] = []
    const errors: string[] = []
    let successCount = 0

    // Analyser chaque page avec un délai
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]

      // Délai entre les requêtes (sauf pour la première)
      if (i > 0) {
        await delay(DELAY_BETWEEN_REQUESTS)
      }

      const result = await analyzeUrl(page.url)
      results.push(result)

      if (result.error) {
        errors.push(`${page.url}: ${result.error}`)
      } else {
        // Mettre à jour la base de données
        const { error: updateError } = await supabase
          .from('pages')
          .update({
            seo_score: result.seo_score,
            performance_score: result.performance_score,
            accessibility_score: result.accessibility_score,
            best_practices_score: result.best_practices_score,
            pagespeed_analyzed_at: new Date().toISOString(),
          })
          .eq('id', page.id)

        if (updateError) {
          errors.push(`Update ${page.url}: ${updateError.message}`)
        } else {
          successCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      analyzed: successCount,
      total: pages.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error('PageSpeed analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// GET pour récupérer le score moyen
export async function GET() {
  try {
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

    const { data: pages, error } = await supabase
      .from('pages')
      .select('seo_score, performance_score, accessibility_score, best_practices_score')
      .not('seo_score', 'is', null)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    if (!pages || pages.length === 0) {
      return NextResponse.json({
        success: true,
        avg_seo_score: null,
        avg_performance_score: null,
        avg_accessibility_score: null,
        avg_best_practices_score: null,
        pages_analyzed: 0,
      })
    }

    const avg = (arr: (number | null)[]) => {
      const valid = arr.filter((n): n is number => n !== null)
      return valid.length > 0 ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : null
    }

    return NextResponse.json({
      success: true,
      avg_seo_score: avg(pages.map(p => p.seo_score)),
      avg_performance_score: avg(pages.map(p => p.performance_score)),
      avg_accessibility_score: avg(pages.map(p => p.accessibility_score)),
      avg_best_practices_score: avg(pages.map(p => p.best_practices_score)),
      pages_analyzed: pages.length,
    })

  } catch (error) {
    console.error('PageSpeed GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
