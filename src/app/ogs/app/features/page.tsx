'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  Circle,
  Database,
  Upload,
  BarChart3,
  Bell,
  Bot,
  Eye,
  FileText,
  Filter,
  Zap,
  Settings,
  Users,
  Globe,
  TrendingUp,
  Search,
  Layers,
} from 'lucide-react'

type Feature = {
  id: string
  label: string
  description?: string
  done: boolean
  priority?: 'high' | 'medium' | 'low'
}

type FeatureCategory = {
  id: string
  name: string
  icon: React.ElementType
  color: string
  features: Feature[]
}

const initialCategories: FeatureCategory[] = [
  {
    id: 'data',
    name: 'Gestion des données',
    icon: Database,
    color: 'blue',
    features: [
      { id: 'data-1', label: 'Import CSV Google Search Console', done: true },
      { id: 'data-2', label: 'Import CSV SEMrush', done: false, priority: 'high' },
      { id: 'data-3', label: 'Import CSV Screaming Frog', done: false, priority: 'medium' },
      { id: 'data-4', label: 'Connexion API Google Search Console', done: false, priority: 'medium' },
      { id: 'data-5', label: 'Synchronisation automatique des données', done: false },
      { id: 'data-6', label: 'Historique des imports', done: false },
      { id: 'data-7', label: 'Export des données (CSV, Excel)', done: false },
    ],
  },
  {
    id: 'keywords',
    name: 'Gestion des mots-clés',
    icon: Search,
    color: 'emerald',
    features: [
      { id: 'kw-1', label: 'Liste des mots-clés avec filtres', done: true },
      { id: 'kw-2', label: 'Pagination et tri', done: true },
      { id: 'kw-3', label: 'Assignation page cible par mot-clé', done: false, priority: 'high' },
      { id: 'kw-4', label: 'Gestion des clusters thématiques', done: false, priority: 'medium' },
      { id: 'kw-5', label: 'Priorités (P0, P1, P2, P3)', done: false, priority: 'high' },
      { id: 'kw-6', label: 'Objectif de position (Top3, Top10...)', done: false },
      { id: 'kw-7', label: 'Historique des positions', done: false, priority: 'high' },
      { id: 'kw-8', label: 'Détection des mots-clés orphelins', done: false },
      { id: 'kw-9', label: 'Détection des cannibalisations', done: false, priority: 'high' },
      { id: 'kw-10', label: 'Notes et actions par mot-clé', done: false },
    ],
  },
  {
    id: 'pages',
    name: 'Gestion des pages',
    icon: FileText,
    color: 'purple',
    features: [
      { id: 'pg-1', label: 'Liste des pages avec filtres', done: true },
      { id: 'pg-2', label: 'Scores PageSpeed (Performance, SEO, Accessibilité, Best Practices)', done: true },
      { id: 'pg-3', label: 'Catégorisation des pages (Formation, Blog, etc.)', done: false },
      { id: 'pg-4', label: 'Statut des pages (Publié, Brouillon, À créer)', done: false },
      { id: 'pg-5', label: 'Analyse des balises (title, meta, H1)', done: false },
      { id: 'pg-6', label: 'Comptage des mots', done: false },
      { id: 'pg-7', label: 'Maillage interne (liens entrants/sortants)', done: false },
      { id: 'pg-8', label: 'Profondeur dans l\'arborescence', done: false },
    ],
  },
  {
    id: 'formations',
    name: 'Référentiel Formations',
    icon: Layers,
    color: 'amber',
    features: [
      { id: 'fm-1', label: 'Table des formations YouSchool', done: false, priority: 'high' },
      { id: 'fm-2', label: 'Lien formations ↔ mots-clés', done: false, priority: 'high' },
      { id: 'fm-3', label: 'Lien formations ↔ pages', done: false },
      { id: 'fm-4', label: 'Vue par formation (tous les KW/pages associés)', done: false },
      { id: 'fm-5', label: 'KPIs par formation', done: false },
      { id: 'fm-6', label: 'Priorité par formation', done: false },
    ],
  },
  {
    id: 'dashboard',
    name: 'Dashboard & Visualisation',
    icon: BarChart3,
    color: 'pink',
    features: [
      { id: 'db-1', label: 'KPIs globaux (Top3, Top10, Quick Wins...)', done: true },
      { id: 'db-2', label: 'Comparateur de périodes', done: true },
      { id: 'db-3', label: 'Prédictions de tendances', done: true },
      { id: 'db-4', label: 'Graphiques d\'évolution des positions', done: false, priority: 'high' },
      { id: 'db-5', label: 'Répartition par cluster', done: false },
      { id: 'db-6', label: 'Répartition par formation', done: false },
      { id: 'db-7', label: 'Vue Quick Wins prioritaires', done: false },
    ],
  },
  {
    id: 'alerts',
    name: 'Alertes & Notifications',
    icon: Bell,
    color: 'red',
    features: [
      { id: 'al-1', label: 'Génération automatique des alertes', done: false, priority: 'high' },
      { id: 'al-2', label: 'Alerte baisse de position significative', done: false },
      { id: 'al-3', label: 'Alerte Quick Wins détectés', done: false },
      { id: 'al-4', label: 'Alerte cannibalisations', done: false },
      { id: 'al-5', label: 'Alerte mots-clés orphelins', done: false },
      { id: 'al-6', label: 'Alerte mots-clés non travaillés >30j', done: false },
      { id: 'al-7', label: 'Interface résoudre/ignorer alertes', done: false },
      { id: 'al-8', label: 'Notifications email', done: false },
    ],
  },
  {
    id: 'agents',
    name: 'Agents IA',
    icon: Bot,
    color: 'indigo',
    features: [
      { id: 'ai-1', label: 'Agent Analyste (rapport hebdo)', done: false, priority: 'medium' },
      { id: 'ai-2', label: 'Agent Rapports (génération auto)', done: false },
      { id: 'ai-3', label: 'Agent Stratège (recommandations)', done: false },
      { id: 'ai-4', label: 'Agent Intent Matcher (alignement intention)', done: false, priority: 'high', description: 'Priorité CMO' },
      { id: 'ai-5', label: 'Agent GEO Auditor (score GEO, E-E-A-T)', done: false, priority: 'high', description: 'Priorité CMO' },
      { id: 'ai-6', label: 'Agent Meta Writer (génération title/meta)', done: false },
      { id: 'ai-7', label: 'Agent Trend Predictor (prédiction positions)', done: false, priority: 'high', description: 'Priorité CMO' },
      { id: 'ai-8', label: 'Agent Content Optimizer (analyse vs SERP)', done: false },
    ],
  },
  {
    id: 'geo',
    name: 'GEO (Visibilité IA)',
    icon: Globe,
    color: 'cyan',
    features: [
      { id: 'geo-1', label: 'Suivi visibilité sur ChatGPT', done: false },
      { id: 'geo-2', label: 'Suivi visibilité sur Perplexity', done: false },
      { id: 'geo-3', label: 'Suivi visibilité sur Claude', done: false },
      { id: 'geo-4', label: 'Suivi visibilité sur Gemini', done: false },
      { id: 'geo-5', label: 'Score GEO par page', done: false },
      { id: 'geo-6', label: 'Requêtes de test personnalisées', done: false },
    ],
  },
  {
    id: 'automation',
    name: 'Automatisation',
    icon: Zap,
    color: 'orange',
    features: [
      { id: 'auto-1', label: 'Import automatique via n8n/Make', done: false },
      { id: 'auto-2', label: 'Rapports automatiques hebdo/mensuel', done: false },
      { id: 'auto-3', label: 'Envoi email automatique des rapports', done: false },
      { id: 'auto-4', label: 'Rafraîchissement PageSpeed automatique', done: false },
    ],
  },
  {
    id: 'multiproject',
    name: 'Multi-projets',
    icon: Users,
    color: 'slate',
    features: [
      { id: 'mp-1', label: 'Gestion de plusieurs sites/projets', done: false },
      { id: 'mp-2', label: 'Switch entre projets', done: false },
      { id: 'mp-3', label: 'KPIs consolidés multi-projets', done: false },
    ],
  },
]

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/30' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
  pink: { bg: 'bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/30' },
  red: { bg: 'bg-red-500/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/30' },
  indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30' },
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/30' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/30' },
  slate: { bg: 'bg-slate-500/20', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/30' },
}

