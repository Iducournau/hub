-- ============================================
-- OGS Hub - Historique des métriques pages
-- ============================================

-- Table pour stocker l'historique des métriques GSC par page
CREATE TABLE page_metrics_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  clicks INTEGER,
  impressions INTEGER,
  ctr DECIMAL(5,4),
  position DECIMAL(5,2),
  date DATE NOT NULL,
  source TEXT NOT NULL DEFAULT 'gsc'
);

-- Index pour requêtes par date
CREATE INDEX idx_page_metrics_date ON page_metrics_history(date);

-- Index pour requêtes par page et date
CREATE INDEX idx_page_metrics_page_date ON page_metrics_history(page_id, date);

-- Contrainte unique : un seul enregistrement par page/date/source
CREATE UNIQUE INDEX idx_page_metrics_unique ON page_metrics_history(page_id, date, source);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE page_metrics_history ENABLE ROW LEVEL SECURITY;

-- Policies pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can read page_metrics_history"
  ON page_metrics_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert page_metrics_history"
  ON page_metrics_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update page_metrics_history"
  ON page_metrics_history FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete page_metrics_history"
  ON page_metrics_history FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- Commentaires
-- ============================================
COMMENT ON TABLE page_metrics_history IS 'Historique des métriques GSC par page pour analyse temporelle';
COMMENT ON COLUMN page_metrics_history.date IS 'Date de la mesure (jour de l''import GSC)';
COMMENT ON COLUMN page_metrics_history.source IS 'Source des données (gsc, semrush, etc.)';
