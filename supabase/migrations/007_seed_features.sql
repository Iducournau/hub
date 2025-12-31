-- ============================================
-- SEED: Initial Features Data
-- Migration des 69 fonctionnalités existantes
-- ============================================

-- Helper: Get category ID by name
CREATE OR REPLACE FUNCTION get_category_id(cat_name TEXT) RETURNS UUID AS $$
  SELECT id FROM public.feature_categories WHERE name = cat_name LIMIT 1;
$$ LANGUAGE sql;

-- ============================================
-- Gestion des données (7 features)
-- ============================================
INSERT INTO public.features (name, category_id, status, priority, sort_order) VALUES
  ('Import CSV Google Search Console', get_category_id('Gestion des données'), 'done', 'high', 1),
  ('Import CSV SEMrush', get_category_id('Gestion des données'), 'todo', 'high', 2),
  ('Import CSV Screaming Frog', get_category_id('Gestion des données'), 'todo', 'medium', 3),
  ('Connexion API Google Search Console', get_category_id('Gestion des données'), 'todo', 'medium', 4),
  ('Synchronisation automatique des données', get_category_id('Gestion des données'), 'todo', 'low', 5),
  ('Historique des imports', get_category_id('Gestion des données'), 'todo', 'low', 6),
  ('Export des données (CSV, Excel)', get_category_id('Gestion des données'), 'todo', 'low', 7);

-- ============================================
-- Gestion des mots-clés (10 features)
-- ============================================
INSERT INTO public.features (name, category_id, status, priority, sort_order) VALUES
  ('Liste des mots-clés avec filtres', get_category_id('Gestion des mots-clés'), 'done', 'high', 1),
  ('Pagination et tri', get_category_id('Gestion des mots-clés'), 'done', 'high', 2),
  ('Assignation page cible par mot-clé', get_category_id('Gestion des mots-clés'), 'todo', 'high', 3),
  ('Gestion des clusters thématiques', get_category_id('Gestion des mots-clés'), 'todo', 'medium', 4),
  ('Priorités (P0, P1, P2, P3)', get_category_id('Gestion des mots-clés'), 'todo', 'high', 5),
  ('Objectif de position (Top3, Top10...)', get_category_id('Gestion des mots-clés'), 'todo', 'low', 6),
  ('Historique des positions', get_category_id('Gestion des mots-clés'), 'todo', 'high', 7),
  ('Détection des mots-clés orphelins', get_category_id('Gestion des mots-clés'), 'todo', 'medium', 8),
  ('Détection des cannibalisations', get_category_id('Gestion des mots-clés'), 'todo', 'high', 9),
  ('Notes et actions par mot-clé', get_category_id('Gestion des mots-clés'), 'todo', 'low', 10);

-- ============================================
-- Gestion des pages (8 features)
-- ============================================
INSERT INTO public.features (name, category_id, status, priority, sort_order) VALUES
  ('Liste des pages avec filtres', get_category_id('Gestion des pages'), 'done', 'high', 1),
  ('Scores PageSpeed (Performance, SEO, Accessibilité, Best Practices)', get_category_id('Gestion des pages'), 'done', 'high', 2),
  ('Catégorisation des pages (Formation, Blog, etc.)', get_category_id('Gestion des pages'), 'todo', 'medium', 3),
  ('Statut des pages (Publié, Brouillon, À créer)', get_category_id('Gestion des pages'), 'todo', 'medium', 4),
  ('Analyse des balises (title, meta, H1)', get_category_id('Gestion des pages'), 'todo', 'medium', 5),
  ('Comptage des mots', get_category_id('Gestion des pages'), 'todo', 'low', 6),
  ('Maillage interne (liens entrants/sortants)', get_category_id('Gestion des pages'), 'todo', 'medium', 7),
  ('Profondeur dans l''arborescence', get_category_id('Gestion des pages'), 'todo', 'low', 8);

-- ============================================
-- Référentiel Formations (6 features)
-- ============================================
INSERT INTO public.features (name, category_id, status, priority, sort_order) VALUES
  ('Table des formations YouSchool', get_category_id('Référentiel Formations'), 'todo', 'high', 1),
  ('Lien formations ↔ mots-clés', get_category_id('Référentiel Formations'), 'todo', 'high', 2),
  ('Lien formations ↔ pages', get_category_id('Référentiel Formations'), 'todo', 'medium', 3),
  ('Vue par formation (tous les KW/pages associés)', get_category_id('Référentiel Formations'), 'todo', 'medium', 4),
  ('KPIs par formation', get_category_id('Référentiel Formations'), 'todo', 'medium', 5),
  ('Priorité par formation', get_category_id('Référentiel Formations'), 'todo', 'low', 6);

