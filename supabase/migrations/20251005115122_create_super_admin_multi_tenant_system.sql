/*
  # Système Super-Admin Multi-Entreprises (SaaS)

  ## Description
  Ce système permet à un super-administrateur de gérer plusieurs entreprises clientes,
  chacune avec ses propres modules activés, quotas d'utilisateurs et limitations.

  ## 1. Tables créées
    - `super_admins` : Liste des super-administrateurs de la plateforme
    - `subscription_plans` : Plans d'abonnement disponibles (Starter, Business, Enterprise)
    - `company_subscriptions` : Abonnement et configuration de chaque entreprise
    - `company_modules` : Modules activés par entreprise
    - `company_usage` : Suivi de l'utilisation (nb utilisateurs, documents, stockage)

  ## 2. Modules disponibles
    - dashboard : Tableau de bord
    - quotes : Devis
    - invoices : Factures
    - credits : Avoirs
    - articles : Articles/Produits
    - clients : Clients
    - equipment : Équipements
    - rentals : Locations
    - settings : Paramètres
    - emails : Gestion des emails
    - users : Gestion des utilisateurs (module premium)

  ## 3. Plans par défaut
    - Free : 1 utilisateur, modules basiques
    - Starter : 3 utilisateurs, modules essentiels
    - Business : 10 utilisateurs, tous les modules
    - Enterprise : Utilisateurs illimités, support dédié

  ## 4. Sécurité
    - RLS activé sur toutes les tables
    - Seuls les super-admins peuvent gérer les entreprises
    - Chaque entreprise est isolée des autres
*/

-- Table des super-administrateurs de la plateforme
CREATE TABLE IF NOT EXISTS super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Table des plans d'abonnement
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  max_users integer NOT NULL DEFAULT 1,
  max_documents_per_month integer,
  max_storage_mb integer,
  price_monthly numeric(10,2),
  price_yearly numeric(10,2),
  is_custom boolean DEFAULT false,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Table des abonnements et configurations par entreprise
CREATE TABLE IF NOT EXISTS company_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  plan_id uuid REFERENCES subscription_plans(id),
  custom_max_users integer,
  custom_max_documents integer,
  custom_max_storage_mb integer,
  is_active boolean DEFAULT true,
  trial_ends_at timestamptz,
  subscription_starts_at timestamptz DEFAULT now(),
  subscription_ends_at timestamptz,
  notes text,
  created_by uuid REFERENCES super_admins(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des modules activés par entreprise
CREATE TABLE IF NOT EXISTS company_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  module_name text NOT NULL,
  is_enabled boolean DEFAULT true,
  enabled_at timestamptz DEFAULT now(),
  enabled_by uuid REFERENCES super_admins(id),
  UNIQUE(company_id, module_name),
  CHECK (module_name IN ('dashboard', 'quotes', 'invoices', 'credits', 'articles', 'clients', 'equipment', 'rentals', 'settings', 'emails', 'users', 'maintenance'))
);

-- Table de suivi de l'utilisation par entreprise
CREATE TABLE IF NOT EXISTS company_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  current_users_count integer DEFAULT 0,
  current_documents_count integer DEFAULT 0,
  current_storage_mb numeric(10,2) DEFAULT 0,
  documents_this_month integer DEFAULT 0,
  last_reset_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_usage ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour super_admins
CREATE POLICY "Les super-admins peuvent voir leur propre profil"
  ON super_admins FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Les super-admins peuvent voir tous les super-admins"
  ON super_admins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.is_active = true
    )
  );

CREATE POLICY "Les super-admins peuvent créer d'autres super-admins"
  ON super_admins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.is_active = true
    )
  );

CREATE POLICY "Les super-admins peuvent modifier les super-admins"
  ON super_admins FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.is_active = true
    )
  );

-- Politiques RLS pour subscription_plans
CREATE POLICY "Les super-admins peuvent voir les plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.is_active = true
    )
  );

CREATE POLICY "Les super-admins peuvent gérer les plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.is_active = true
    )
  );

-- Politiques RLS pour company_subscriptions
CREATE POLICY "Les super-admins peuvent voir tous les abonnements"
  ON company_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.is_active = true
    )
  );

CREATE POLICY "Les super-admins peuvent gérer les abonnements"
  ON company_subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.is_active = true
    )
  );

-- Politiques RLS pour company_modules
CREATE POLICY "Les super-admins peuvent voir tous les modules"
  ON company_modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.is_active = true
    )
  );

