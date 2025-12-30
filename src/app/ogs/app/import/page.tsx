'use client'

import { useState } from 'react'
import { Upload, FileSpreadsheet, Globe, BarChart3, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const importSources = [
  {
    id: 'gsc',
    name: 'Google Search Console',
    description: 'Positions, clicks, impressions, CTR',
    icon: Globe,
    color: 'bg-green-600',
    format: 'CSV exporté depuis GSC'
  },
  {
    id: 'semrush',
    name: 'SEMrush',
    description: 'Keywords, volumes, difficulty',
    icon: BarChart3,
    color: 'bg-orange-600',
    format: 'Export Organic Research'
  },
  {
    id: 'screaming',
    name: 'Screaming Frog',
    description: 'URLs, titles, meta, status',
    icon: FileSpreadsheet,
    color: 'bg-yellow-600',
    format: 'Internal All export'
  },
]

export default function ImportPage() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    // TODO: Handle file drop
    console.log('Files dropped:', e.dataTransfer.files)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Import de données</h1>
        <p className="text-muted-foreground">Importez vos données SEO depuis vos outils favoris</p>
      </div>

      {/* Source Selection */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          1. Sélectionnez la source
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {importSources.map((source) => {
            const Icon = source.icon
            const isSelected = selectedSource === source.id
            return (
              <button
                key={source.id}
                onClick={() => setSelectedSource(source.id)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all',
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500'
                    : 'bg-card border-border hover:border-ring'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(source.color, 'p-2 rounded-lg')}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {isSelected && (
                    <div className="bg-blue-600 p-1 rounded-full">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{source.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{source.description}</p>
                <p className="text-xs text-muted-foreground/70">{source.format}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* File Upload */}
      <div className={cn('transition-opacity', !selectedSource && 'opacity-50 pointer-events-none')}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          2. Uploadez votre fichier CSV
        </h2>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 text-center transition-colors',
            dragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-border bg-muted/30'
          )}
        >
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Glissez votre fichier ici
          </h3>
          <p className="text-muted-foreground mb-4">
            ou cliquez pour sélectionner un fichier CSV
          </p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            Sélectionner un fichier
          </label>
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-1">Import non disponible</h4>
          <p className="text-sm text-muted-foreground">
            La fonctionnalité d&apos;import sera disponible une fois la base de données Supabase configurée.
            Les parsers CSV seront développés en Semaine 2.
          </p>
        </div>
      </div>
    </div>
  )
}