-- ============================================
-- Dashboard & Visualisation (7 features)
-- ============================================
INSERT INTO public.features (name, category_id, status, priority, sort_order) VALUES
  ('KPIs globaux (Top3, Top10, Quick Wins...)', get_category_id('Dashboard & Visualisation'), 'done', 'high', 1),
  ('Comparateur de périodes', get_category_id('Dashboard & Visualisation'), 'done', 'high', 2),
  ('Prédictions de tendances', get_category_id('Dashboard & Visualisation'), 'done', 'high', 3),
  ('Graphiques d''évolution des positions', get_category_id('Dashboard & Visualisation'), 'todo', 'high', 4),
  ('Répartition par cluster', get_category_id('Dashboard & Visualisation'), 'todo', 'medium', 5),
  ('Répartition par formation', get_category_id('Dashboard & Visualisation'), 'todo', 'medium', 6),
  ('Vue Quick Wins prioritaires', get_category_id('Dashboard & Visualisation'), 'todo', 'medium', 7);

-- ============================================
-- Alertes & Notifications (8 features)
-- ============================================
INSERT INTO public.features (name, category_id, status, priority, sort_order) VALUES
  ('Génération automatique des alertes', get_category_id('Alertes & Notifications'), 'todo', 'high', 1),
  ('Alerte baisse de position significative', get_category_id('Alertes & Notifications'), 'todo', 'medium', 2),
  ('Alerte Quick Wins détectés', get_category_id('Alertes & Notifications'), 'todo', 'medium', 3),
  ('Alerte cannibalisations', get_category_id('Alertes & Notifications'), 'todo', 'medium', 4),
  ('Alerte mots-clés orphelins', get_category_id('Alertes & Notifications'), 'todo', 'medium', 5),
  ('Alerte mots-clés non travaillés >30j', get_category_id('Alertes & Notifications'), 'todo', 'medium', 6),
  ('Interface résoudre/ignorer alertes', get_category_id('Alertes & Notifications'), 'todo', 'medium', 7),
  ('Notifications email', get_category_id('Alertes & Notifications'), 'todo', 'low', 8);

-- ============================================
-- Agents IA (8 features)
-- ============================================
INSERT INTO public.features (name, description, category_id, status, priority, sort_order) VALUES
  ('Agent Analyste (rapport hebdo)', NULL, get_category_id('Agents IA'), 'todo', 'medium', 1),
  ('Agent Rapports (génération auto)', NULL, get_category_id('Agents IA'), 'todo', 'low', 2),
  ('Agent Stratège (recommandations)', NULL, get_category_id('Agents IA'), 'todo', 'medium', 3),
  ('Agent Intent Matcher (alignement intention)', 'Priorité CMO', get_category_id('Agents IA'), 'todo', 'high', 4),
  ('Agent GEO Auditor (score GEO, E-E-A-T)', 'Priorité CMO', get_category_id('Agents IA'), 'todo', 'high', 5),
  ('Agent Meta Writer (génération title/meta)', NULL, get_category_id('Agents IA'), 'todo', 'medium', 6),
  ('Agent Trend Predictor (prédiction positions)', 'Priorité CMO', get_category_id('Agents IA'), 'todo', 'high', 7),
  ('Agent Content Optimizer (analyse vs SERP)', NULL, get_category_id('Agents IA'), 'todo', 'medium', 8);

-- ============================================
-- GEO (Visibilité IA) (6 features)
-- ============================================
INSERT INTO public.features (name, category_id, status, priority, sort_order) VALUES
  ('Suivi visibilité sur ChatGPT', get_category_id('GEO (Visibilité IA)'), 'todo', 'medium', 1),
  ('Suivi visibilité sur Perplexity', get_category_id('GEO (Visibilité IA)'), 'todo', 'medium', 2),
  ('Suivi visibilité sur Claude', get_category_id('GEO (Visibilité IA)'), 'todo', 'medium', 3),
  ('Suivi visibilité sur Gemini', get_category_id('GEO (Visibilité IA)'), 'todo', 'medium', 4),
  ('Score GEO par page', get_category_id('GEO (Visibilité IA)'), 'todo', 'medium', 5),
  ('Requêtes de test personnalisées', get_category_id('GEO (Visibilité IA)'), 'todo', 'low', 6);

-- ============================================
-- Automatisation (4 features)
-- ============================================
INSERT INTO public.features (name, category_id, status, priority, sort_order) VALUES
  ('Import automatique via n8n/Make', get_category_id('Automatisation'), 'todo', 'medium', 1),
  ('Rapports automatiques hebdo/mensuel', get_category_id('Automatisation'), 'todo', 'medium', 2),
  ('Envoi email automatique des rapports', get_category_id('Automatisation'), 'todo', 'low', 3),
  ('Rafraîchissement PageSpeed automatique', get_category_id('Automatisation'), 'todo', 'low', 4);

-- ============================================
-- Multi-projets (3 features)
-- ============================================
INSERT INTO public.features (name, category_id, status, priority, sort_order) VALUES
  ('Gestion de plusieurs sites/projets', get_category_id('Multi-projets'), 'todo', 'low', 1),
  ('Switch entre projets', get_category_id('Multi-projets'), 'todo', 'low', 2),
  ('KPIs consolidés multi-projets', get_category_id('Multi-projets'), 'todo', 'low', 3);

-- Cleanup helper function
DROP FUNCTION IF EXISTS get_category_id(TEXT);
