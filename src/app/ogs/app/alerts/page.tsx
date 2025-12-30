import { AlertTriangle, Bell, CheckCircle2, Filter } from 'lucide-react'

export default function AlertsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Alertes</h1>
          <p className="text-muted-foreground">Opportunités et problèmes détectés automatiquement</p>
        </div>
        <button className="bg-card border border-border hover:bg-accent text-muted-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Filter className="w-4 h-4" />
          Filtrer
        </button>
      </div>

      {/* Alert Types Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'Baisse position', color: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' },
          { label: 'Quick Win', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
          { label: 'Cannibalisation', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' },
          { label: 'Orphelin', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30' },
        ].map((type) => (
          <span
            key={type.label}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${type.color}`}
          >
            {type.label}
          </span>
        ))}
      </div>

      {/* Empty state */}
      <div className="bg-muted/30 border border-dashed border-border rounded-xl p-12 text-center">
        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Aucune alerte</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Les alertes seront générées automatiquement une fois que vous aurez importé vos données SEO.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Système d&apos;alertes prêt
        </div>
      </div>

      {/* Info about S4 */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-1">Développement en cours</h4>
          <p className="text-sm text-muted-foreground">
            Le système d&apos;alertes automatiques et les agents IA seront développés en Semaine 4.
            Il détectera les baisses de position, cannibalisations, mots-clés orphelins et Quick Wins.
          </p>
        </div>
      </div>
    </div>
  )
}
