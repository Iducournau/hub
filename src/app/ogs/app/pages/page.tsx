import { FileText, Plus, Search, Filter } from 'lucide-react'

export default function PagesPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Pages</h1>
          <p className="text-muted-foreground">Gérez vos pages et leurs mots-clés assignés</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une page..."
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        <button className="bg-card border border-border hover:bg-accent text-muted-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Filter className="w-4 h-4" />
          Filtres
        </button>
      </div>

      {/* Empty state */}
      <div className="bg-muted/30 border border-dashed border-border rounded-xl p-12 text-center">
        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Aucune page</h3>
        <p className="text-muted-foreground mb-4">
          Importez vos données pour voir vos pages ici.
        </p>
        <a
          href="/ogs/app/import"
          className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          Aller à l&apos;import →
        </a>
      </div>
    </div>
  )
}
