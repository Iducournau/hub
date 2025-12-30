-- ============================================
-- OGS Hub - Formation et évolution de position
-- ============================================

-- Ajouter la colonne formation aux pages
-- (extraite automatiquement de l'URL)
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS formation TEXT;

-- Ajouter previous_position pour calculer le delta
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS previous_position DECIMAL(5,2);

-- Index pour filtrer par formation
CREATE INDEX IF NOT EXISTS idx_pages_formation ON pages(formation);

-- Fonction pour extraire la formation depuis l'URL
-- Extrait le premier segment de chemin après le domaine
-- Ex: https://www.youschool.fr/cap-petite-enfance/inscription -> "cap-petite-enfance"
CREATE OR REPLACE FUNCTION extract_formation_from_url(url TEXT)
RETURNS TEXT AS $$
DECLARE
  path_segments TEXT[];
  formation TEXT;
BEGIN
  -- Extraire le chemin de l'URL
  path_segments := regexp_split_to_array(
    regexp_replace(url, '^https?://[^/]+/?', ''),
    '/'
  );

  -- Le premier segment non-vide est la formation
  IF array_length(path_segments, 1) > 0 AND path_segments[1] != '' THEN
    formation := path_segments[1];
  ELSE
    formation := NULL;
  END IF;

  RETURN formation;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Mettre à jour les pages existantes avec leur formation
UPDATE pages
SET formation = extract_formation_from_url(url)
WHERE formation IS NULL;

-- Trigger pour extraire automatiquement la formation lors de l'insertion
CREATE OR REPLACE FUNCTION set_formation_from_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.formation IS NULL THEN
    NEW.formation := extract_formation_from_url(NEW.url);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_formation ON pages;
CREATE TRIGGER trigger_set_formation
  BEFORE INSERT OR UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION set_formation_from_url();

-- Commenter les nouvelles colonnes
COMMENT ON COLUMN pages.formation IS 'Formation extraite de l''URL (cap-petite-enfance, cap-patisserie, etc.)';
COMMENT ON COLUMN pages.previous_position IS 'Position précédente pour calculer l''évolution';