const priorityBadge: Record<string, string> = {
  high: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  low: 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30',
}

export default function FeaturesPage() {
  const [categories] = useState<FeatureCategory[]>(initialCategories)
  const [filterStatus, setFilterStatus] = useState<'all' | 'done' | 'todo'>('all')
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  // Calculate stats
  const allFeatures = categories.flatMap((c) => c.features)
  const doneCount = allFeatures.filter((f) => f.done).length
  const todoCount = allFeatures.filter((f) => !f.done).length
  const highPriorityCount = allFeatures.filter((f) => !f.done && f.priority === 'high').length
  const progress = Math.round((doneCount / allFeatures.length) * 100)

  // Filter features
  const filteredCategories = categories.map((cat) => ({
    ...cat,
    features: cat.features.filter((f) => {
      if (filterStatus === 'done' && !f.done) return false
      if (filterStatus === 'todo' && f.done) return false
      if (filterPriority !== 'all' && f.priority !== filterPriority) return false
      return true
    }),
  })).filter((cat) => cat.features.length > 0)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Fonctionnalités</h1>
        <p className="text-muted-foreground">
          Checklist des fonctionnalités à intégrer sur OGS
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-foreground">{allFeatures.length}</div>
          <div className="text-sm text-muted-foreground">Total fonctionnalités</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{doneCount}</div>
          <div className="text-sm text-muted-foreground">Terminées</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{todoCount}</div>
          <div className="text-sm text-muted-foreground">À faire</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{highPriorityCount}</div>
          <div className="text-sm text-muted-foreground">Priorité haute</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progression globale</span>
          <span className="text-sm font-bold text-foreground">{progress}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Statut:</span>
          <div className="flex gap-1">
            {[
              { value: 'all', label: 'Tous' },
              { value: 'todo', label: 'À faire' },
              { value: 'done', label: 'Terminé' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value as typeof filterStatus)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  filterStatus === opt.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-card text-muted-foreground border-border hover:bg-accent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Priorité:</span>
          <div className="flex gap-1">
            {[
              { value: 'all', label: 'Toutes' },
              { value: 'high', label: 'Haute' },
              { value: 'medium', label: 'Moyenne' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterPriority(opt.value as typeof filterPriority)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  filterPriority === opt.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-card text-muted-foreground border-border hover:bg-accent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature categories */}
      <div className="space-y-6">
        {filteredCategories.map((category) => {
          const Icon = category.icon
          const colors = colorClasses[category.color]
          const catDone = category.features.filter((f) => f.done).length
          const catTotal = category.features.length

          return (
            <div key={category.id} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Category header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{category.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {catDone}/{catTotal} terminées
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${catDone === catTotal ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${(catDone / catTotal) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                    {Math.round((catDone / catTotal) * 100)}%
                  </span>
                </div>
              </div>

              {/* Features list */}
              <div className="p-4">
                <ul className="space-y-2">
                  {category.features.map((feature) => (
                    <li key={feature.id} className="flex items-start gap-3">
                      {feature.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-sm ${
                            feature.done ? 'text-muted-foreground line-through' : 'text-foreground'
                          }`}
                        >
                          {feature.label}
                        </span>
                        {feature.description && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({feature.description})
                          </span>
                        )}
                      </div>
                      {feature.priority && !feature.done && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${
                            priorityBadge[feature.priority]
                          }`}
                        >
                          {feature.priority === 'high' ? 'Haute' : feature.priority === 'medium' ? 'Moyenne' : 'Basse'}
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
