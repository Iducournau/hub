import { FileText, Plus, Search, Filter } from 'lucide-react'

export default function PagesPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Pages</h1>
          <p className="text-slate-400">Gérez vos pages et leurs mots-clés assignés</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher une page..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Filter className="w-4 h-4" />
          Filtres
        </button>
      </div>

      {/* Empty state */}
      <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-xl p-12 text-center">
        <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Aucune page</h3>
        <p className="text-slate-400 mb-4">
          Importez vos données pour voir vos pages ici.
        </p>
        <a
          href="/ogs/app/import"
          className="text-indigo-400 hover:text-indigo-300 font-medium"
        >
          Aller à l&apos;import →
        </a>
      </div>
    </div>
  )
}
