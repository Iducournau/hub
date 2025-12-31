-- ============================================
-- FEATURES MANAGEMENT SYSTEM
-- Migration for hub-docs collaborative features
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cmo', 'cpo', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- RLS for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 2. FEATURE CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.feature_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'folder',
  color TEXT NOT NULL DEFAULT 'slate',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_categories_sort ON public.feature_categories(sort_order);

-- RLS for feature_categories
ALTER TABLE public.feature_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories" ON public.feature_categories
  FOR SELECT USING (true);

CREATE POLICY "Privileged users can manage categories" ON public.feature_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'cmo', 'cpo')
    )
  );

-- ============================================
-- 3. FEATURES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES public.feature_categories(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  target_date DATE,
  completed_date DATE,
  assigned_to TEXT,
  tags TEXT[] DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_features_category_id ON public.features(category_id);
CREATE INDEX IF NOT EXISTS idx_features_status ON public.features(status);
CREATE INDEX IF NOT EXISTS idx_features_priority ON public.features(priority);
CREATE INDEX IF NOT EXISTS idx_features_sort ON public.features(category_id, sort_order);

-- RLS for features
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read features" ON public.features
  FOR SELECT USING (true);

CREATE POLICY "Privileged users can insert features" ON public.features
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'cmo', 'cpo')
    )
  );

CREATE POLICY "Privileged users can update features" ON public.features
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'cmo', 'cpo')
    )
  );

CREATE POLICY "Privileged users can delete features" ON public.features
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'cmo', 'cpo')
    )
  );

-- ============================================
-- 4. FEATURE COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.feature_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_email TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_comments_feature ON public.feature_comments(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_comments_created ON public.feature_comments(created_at DESC);

-- RLS for feature_comments
ALTER TABLE public.feature_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.feature_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add comments" ON public.feature_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own comments" ON public.feature_comments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. FEATURE HISTORY TABLE (Audit Log)
-- ============================================
CREATE TABLE IF NOT EXISTS public.feature_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'status_changed', 'comment_added')),
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_history_feature ON public.feature_history(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_history_created ON public.feature_history(created_at DESC);

-- RLS for feature_history
ALTER TABLE public.feature_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read history" ON public.feature_history
  FOR SELECT USING (true);

CREATE POLICY "System can insert history" ON public.feature_history
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 6. TRIGGER: Update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_features_updated_at
  BEFORE UPDATE ON public.features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_categories_updated_at
  BEFORE UPDATE ON public.feature_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. SEED: Initial Categories
-- ============================================
INSERT INTO public.feature_categories (name, icon, color, sort_order) VALUES
  ('Gestion des données', 'database', 'blue', 1),
  ('Gestion des mots-clés', 'key', 'emerald', 2),
  ('Gestion des pages', 'file-text', 'purple', 3),
  ('Référentiel Formations', 'graduation-cap', 'amber', 4),
  ('Dashboard & Visualisation', 'bar-chart-3', 'pink', 5),
  ('Alertes & Notifications', 'alert-triangle', 'red', 6),
  ('Agents IA', 'bot', 'indigo', 7),
  ('GEO (Visibilité IA)', 'globe', 'cyan', 8),
  ('Automatisation', 'zap', 'orange', 9),
  ('Multi-projets', 'folder', 'slate', 10)
ON CONFLICT DO NOTHING;
