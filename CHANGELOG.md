# Changelog

Toutes les modifications notables de ce projet seront documentees dans ce fichier.

## [0.3.0] - 2024-12-30

### Added

#### Score SEO PageSpeed Insights
- Migration SQL (`supabase/migrations/005_seo_score.sql`) :
  - Colonnes : `seo_score`, `performance_score`, `accessibility_score`, `best_practices_score`, `pagespeed_analyzed_at`
  - Index sur `seo_score`
- API Route `/api/pagespeed` :
  - `POST` : Analyse les pages via Google PageSpeed Insights API
  - `GET` : Recupere les scores moyens
  - Support cle API optionnelle (`GOOGLE_PAGESPEED_API_KEY`)
  - Rate limiting (2s entre chaque requete)
- Composant `PageSpeedAnalyzer` sur le dashboard :
  - Affichage des 4 scores moyens (SEO, Performance, Accessibilite, Best Practices)
  - Bouton "Analyser" pour lancer l'analyse des pages
  - Indicateurs visuels colores (vert >= 90, jaune >= 50, rouge < 50)

### Changed
- Dashboard : nouvelle grille 3 colonnes (PageSpeed + Clics + Impressions)

---

## [0.2.0] - 2024-12-30

### Added

#### Base de données Supabase
- Script SQL de migration initial (`supabase/migrations/001_initial_schema.sql`)
- Tables : `pages`, `keywords`, `positions`, `alerts`
- Index pour optimisation des requêtes
- Trigger `updated_at` automatique sur `keywords`
- Row Level Security (RLS) avec policies pour utilisateurs authentifiés

#### Configuration shadcn/ui
- Installation et configuration de shadcn/ui avec Tailwind CSS v4
- Thème personnalisé : base **gray**, accent **blue**
- Font **Poppins** (300-700)
- Support **Light/Dark mode** avec next-themes

#### Composants UI
- `Button` - Boutons avec variantes (default, destructive, outline, secondary, ghost, link)
- `Card` - Cartes pour le dashboard
- `Input` - Champs de formulaire
- `Badge` - Badges de statut (+ variantes success, warning, info)
- `Table` - Tableaux de données
- `Tabs` - Onglets
- `Select` - Menus déroulants
- `Tooltip` - Infobulles
- `DropdownMenu` - Menus contextuels
- `Avatar` - Avatars utilisateur

#### Sidebar collapsible
- Sidebar déployée par défaut (224px) avec labels
- Mode réduit (64px) avec icônes uniquement
- Bouton toggle pour replier/déplier
- Tooltips en mode réduit uniquement
- Animation fluide (300ms)
- Avatar dropdown avec :
  - Informations utilisateur
  - Lien "Retour au Hub"
  - Sélecteur de thème (Clair/Sombre/Système)
  - Déconnexion

#### Thème global
- Variables CSS pour light et dark mode sur toutes les pages
- Remplacement des couleurs hardcodées (slate) par variables de thème
- Pages mises à jour : Dashboard, Keywords, Pages, Import, Alertes, Login

### Changed
- Couleur principale : `indigo` → `blue` pour cohérence
- Layout root : ajout du `ThemeProvider`
- Metadata : titre "OGS Hub - YouSchool"

## [0.1.0] - 2024-12-29

### Added
- Setup initial Next.js 16 + React 19 + TypeScript
- Authentification Supabase (login/logout)
- Structure de l'application OGS
- Pages : Dashboard, Keywords, Pages, Import, Alertes
- Navigation sidebar
- Déploiement Vercel
