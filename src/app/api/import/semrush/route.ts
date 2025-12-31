import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Papa from 'papaparse'

interface SEMrushRow {
  // En-têtes SEMrush Organic Research export
  'Keyword'?: string
  'Position'?: string
  'Search Volume'?: string
  'Keyword Difficulty'?: string
  'CPC'?: string
  'URL'?: string
  'Traffic'?: string
  'Traffic (%)'?: string
  'Traffic Cost'?: string
  // Index signature pour flexibilité
  [key: string]: string | undefined
}

interface ImportStats {
  keywords_created: number
  keywords_updated: number
  positions_created: number
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

    // Parser le CSV (SEMrush utilise généralement des points-virgules ou virgules)
    const parsed = Papa.parse<SEMrushRow>(text, {
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
      keywords_updated: 0,
      positions_created: 0,
    }

    const today = new Date().toISOString().split('T')[0]
    const errors: string[] = []

    // Traiter chaque ligne
    for (const row of parsed.data) {
      const keywordText = (row['Keyword'] || '').trim()
      if (!keywordText) continue

      // Récupérer les métriques SEMrush
      const position = parseInt(row['Position'] || '0', 10)
      const volume = parseInt(row['Search Volume'] || '0', 10)
      const difficulty = parseInt(row['Keyword Difficulty'] || '0', 10)

      try {
        // Chercher si le keyword existe déjà
        const { data: existingKeywords } = await supabase
          .from('keywords')
          .select('id, volume, difficulty')
          .eq('keyword', keywordText)
          .limit(1)

        let keywordId: string

        if (existingKeywords && existingKeywords.length > 0) {
          keywordId = existingKeywords[0].id

          // Mettre à jour volume et difficulty si nouvelles valeurs disponibles
          const updates: { volume?: number; difficulty?: number } = {}
          if (volume > 0) updates.volume = volume
          if (difficulty > 0) updates.difficulty = difficulty

          if (Object.keys(updates).length > 0) {
            await supabase
              .from('keywords')
              .update(updates)
              .eq('id', keywordId)
            stats.keywords_updated++
          }
        } else {
          // Créer le keyword avec volume et difficulty
          const { data: newKeyword, error: insertError } = await supabase
            .from('keywords')
            .insert({
              keyword: keywordText,
              volume: volume > 0 ? volume : null,
              difficulty: difficulty > 0 ? difficulty : null,
            })
            .select('id')
            .single()

          if (insertError || !newKeyword) {
            errors.push(`Erreur création keyword "${keywordText}": ${insertError?.message}`)
            continue
          }
          keywordId = newKeyword.id
          stats.keywords_created++
        }

        // Insérer la position (source = semrush)
        if (position > 0) {
          const { error: posError } = await supabase
            .from('positions')
            .upsert(
              {
                keyword_id: keywordId,
                date: today,
                source: 'semrush',
                position: position,
              },
              { onConflict: 'keyword_id,date,source' }
            )

          if (posError) {
            errors.push(`Erreur position "${keywordText}": ${posError.message}`)
          } else {
            stats.positions_created++
          }
        }
      } catch (err) {
        errors.push(`Erreur traitement "${keywordText}": ${err}`)
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      total_processed: parsed.data.length,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error('Import SEMrush error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
