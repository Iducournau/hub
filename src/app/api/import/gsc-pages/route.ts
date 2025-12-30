import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Papa from 'papaparse'

interface GSCPageRow {
  // FR
  'Pages les plus populaires'?: string
  // EN
  'Top pages'?: string
  'Page'?: string
  // Métriques
  'Clics'?: string
  'Clicks'?: string
  'Impressions'?: string
  'CTR'?: string
  'Position'?: string
  [key: string]: string | undefined
}

interface ImportStats {
  pages_created: number
  pages_updated: number
  history_records: number
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

    // Récupérer le fichier
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Lire le contenu du fichier
    const text = await file.text()

    // Parser le CSV
    const parsed = Papa.parse<GSCPageRow>(text, {
      header: true,
      skipEmptyLines: true,
      delimiter: '',
      transformHeader: (header) => header.trim(),
    })

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Erreur de parsing CSV', details: parsed.errors },
        { status: 400 }
      )
    }

    const stats: ImportStats = {
      pages_created: 0,
      pages_updated: 0,
      history_records: 0,
    }

    const today = new Date().toISOString().split('T')[0]
    const errors: string[] = []

    // Récupérer les positions actuelles pour les sauvegarder comme previous_position
    const { data: existingPages } = await supabase
      .from('pages')
      .select('url, position')

    const currentPositions = new Map<string, number | null>()
    if (existingPages) {
      for (const page of existingPages) {
        currentPositions.set(page.url, page.position)
      }
    }

    // Préparer les données pour upsert en batch
    const pagesToUpsert: Array<{
      url: string
      clicks: number | null
      impressions: number | null
      ctr: number | null
      position: number | null
      previous_position: number | null
      gsc_date: string
      status: string
    }> = []

    // Map pour stocker les métriques par URL (pour l'historique)
    const metricsMap = new Map<string, {
      clicks: number | null
      impressions: number | null
      ctr: number | null
      position: number | null
    }>()

    for (const row of parsed.data) {
      // Récupérer l'URL
      const url = (
        row['Pages les plus populaires'] ||
        row['Top pages'] ||
        row['Page'] ||
        ''
      ).trim()
      if (!url) continue

      // Récupérer les métriques
      const clicks = parseInt(row['Clics'] || row['Clicks'] || '0', 10)
      const impressions = parseInt(row['Impressions'] || '0', 10)
      const ctrStr = (row['CTR'] || '0').replace('%', '').replace(',', '.').trim()
      const ctr = parseFloat(ctrStr) / 100
      const position = parseFloat((row['Position'] || '0').replace(',', '.'))

      // Sauvegarder la position actuelle comme previous_position
      const previousPosition = currentPositions.get(url) ?? null

      // Stocker les métriques pour l'historique
      metricsMap.set(url, {
        clicks: clicks || null,
        impressions: impressions || null,
        ctr: ctr || null,
        position: position || null,
      })

      pagesToUpsert.push({
        url,
        clicks: clicks || null,
        impressions: impressions || null,
        ctr: ctr || null,
        position: position || null,
        previous_position: previousPosition,
        gsc_date: today,
        status: 'active',
      })
    }

    // Upsert en batch (par lots de 100)
    const batchSize = 100
    for (let i = 0; i < pagesToUpsert.length; i += batchSize) {
      const batch = pagesToUpsert.slice(i, i + batchSize)

      const { data, error } = await supabase
        .from('pages')
        .upsert(batch, {
          onConflict: 'url',
          ignoreDuplicates: false
        })
        .select('id')

      if (error) {
        errors.push(`Erreur batch ${i / batchSize + 1}: ${error.message}`)
      } else if (data) {
        stats.pages_updated += data.length
      }
    }

    // Estimer créés vs mis à jour (simplifié)
    stats.pages_created = stats.pages_updated

    // Insérer les enregistrements historiques
    // Récupérer tous les IDs des pages par URL
    const urls = pagesToUpsert.map(p => p.url)
    const { data: pagesWithIds } = await supabase
      .from('pages')
      .select('id, url')
      .in('url', urls)

    if (pagesWithIds && pagesWithIds.length > 0) {
      // Créer un map URL -> ID
      const urlToId = new Map<string, string>()
      for (const page of pagesWithIds) {
        urlToId.set(page.url, page.id)
      }

      // Préparer les enregistrements historiques
      const historyRecords = []
      for (const [url, metrics] of metricsMap) {
        const pageId = urlToId.get(url)
        if (pageId) {
          historyRecords.push({
            page_id: pageId,
            date: today,
            source: 'gsc',
            clicks: metrics.clicks,
            impressions: metrics.impressions,
            ctr: metrics.ctr,
            position: metrics.position,
          })
        }
      }

      // Upsert historique en batch
      for (let i = 0; i < historyRecords.length; i += batchSize) {
        const batch = historyRecords.slice(i, i + batchSize)
        const { data: historyData, error: historyError } = await supabase
          .from('page_metrics_history')
          .upsert(batch, {
            onConflict: 'page_id,date,source',
            ignoreDuplicates: false
          })
          .select('id')

        if (historyError) {
          errors.push(`Erreur historique batch ${i / batchSize + 1}: ${historyError.message}`)
        } else if (historyData) {
          stats.history_records += historyData.length
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      total_processed: pagesToUpsert.length,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error('Import GSC Pages error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
