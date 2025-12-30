'use client'

import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, FileText, Globe, BarChart3, Check, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const importSources = [
  {
    id: 'gsc',
    name: 'GSC - Keywords',
    description: 'Requêtes, positions, clicks, impressions',
    icon: Globe,
    color: 'bg-green-600',
    format: 'Export "Requêtes" depuis GSC',
    enabled: true,
  },
  {
    id: 'gsc-pages',
    name: 'GSC - Pages',
    description: 'URLs, clicks, impressions, CTR',
    icon: FileText,
    color: 'bg-emerald-600',
    format: 'Export "Pages" depuis GSC',
    enabled: true,
  },
  {
    id: 'semrush',
    name: 'SEMrush',
    description: 'Keywords, volumes, difficulty',
    icon: BarChart3,
    color: 'bg-orange-600',
    format: 'Export Organic Research',
    enabled: false,
  },
  {
    id: 'screaming',
    name: 'Screaming Frog',
    description: 'URLs, titles, meta, status',
    icon: FileSpreadsheet,
    color: 'bg-yellow-600',
    format: 'Internal All export',
    enabled: false,
  },
]

interface ImportResult {
  success: boolean
  stats?: {
    keywords_created?: number
    keywords_existing?: number
    positions_created?: number
    pages_created?: number
    pages_updated?: number
  }
  total_processed?: number
  error?: string
  errors?: string[]
}

export default function ImportPage() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setResult({ success: false, error: 'Le fichier doit être au format CSV' })
      return
    }
    setSelectedFile(file)
    setResult(null)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedSource) return

    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`/api/import/${selectedSource}`, {
        method: 'POST',
        body: formData,
      })

      const data: ImportResult = await response.json()
      setResult(data)

      if (data.success) {
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch {
      setResult({ success: false, error: 'Erreur de connexion au serveur' })
    } finally {
      setIsUploading(false)
    }
  }

  const selectedSourceData = importSources.find(s => s.id === selectedSource)
  const canUpload = selectedSource && selectedFile && selectedSourceData?.enabled

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
                onClick={() => {
                  setSelectedSource(source.id)
                  setResult(null)
                }}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all relative',
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500'
                    : 'bg-card border-border hover:border-ring',
                  !source.enabled && 'opacity-60'
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
                {!source.enabled && (
                  <span className="absolute top-2 right-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                    Bientôt
                  </span>
                )}
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

          {selectedFile ? (
            <>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {selectedFile.name}
              </h3>
              <p className="text-muted-foreground mb-4">
                {(selectedFile.size / 1024).toFixed(1)} Ko
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Glissez votre fichier ici
              </h3>
              <p className="text-muted-foreground mb-4">
                ou cliquez pour sélectionner un fichier CSV
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            id="file-upload"
            onChange={handleFileInputChange}
          />

          <div className="flex items-center justify-center gap-3">
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 bg-card border border-border hover:bg-accent text-foreground font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors"
            >
              Sélectionner un fichier
            </label>

            {canUpload && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importer
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={cn(
          'mt-6 rounded-xl p-4 flex items-start gap-3',
          result.success
            ? 'bg-emerald-500/10 border border-emerald-500/30'
            : 'bg-red-500/10 border border-red-500/30'
        )}>
          {result.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <div>
            {result.success ? (
              <>
                <h4 className="font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                  Import réussi
                </h4>
                <p className="text-sm text-muted-foreground">
                  {result.stats?.keywords_created !== undefined ? (
                    <>
                      {result.stats.keywords_created} nouveaux mots-clés, {' '}
                      {result.stats.keywords_existing} existants, {' '}
                      {result.stats.positions_created} positions enregistrées
                    </>
                  ) : result.stats?.pages_created !== undefined ? (
                    <>
                      {result.total_processed} pages traitées
                    </>
                  ) : (
                    'Import terminé'
                  )}
                </p>
              </>
            ) : (
              <>
                <h4 className="font-medium text-red-600 dark:text-red-400 mb-1">
                  Erreur d&apos;import
                </h4>
                <p className="text-sm text-muted-foreground">
                  {result.error}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Info for disabled sources */}
      {selectedSource && !selectedSourceData?.enabled && (
        <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-1">
              Import non disponible
            </h4>
            <p className="text-sm text-muted-foreground">
              L&apos;import {selectedSourceData?.name} sera disponible prochainement.
              Seul Google Search Console est actif pour le moment.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
