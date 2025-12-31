import { CheckCircle2, Circle, Clock, Rocket, Sparkles, Brain, TrendingUp } from 'lucide-react'

const roadmapData = [
  {
    version: 'V1.0',
    title: 'Core MVP',
    status: 'deployed',
    icon: Rocket,
    color: 'emerald',
    tasks: [
      { label: 'Structure Supabase (tables PostgreSQL de base)', done: true },
      { label: 'Import CSV GSC (Keywords + Pages)', done: true },
      { label: 'Interface Next.js (Dashboard, Keywords, Pages, Import, Comparateur)', done: true },
      { label: 'Filtres avancés et pagination', done: true },
      { label: 'PageSpeed Insights (4 scores)', done: true },
      { label: 'Comparateur de périodes', done: true },
      { label: 'Prédictions basées sur tendances', done: true },
      { label: 'Dark mode + Auth Supabase', done: true },
      { label: 'Déploiement Vercel', done: true },
    ],
  },
  {
    version: 'V1.1',
    title: 'Data Enrichment',
    status: 'current',
    icon: Sparkles,
    color: 'blue',
    tasks: [
      { label: 'Table formations (référentiel produits YouSchool)', done: false },
      { label: 'Colonnes keywords enrichies (cluster, cpc, ranking_page_id, etc.)', done: false },
      { label: 'Import CSV SEMrush', done: false },
      { label: 'Import CSV Screaming Frog', done: false },
    ],
  },
  {
    version: 'V1.2',
    title: 'Alertes & Actions',
    status: 'upcoming',
    icon: Clock,
    color: 'amber',
    tasks: [
      { label: 'Génération automatique des alertes', done: false },
      { label: 'Détection Quick Wins / Cannibalisations / Orphelins', done: false },
      { label: 'Interface gestion alertes (résoudre/ignorer)', done: false },
    ],
  },
  {
    version: 'V2',
    title: 'Intelligence',
    status: 'upcoming',
    icon: Brain,
    color: 'purple',
    tasks: [
      { label: 'Agent Analyste (rapport hebdo)', done: false },
      { label: 'Agent Rapports (génération auto)', done: false },
      { label: 'Graphiques historiques (évolution positions)', done: false },
      { label: 'Automatisation imports (n8n / Make)', done: false },
      { label: 'Agent Stratège', done: false },
      { label: 'Agent Intent Matcher', done: false, priority: true },
    ],
  },
  {
    version: 'V3',
    title: 'Différenciation',
    status: 'upcoming',
    icon: Sparkles,
    color: 'pink',
    tasks: [
      { label: 'Suivi GEO (visibilité IA)', done: false },
      { label: 'Tables geo_queries + geo_citations', done: false },
      { label: 'Multi-projets (table projects)', done: false },
      { label: 'Agent GEO Auditor', done: false, priority: true },
      { label: 'Agent Meta Writer', done: false },
      { label: 'Connexion API GSC', done: false },
    ],
  },
  {
    version: 'V4',
    title: 'Prédictif',
    status: 'upcoming',
    icon: TrendingUp,
    color: 'orange',
    tasks: [
      { label: 'Agent Trend Predictor', done: false, priority: true },
      { label: 'Agent Content Optimizer', done: false },
      { label: 'Suggestions d\'optimisation IA', done: false },
      { label: 'Analyse concurrence', done: false },
    ],
  },
]

const statusConfig = {
  deployed: {
    label: 'Déployé',
    badgeClass: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  current: {
    label: 'En cours',
    badgeClass: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  upcoming: {
    label: 'À venir',
    badgeClass: 'bg-muted text-muted-foreground border-border',
  },
}

const colorClasses = {
  emerald: {
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
  },
  blue: {
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
  },
  amber: {
    iconBg: 'bg-amber-500/20',
    iconText: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
  },
  purple: {
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/30',
  },
  pink: {
    iconBg: 'bg-pink-500/20',
    iconText: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500/30',
  },
  orange: {
    iconBg: 'bg-orange-500/20',
    iconText: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/30',
  },
}

export default function RoadmapPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Roadmap</h1>
        <p className="text-muted-foreground">
          Évolution planifiée du module OGS — Outil de Gestion SEO
        </p>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">1</div>
          <div className="text-sm text-muted-foreground">Version déployée</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</div>
          <div className="text-sm text-muted-foreground">Version en cours</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-muted-foreground">4</div>
          <div className="text-sm text-muted-foreground">Versions à venir</div>
        </div>
      </div>

      {/* Roadmap cards */}
      <div className="space-y-6">
        {roadmapData.map((version) => {
          const Icon = version.icon
          const colors = colorClasses[version.color as keyof typeof colorClasses]
          const status = statusConfig[version.status as keyof typeof statusConfig]
          const completedTasks = version.tasks.filter((t) => t.done).length
          const totalTasks = version.tasks.length
          const progress = Math.round((completedTasks / totalTasks) * 100)

          return (
            <div
              key={version.version}
              className={`bg-card border rounded-xl overflow-hidden ${
                version.status === 'current' ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-border'
              }`}
            >
              {/* Card header */}
              <div className="p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${colors.iconText}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-foreground">
                          {version.version} — {version.title}
                        </h2>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.badgeClass}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {completedTasks}/{totalTasks} tâches complétées
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{progress}%</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      version.status === 'deployed'
                        ? 'bg-emerald-500'
                        : version.status === 'current'
                        ? 'bg-blue-500'
                        : 'bg-muted-foreground/30'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Tasks list */}
              <div className="p-5">
                <ul className="grid gap-2">
                  {version.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      {task.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          task.done ? 'text-muted-foreground line-through' : 'text-foreground'
                        }`}
                      >
                        {task.label}
                      </span>
                      {task.priority && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          Priorité CMO
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
