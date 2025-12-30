-- ============================================
-- OGS Hub - Schema initial
-- ============================================

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: pages
-- Stocke les URLs/pages du site à tracker
-- ============================================
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide par URL
CREATE INDEX idx_pages_url ON pages(url);
CREATE INDEX idx_pages_status ON pages(status);

-- ============================================
-- Table: keywords
-- Stocke les mots-clés SEO à tracker
-- ============================================
CREATE TYPE keyword_priority AS ENUM ('P0', 'P1', 'P2', 'P3');

CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  priority keyword_priority,
  intent TEXT,
  volume INTEGER,
  difficulty INTEGER,
  assigned_page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche et filtrage
CREATE INDEX idx_keywords_keyword ON keywords(keyword);
CREATE INDEX idx_keywords_priority ON keywords(priority);
CREATE INDEX idx_keywords_assigned_page ON keywords(assigned_page_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_keywords_updated_at
  BEFORE UPDATE ON keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: positions
-- Historique des positions pour chaque mot-clé
-- ============================================
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  position INTEGER,
  clicks INTEGER,
  impressions INTEGER,
  ctr DECIMAL(5,4),
  date DATE NOT NULL,
  source TEXT NOT NULL DEFAULT 'gsc'
);

-- Index pour requêtes par date et keyword
CREATE INDEX idx_positions_keyword_id ON positions(keyword_id);
CREATE INDEX idx_positions_date ON positions(date);
CREATE INDEX idx_positions_keyword_date ON positions(keyword_id, date);

-- Contrainte unique : un seul enregistrement par keyword/date/source
CREATE UNIQUE INDEX idx_positions_unique ON positions(keyword_id, date, source);

-- ============================================
-- Table: alerts
-- Alertes SEO générées par le système
-- ============================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour filtrage des alertes
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Policies pour utilisateurs authentifiés (accès complet pour MVP)
-- À affiner plus tard avec des rôles/projets

CREATE POLICY "Authenticated users can read pages"
  ON pages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert pages"
  ON pages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pages"
  ON pages FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete pages"
  ON pages FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read keywords"
  ON keywords FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert keywords"
  ON keywords FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update keywords"
  ON keywords FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete keywords"
  ON keywords FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read positions"
  ON positions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert positions"
  ON positions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update positions"
  ON positions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete positions"
  ON positions FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert alerts"
  ON alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete alerts"
  ON alerts FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- Commentaires sur les tables
-- ============================================
COMMENT ON TABLE pages IS 'Pages/URLs du site YouSchool à tracker pour le SEO';
COMMENT ON TABLE keywords IS 'Mots-clés SEO avec leurs métriques et assignation aux pages';
COMMENT ON TABLE positions IS 'Historique des positions dans les SERPs (Google Search Console, SEMrush)';
COMMENT ON TABLE alerts IS 'Alertes SEO : chutes de position, cannibalisation, opportunités';
