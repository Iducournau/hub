-- ============================================
-- OGS Hub - Score SEO PageSpeed Insights
-- ============================================

-- Ajouter les colonnes de score PageSpeed à la table pages
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS seo_score INTEGER,
ADD COLUMN IF NOT EXISTS performance_score INTEGER,
ADD COLUMN IF NOT EXISTS accessibility_score INTEGER,
ADD COLUMN IF NOT EXISTS best_practices_score INTEGER,
ADD COLUMN IF NOT EXISTS pagespeed_analyzed_at TIMESTAMPTZ;

-- Index pour filtrer par score SEO
CREATE INDEX IF NOT EXISTS idx_pages_seo_score ON pages(seo_score DESC);

-- Commentaires
COMMENT ON COLUMN pages.seo_score IS 'Score SEO PageSpeed Insights (0-100)';
COMMENT ON COLUMN pages.performance_score IS 'Score Performance PageSpeed Insights (0-100)';
COMMENT ON COLUMN pages.accessibility_score IS 'Score Accessibilité PageSpeed Insights (0-100)';
COMMENT ON COLUMN pages.best_practices_score IS 'Score Best Practices PageSpeed Insights (0-100)';
COMMENT ON COLUMN pages.pagespeed_analyzed_at IS 'Date de la dernière analyse PageSpeed';
