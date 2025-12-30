import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Papa from 'papaparse'

interface GSCRow {
  // Avec en-tête (FR) - GSC export
  'Requêtes les plus fréquentes'?: string
  'Requête'?: string
  'Clics'?: string
  'Impressions'?: string
  'CTR'?: string
  'Position'?: string
  // Avec en-tête (EN)
  'Top queries'?: string
  'Query'?: string
  'Clicks'?: string
  // Index signature pour flexibilité
  [key: string]: string | undefined
}

interface ImportStats {
  keywords_created: number
  keywords_existing: number
  positions_created: number
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    // Client sans types stricts pour l'import
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

    // Parser le CSV (auto-détection du délimiteur: tab ou virgule)
    const parsed = Papa.parse<GSCRow>(text, {
      header: true,
      skipEmptyLines: true,
      delimiter: '', // Auto-detect
      transformHeader: (header) => header.trim(),
    })

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Erreur de parsing CSV', details: parsed.errors },
        { status: 400 }
      )
    }

    const stats: ImportStats = {
      keywords_created: 0,
      keywords_existing: 0,
      positions_created: 0,
    }

    const today = new Date().toISOString().split('T')[0]
    const errors: string[] = []

    // Traiter chaque ligne
    for (const row of parsed.data) {
      // Récupérer le mot-clé (plusieurs formats possibles)
      const keywordText = (
        row['Requêtes les plus fréquentes'] ||
        row['Top queries'] ||
        row['Requête'] ||
        row['Query'] ||
        ''
      ).trim()
      if (!keywordText) continue

      // Récupérer les métriques
      const clicks = parseInt(row['Clics'] || row['Clicks'] || '0', 10)
      const impressions = parseInt(row['Impressions'] || '0', 10)
      const ctrStr = (row['CTR'] || '0').replace('%', '').replace(',', '.').trim()
      const ctr = parseFloat(ctrStr) / 100 // Convertir % en décimal
      const position = parseFloat((row['Position'] || '0').replace(',', '.'))

      try {
        // Chercher si le keyword existe déjà
        const { data: existingKeywords } = await supabase
          .from('keywords')
          .select('id')
          .eq('keyword', keywordText)
          .limit(1)

        let keywordId: string

        if (existingKeywords && existingKeywords.length > 0) {
          keywordId = existingKeywords[0].id
          stats.keywords_existing++
        } else {
          // Créer le keyword
          const { data: newKeyword, error: insertError } = await supabase
            .from('keywords')
            .insert({ keyword: keywordText })
            .select('id')
            .single()

          if (insertError || !newKeyword) {
            errors.push(`Erreur création keyword "${keywordText}": ${insertError?.message}`)
            continue
          }
          keywordId = newKeyword.id
          stats.keywords_created++
        }

        // Insérer la position (upsert par keyword_id + date + source)
        const { error: posError } = await supabase
          .from('positions')
          .upsert(
            {
              keyword_id: keywordId,
              date: today,
              source: 'gsc',
              position: position || null,
              clicks: clicks || null,
              impressions: impressions || null,
              ctr: ctr || null,
            },
            { onConflict: 'keyword_id,date,source' }
          )

        if (posError) {
          errors.push(`Erreur position "${keywordText}": ${posError.message}`)
        } else {
          stats.positions_created++
        }
      } catch (err) {
        errors.push(`Erreur traitement "${keywordText}": ${err}`)
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error('Import GSC error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
