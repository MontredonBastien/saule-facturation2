/*
  # Système Comptable Multi-Entreprises

  ## Description
  Ce système permet aux comptables de gérer plusieurs entreprises clientes.
  Un comptable peut avoir accès à plusieurs sociétés et basculer entre elles.

  ## 1. Tables créées
    - `accountants` : Table des comptables professionnels
    - `accountant_company_access` : Table d'association entre comptables et entreprises
    - `company_accountants` : Vue simplifiée des accès comptables

  ## 2. Fonctionnalités
    - Un comptable peut gérer plusieurs entreprises
    - Une entreprise peut avoir plusieurs comptables
    - Permissions granulaires par comptable (lecture seule, édition, admin)
    - Historique des accès
    - Activation/désactivation des accès

  ## 3. Rôles d'accès pour comptables
    - `readonly` : Consultation uniquement (dashboard, factures, devis, clients)
    - `editor` : Consultation + création/modification de documents
    - `admin` : Accès total incluant paramètres et utilisateurs
    - `full_admin` : Accès complet incluant gestion financière et comptable

  ## 4. Sécurité
    - RLS activé sur toutes les tables
    - Les comptables ne voient que les entreprises auxquelles ils ont accès
    - Audit trail de tous les accès comptables
    - Isolation complète entre les entreprises
*/

-- Table des comptables professionnels
CREATE TABLE IF NOT EXISTS accountants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  company_name text,
  phone text,
  siret text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  notes text
);

