-- ============================================
-- Migration: Ajout des métriques GSC aux pages
-- ============================================

-- Ajouter les colonnes de métriques GSC
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS clicks INTEGER,
ADD COLUMN IF NOT EXISTS impressions INTEGER,
ADD COLUMN IF NOT EXISTS ctr DECIMAL(5,4),
ADD COLUMN IF NOT EXISTS position DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS gsc_date DATE;

-- Index pour les recherches par métriques
CREATE INDEX IF NOT EXISTS idx_pages_clicks ON pages(clicks DESC);
CREATE INDEX IF NOT EXISTS idx_pages_position ON pages(position);

-- Commentaires
COMMENT ON COLUMN pages.clicks IS 'Clics GSC';
COMMENT ON COLUMN pages.impressions IS 'Impressions GSC';
COMMENT ON COLUMN pages.ctr IS 'Click-through rate GSC (0-1)';
COMMENT ON COLUMN pages.position IS 'Position moyenne GSC';
COMMENT ON COLUMN pages.gsc_date IS 'Date des dernières données GSC';