CREATE POLICY "Les super-admins peuvent gérer les modules"
  ON company_modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.is_active = true
    )
  );

-- Politiques RLS pour company_usage
CREATE POLICY "Les super-admins peuvent voir l'utilisation"
  ON company_usage FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.is_active = true
    )
  );

CREATE POLICY "Les super-admins peuvent modifier l'utilisation"
  ON company_usage FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.is_active = true
    )
  );

-- Insérer les plans par défaut
INSERT INTO subscription_plans (name, display_name, description, max_users, max_documents_per_month, max_storage_mb, price_monthly, price_yearly, features) VALUES
  (
    'free',
    'Gratuit',
    'Parfait pour tester l''application',
    1,
    50,
    100,
    0,
    0,
    '["1 utilisateur", "50 documents/mois", "100 MB de stockage", "Support par email"]'::jsonb
  ),
  (
    'starter',
    'Starter',
    'Pour les petites entreprises',
    3,
    200,
    500,
    29.99,
    299.90,
    '["3 utilisateurs", "200 documents/mois", "500 MB de stockage", "Support prioritaire", "Tous les modules sauf équipements"]'::jsonb
  ),
  (
    'business',
    'Business',
    'Pour les entreprises en croissance',
    10,
    1000,
    2000,
    79.99,
    799.90,
    '["10 utilisateurs", "1000 documents/mois", "2 GB de stockage", "Support prioritaire", "Tous les modules", "API accès"]'::jsonb
  ),
  (
    'enterprise',
    'Enterprise',
    'Sur mesure pour grandes entreprises',
    999,
    NULL,
    NULL,
    NULL,
    NULL,
    '["Utilisateurs illimités", "Documents illimités", "Stockage illimité", "Support dédié 24/7", "Tous les modules", "API accès", "Formation personnalisée"]'::jsonb
  ),
  (
    'custom',
    'Personnalisé',
    'Plan sur mesure',
    1,
    NULL,
    NULL,
    NULL,
    NULL,
    '[]'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

-- Fonction pour mettre à jour automatiquement company_usage
CREATE OR REPLACE FUNCTION update_company_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le nombre d'utilisateurs
  UPDATE company_usage
  SET 
    current_users_count = (
      SELECT COUNT(*) FROM app_users 
      WHERE company_id = NEW.company_id 
      AND is_active = true
    ),
    updated_at = now()
  WHERE company_id = NEW.company_id;
  
  -- Créer l'entrée si elle n'existe pas
  IF NOT FOUND THEN
    INSERT INTO company_usage (company_id, current_users_count)
    VALUES (NEW.company_id, 1)
    ON CONFLICT (company_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ajouter company_id à app_users si ce n'est pas déjà fait
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_users' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE app_users ADD COLUMN company_id uuid REFERENCES companies(id);
  END IF;
END $$;

-- Trigger pour mettre à jour automatiquement l'utilisation
DROP TRIGGER IF EXISTS trigger_update_company_usage ON app_users;
CREATE TRIGGER trigger_update_company_usage
AFTER INSERT OR UPDATE OR DELETE ON app_users
FOR EACH ROW
EXECUTE FUNCTION update_company_usage();

-- Fonction pour vérifier si une entreprise a dépassé ses quotas
CREATE OR REPLACE FUNCTION check_company_quota(
  p_company_id uuid,
  p_quota_type text
)
RETURNS boolean AS $$
DECLARE
  v_current_count integer;
  v_max_allowed integer;
BEGIN
  -- Récupérer les quotas
  SELECT 
    CASE p_quota_type
      WHEN 'users' THEN 
        COALESCE(cs.custom_max_users, sp.max_users)
      WHEN 'documents' THEN 
        COALESCE(cs.custom_max_documents, sp.max_documents_per_month)
      ELSE 0
    END,
    CASE p_quota_type
      WHEN 'users' THEN cu.current_users_count
      WHEN 'documents' THEN cu.documents_this_month
      ELSE 0
    END
  INTO v_max_allowed, v_current_count
  FROM company_subscriptions cs
  JOIN subscription_plans sp ON cs.plan_id = sp.id
  LEFT JOIN company_usage cu ON cs.company_id = cu.company_id
  WHERE cs.company_id = p_company_id;
  
  -- Si pas de limite (NULL), toujours autoriser
  IF v_max_allowed IS NULL THEN
    RETURN true;
  END IF;
  
  -- Vérifier si sous la limite
  RETURN COALESCE(v_current_count, 0) < v_max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
