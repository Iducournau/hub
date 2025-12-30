import { AlertTriangle, Bell, CheckCircle2, Filter } from 'lucide-react'

export default function AlertsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Alertes</h1>
          <p className="text-slate-400">Opportunités et problèmes détectés automatiquement</p>
        </div>
        <button className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Filter className="w-4 h-4" />
          Filtrer
        </button>
      </div>

      {/* Alert Types Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'Baisse position', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
          { label: 'Quick Win', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
          { label: 'Cannibalisation', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
          { label: 'Orphelin', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
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
      <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-xl p-12 text-center">
        <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Aucune alerte</h3>
        <p className="text-slate-400 mb-4 max-w-md mx-auto">
          Les alertes seront générées automatiquement une fois que vous aurez importé vos données SEO.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Système d&apos;alertes prêt
        </div>
      </div>

      {/* Info about S4 */}
      <div className="mt-8 bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-indigo-400 mb-1">Développement en cours</h4>
          <p className="text-sm text-slate-400">
            Le système d&apos;alertes automatiques et les agents IA seront développés en Semaine 4.
            Il détectera les baisses de position, cannibalisations, mots-clés orphelins et Quick Wins.
          </p>
        </div>
      </div>
    </div>
  )
}
