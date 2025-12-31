-- ============================================
-- COCKPIT PROJECTS SYSTEM
-- Multi-project management with permissions
-- ============================================

-- ============================================
-- 1. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'rocket',
  color TEXT DEFAULT 'indigo',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- ============================================
-- 2. PROJECT MEMBERS TABLE (Permissions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);

-- ============================================
-- 3. ALTER FEATURES TABLE (add project_id)
-- ============================================
ALTER TABLE public.features
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id);

CREATE INDEX IF NOT EXISTS idx_features_project ON public.features(project_id);

-- ============================================
-- 4. ALTER FEATURE_CATEGORIES TABLE (add project_id)
-- ============================================
ALTER TABLE public.feature_categories
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id);

CREATE INDEX IF NOT EXISTS idx_feature_categories_project ON public.feature_categories(project_id);

-- ============================================
-- 5. RLS POLICIES FOR PROJECTS
-- ============================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can see projects they are members of
CREATE POLICY "Users see their projects" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

-- Owners and admins can update projects
CREATE POLICY "Admins can update projects" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Only owners can delete projects
CREATE POLICY "Owners can delete projects" ON public.projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Authenticated users can create projects
CREATE POLICY "Authenticated users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 6. RLS POLICIES FOR PROJECT_MEMBERS
-- ============================================
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Users can see members of their projects
CREATE POLICY "Users see project members" ON public.project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()
    )
  );

-- Owners and admins can manage members
CREATE POLICY "Admins can manage members" ON public.project_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- 7. UPDATE FEATURES RLS (add project check)
-- ============================================
-- Drop existing policies first
DROP POLICY IF EXISTS "Privileged users can insert features" ON public.features;
DROP POLICY IF EXISTS "Privileged users can update features" ON public.features;
DROP POLICY IF EXISTS "Privileged users can delete features" ON public.features;

-- New policies with project membership check
CREATE POLICY "Project members can insert features" ON public.features
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = features.project_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Project members can update features" ON public.features
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = features.project_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Project admins can delete features" ON public.features
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = features.project_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- 8. TRIGGER: Auto-update updated_at
-- ============================================
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. SEED: Initial "Hub" project
-- ============================================
INSERT INTO public.projects (slug, name, description, icon, color)
VALUES ('hub', 'Hub', 'Plateforme de dashboards webmarketing YouSchool', 'rocket', 'indigo')
ON CONFLICT (slug) DO NOTHING;

-- Link existing features to Hub project
UPDATE public.features
SET project_id = (SELECT id FROM public.projects WHERE slug = 'hub')
WHERE project_id IS NULL;

-- Link existing categories to Hub project
UPDATE public.feature_categories
SET project_id = (SELECT id FROM public.projects WHERE slug = 'hub')
WHERE project_id IS NULL;
