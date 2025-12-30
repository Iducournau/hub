'use client'

import { useState } from 'react'
import { Gauge, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface PageSpeedAnalyzerProps {
  avgSeoScore: number | null
  avgPerformanceScore: number | null
  avgAccessibilityScore: number | null
  avgBestPracticesScore: number | null
  pagesAnalyzed: number
  totalPages: number
}

function getScoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground'
  if (score >= 90) return 'text-emerald-500'
  if (score >= 50) return 'text-yellow-500'
  return 'text-red-500'
}

function getScoreBg(score: number | null) {
  if (score === null) return 'bg-muted'
  if (score >= 90) return 'bg-emerald-500/20'
  if (score >= 50) return 'bg-yellow-500/20'
  return 'bg-red-500/20'
}

function ScoreCircle({ score, label }: { score: number | null; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getScoreBg(score)}`}>
        <span className={`text-lg font-bold ${getScoreColor(score)}`}>
          {score ?? '—'}
        </span>
      </div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  )
}

export function PageSpeedAnalyzer({
  avgSeoScore,
  avgPerformanceScore,
  avgAccessibilityScore,
  avgBestPracticesScore,
  pagesAnalyzed,
  totalPages,
}: PageSpeedAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)
    setProgress('Analyse en cours...')

    try {
      const response = await fetch('/api/pagespeed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 10 }), // Analyser 10 pages max par clic
      })

      const data = await response.json()

      if (data.success) {
        setProgress(`${data.analyzed}/${data.total} pages analysees`)
        // Rafraichir la page apres 1.5s pour voir les nouveaux scores
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setError(data.error || 'Erreur lors de l\'analyse')
        setProgress(null)
      }
    } catch (err) {
      setError('Erreur de connexion')
      setProgress(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-foreground">Score PageSpeed</h3>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyse...' : 'Analyser'}
        </button>
      </div>

      {/* Scores Grid */}
      <div className="flex justify-around mb-4">
        <ScoreCircle score={avgSeoScore} label="SEO" />
        <ScoreCircle score={avgPerformanceScore} label="Perf." />
        <ScoreCircle score={avgAccessibilityScore} label="A11y" />
        <ScoreCircle score={avgBestPracticesScore} label="BP" />
      </div>

      {/* Status */}
      <div className="text-center">
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        {progress && !error && (
          <div className="flex items-center justify-center gap-2 text-emerald-500 text-sm">
            <CheckCircle className="w-4 h-4" />
            {progress}
          </div>
        )}
        {!progress && !error && (
          <p className="text-xs text-muted-foreground">
            {pagesAnalyzed > 0
              ? `${pagesAnalyzed}/${totalPages} pages analysees`
              : 'Cliquez sur Analyser pour obtenir les scores'}
          </p>
        )}
      </div>
    </div>
  )
}