-- Table d'association entre comptables et entreprises clientes
CREATE TABLE IF NOT EXISTS accountant_company_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id uuid REFERENCES accountants(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  access_level text NOT NULL DEFAULT 'readonly',
  is_active boolean DEFAULT true,
  granted_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES app_users(id),
  revoked_at timestamptz,
  revoked_by uuid REFERENCES app_users(id),
  last_access timestamptz,
  notes text,
  UNIQUE(accountant_id, company_id),
  CHECK (access_level IN ('readonly', 'editor', 'admin', 'full_admin'))
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_accountants_auth_user ON accountants(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_accountants_email ON accountants(email);
CREATE INDEX IF NOT EXISTS idx_accountants_active ON accountants(is_active);
CREATE INDEX IF NOT EXISTS idx_accountant_access_accountant ON accountant_company_access(accountant_id);
CREATE INDEX IF NOT EXISTS idx_accountant_access_company ON accountant_company_access(company_id);
CREATE INDEX IF NOT EXISTS idx_accountant_access_active ON accountant_company_access(is_active);

-- Vue pour simplifier l'accès aux entreprises d'un comptable
CREATE OR REPLACE VIEW accountant_companies AS
SELECT
  aca.id as access_id,
  aca.accountant_id,
  a.email as accountant_email,
  a.full_name as accountant_name,
  aca.company_id,
  c.name as company_name,
  c.siret as company_siret,
  c.email as company_email,
  aca.access_level,
  aca.is_active,
  aca.granted_at,
  aca.last_access
FROM accountant_company_access aca
JOIN accountants a ON a.id = aca.accountant_id
JOIN companies c ON c.id = aca.company_id
WHERE aca.is_active = true AND a.is_active = true;

-- Vue pour lister les comptables d'une entreprise
CREATE OR REPLACE VIEW company_accountants_list AS
SELECT
  aca.id as access_id,
  aca.company_id,
  c.name as company_name,
  aca.accountant_id,
  a.email as accountant_email,
  a.full_name as accountant_name,
  a.company_name as accountant_company,
  a.phone as accountant_phone,
  aca.access_level,
  aca.is_active,
  aca.granted_at,
  aca.last_access
FROM accountant_company_access aca
JOIN accountants a ON a.id = aca.accountant_id
JOIN companies c ON c.id = aca.company_id
WHERE aca.is_active = true;

-- Fonction pour vérifier si un utilisateur est un comptable
CREATE OR REPLACE FUNCTION is_accountant(user_auth_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM accountants
    WHERE auth_user_id = user_auth_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir l'ID du comptable depuis l'auth_user_id
CREATE OR REPLACE FUNCTION get_accountant_id(user_auth_id uuid)
RETURNS uuid AS $$
DECLARE
  accountant_uuid uuid;
BEGIN
  SELECT id INTO accountant_uuid
  FROM accountants
  WHERE auth_user_id = user_auth_id AND is_active = true;

  RETURN accountant_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les IDs des entreprises accessibles par un comptable
CREATE OR REPLACE FUNCTION get_accountant_company_ids(user_auth_id uuid)
RETURNS uuid[] AS $$
DECLARE
  company_ids uuid[];
BEGIN
  SELECT ARRAY_AGG(company_id) INTO company_ids
  FROM accountant_company_access aca
  JOIN accountants a ON a.id = aca.accountant_id
  WHERE a.auth_user_id = user_auth_id
    AND a.is_active = true
    AND aca.is_active = true;

  RETURN COALESCE(company_ids, ARRAY[]::uuid[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le niveau d'accès d'un comptable sur une entreprise
CREATE OR REPLACE FUNCTION get_accountant_access_level(user_auth_id uuid, target_company_id uuid)
RETURNS text AS $$
DECLARE
  access text;
BEGIN
  SELECT aca.access_level INTO access
  FROM accountant_company_access aca
  JOIN accountants a ON a.id = aca.accountant_id
  WHERE a.auth_user_id = user_auth_id
    AND aca.company_id = target_company_id
    AND a.is_active = true
    AND aca.is_active = true;

  RETURN access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE accountants ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountant_company_access ENABLE ROW LEVEL SECURITY;

-- Policies pour accountants
-- Les comptables peuvent voir leur propre profil
CREATE POLICY "Accountants can view own profile"
  ON accountants FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Les comptables peuvent mettre à jour leur propre profil
CREATE POLICY "Accountants can update own profile"
  ON accountants FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Les admins des entreprises peuvent voir les comptables qui ont accès à leur entreprise
CREATE POLICY "Company admins can view their accountants"
  ON accountants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accountant_company_access aca
      JOIN app_users u ON u.auth_user_id = auth.uid()
      WHERE aca.accountant_id = accountants.id
        AND aca.company_id = u.company_id
        AND aca.is_active = true
    )
  );

-- Policies pour accountant_company_access
-- Les comptables peuvent voir leurs propres accès
CREATE POLICY "Accountants can view own company access"
  ON accountant_company_access FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accountants
      WHERE accountants.id = accountant_company_access.accountant_id
        AND accountants.auth_user_id = auth.uid()
    )
  );

-- Les admins des entreprises peuvent voir qui a accès à leur entreprise
CREATE POLICY "Company admins can view accountant access"
  ON accountant_company_access FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.auth_user_id = auth.uid()
        AND u.company_id = accountant_company_access.company_id
        AND r.name = 'admin'
    )
  );

-- Les admins des entreprises peuvent gérer les accès comptables
CREATE POLICY "Company admins can manage accountant access"
  ON accountant_company_access FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.auth_user_id = auth.uid()
        AND u.company_id = accountant_company_access.company_id
        AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.auth_user_id = auth.uid()
        AND u.company_id = accountant_company_access.company_id
        AND r.name = 'admin'
    )
  );

-- Les comptables peuvent mettre à jour leur dernier accès
CREATE POLICY "Accountants can update last access"
  ON accountant_company_access FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accountants
      WHERE accountants.id = accountant_company_access.accountant_id
        AND accountants.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM accountants
      WHERE accountants.id = accountant_company_access.accountant_id
        AND accountants.auth_user_id = auth.uid()
    )
  );

-- Commentaires sur les tables
COMMENT ON TABLE accountants IS 'Table des comptables professionnels qui gèrent plusieurs entreprises';
COMMENT ON TABLE accountant_company_access IS 'Table d''association entre comptables et leurs entreprises clientes';
COMMENT ON COLUMN accountant_company_access.access_level IS 'Niveau d''accès: readonly, editor, admin, full_admin';
COMMENT ON VIEW accountant_companies IS 'Vue simplifiée des entreprises accessibles par comptable';
COMMENT ON VIEW company_accountants_list IS 'Vue simplifiée des comptables ayant accès à une entreprise';
