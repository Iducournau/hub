import {
  Key, FileText, TrendingUp, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react'

// Données de démo - à remplacer par les vraies données Supabase
const stats = [
  {
    name: 'Total Keywords',
    value: '—',
    change: null,
    icon: Key,
    color: 'bg-blue-600'
  },
  {
    name: 'Pages indexées',
    value: '—',
    change: null,
    icon: FileText,
    color: 'bg-cyan-600'
  },
  {
    name: 'Position moyenne',
    value: '—',
    change: null,
    icon: TrendingUp,
    color: 'bg-emerald-600'
  },
  {
    name: 'Alertes actives',
    value: '—',
    change: null,
    icon: AlertTriangle,
    color: 'bg-amber-600'
  },
]

function ChangeIndicator({ change }: { change: number | null }) {
  if (change === null) return <Minus className="w-4 h-4 text-muted-foreground" />
  if (change > 0) return (
    <span className="flex items-center text-emerald-500 text-sm">
      <ArrowUpRight className="w-4 h-4" />
      +{change}%
    </span>
  )
  if (change < 0) return (
    <span className="flex items-center text-red-500 text-sm">
      <ArrowDownRight className="w-4 h-4" />
      {change}%
    </span>
  )
  return <Minus className="w-4 h-4 text-muted-foreground" />
}

export default function DashboardPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de vos performances SEO</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ChangeIndicator change={stat.change} />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.name}</div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      <div className="bg-muted/30 border border-dashed border-border rounded-xl p-12 text-center">
        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Aucune donnée</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Commencez par importer vos données SEO depuis Google Search Console, SEMrush ou Screaming Frog.
        </p>
        <a
          href="/ogs/app/import"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Importer des données
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}
