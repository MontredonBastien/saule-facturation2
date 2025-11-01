/*
  # Système de gestion multi-utilisateurs avec permissions granulaires

  ## Description
  Ce système permet de gérer plusieurs utilisateurs avec des rôles et permissions personnalisables.
  Chaque utilisateur peut avoir accès à différents modules et à différents niveaux de visibilité des données.

  ## 1. Tables créées
    - `app_users` : Informations détaillées des utilisateurs de l'application
    - `roles` : Définition des rôles (Associé, Comptable, Salarié, etc.)
    - `permissions` : Permissions spécifiques disponibles dans l'application
    - `role_permissions` : Association entre rôles et permissions
    - `user_custom_permissions` : Permissions personnalisées par utilisateur (surcharge du rôle)

  ## 2. Rôles par défaut
    - Admin : Accès total à tout
    - Associé : Accès complet aux documents et clients
    - Comptable : Accès aux factures, avoirs et paiements
    - Salarié : Accès limité aux devis et ses propres documents

  ## 3. Niveaux de visibilité
    - all : Voir tous les documents
    - team : Voir les documents de son équipe
    - own : Voir uniquement ses propres documents créés
    - none : Aucun accès

  ## 4. Modules disponibles
    - dashboard, quotes, invoices, credits, articles, clients, equipment, rentals, maintenance, settings, emails

  ## 5. Sécurité
    - RLS activé sur toutes les tables
    - Seuls les admins peuvent gérer les utilisateurs
    - Chaque utilisateur ne voit que les données auxquelles il a accès
*/

-- Table des utilisateurs de l'application
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role_id uuid REFERENCES roles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES app_users(id),
  last_login timestamptz,
  notes text
);

-- Table des rôles
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table des permissions disponibles
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  action text NOT NULL,
  display_name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(module, action)
);

-- Table d'association rôles-permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  access_level text NOT NULL DEFAULT 'all',
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id),
  CHECK (access_level IN ('all', 'team', 'own', 'none'))
);

-- Table des permissions personnalisées par utilisateur (surcharge du rôle)
CREATE TABLE IF NOT EXISTS user_custom_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  access_level text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, permission_id),
  CHECK (access_level IN ('all', 'team', 'own', 'none'))
);

-- Activer RLS sur toutes les tables
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_permissions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour app_users
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
  ON app_users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Les admins peuvent voir tous les utilisateurs"
  ON app_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users au
      JOIN roles r ON au.role_id = r.id
      WHERE au.auth_user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Les admins peuvent créer des utilisateurs"
  ON app_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users au
      JOIN roles r ON au.role_id = r.id
      WHERE au.auth_user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Les admins peuvent modifier les utilisateurs"
  ON app_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users au
      JOIN roles r ON au.role_id = r.id
      WHERE au.auth_user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Les admins peuvent supprimer les utilisateurs"
  ON app_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users au
      JOIN roles r ON au.role_id = r.id
      WHERE au.auth_user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Politiques RLS pour roles (lecture publique pour utilisateurs authentifiés)
CREATE POLICY "Tous les utilisateurs authentifiés peuvent voir les rôles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Les admins peuvent gérer les rôles"
  ON roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users au
      JOIN roles r ON au.role_id = r.id
      WHERE au.auth_user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Politiques RLS pour permissions
CREATE POLICY "Tous les utilisateurs authentifiés peuvent voir les permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Les admins peuvent gérer les permissions"
  ON permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users au
      JOIN roles r ON au.role_id = r.id
      WHERE au.auth_user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Politiques RLS pour role_permissions
CREATE POLICY "Tous les utilisateurs authentifiés peuvent voir les permissions des rôles"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Les admins peuvent gérer les permissions des rôles"
  ON role_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users au
      JOIN roles r ON au.role_id = r.id
      WHERE au.auth_user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Politiques RLS pour user_custom_permissions
CREATE POLICY "Les utilisateurs peuvent voir leurs propres permissions"
  ON user_custom_permissions FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM app_users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Les admins peuvent voir toutes les permissions personnalisées"
  ON user_custom_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users au
      JOIN roles r ON au.role_id = r.id
      WHERE au.auth_user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Les admins peuvent gérer les permissions personnalisées"
  ON user_custom_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users au
      JOIN roles r ON au.role_id = r.id
      WHERE au.auth_user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Insérer les rôles par défaut
INSERT INTO roles (name, display_name, description, is_system) VALUES
  ('admin', 'Administrateur', 'Accès complet à toute l''application', true),
  ('associate', 'Associé', 'Accès complet aux documents et clients', true),
  ('accountant', 'Comptable', 'Accès aux factures, avoirs et paiements', true),
  ('employee', 'Salarié', 'Accès limité aux devis et ses propres documents', true)
ON CONFLICT (name) DO NOTHING;

-- Insérer les permissions par module
INSERT INTO permissions (module, action, display_name, description) VALUES
  -- Dashboard
  ('dashboard', 'view', 'Voir le tableau de bord', 'Accès au tableau de bord et statistiques'),

  -- Devis
  ('quotes', 'view', 'Voir les devis', 'Consulter les devis'),
  ('quotes', 'create', 'Créer des devis', 'Créer de nouveaux devis'),
  ('quotes', 'edit', 'Modifier les devis', 'Modifier les devis existants'),
  ('quotes', 'delete', 'Supprimer les devis', 'Supprimer des devis'),
  ('quotes', 'validate', 'Valider les devis', 'Changer le statut des devis'),

  -- Factures
  ('invoices', 'view', 'Voir les factures', 'Consulter les factures'),
  ('invoices', 'create', 'Créer des factures', 'Créer de nouvelles factures'),
  ('invoices', 'edit', 'Modifier les factures', 'Modifier les factures existantes'),
  ('invoices', 'delete', 'Supprimer les factures', 'Supprimer des factures'),
  ('invoices', 'validate', 'Valider les factures', 'Émettre et valider les factures'),
  ('invoices', 'manage_payments', 'Gérer les paiements', 'Enregistrer et gérer les paiements'),

  -- Avoirs
  ('credits', 'view', 'Voir les avoirs', 'Consulter les avoirs'),
  ('credits', 'create', 'Créer des avoirs', 'Créer de nouveaux avoirs'),
  ('credits', 'edit', 'Modifier les avoirs', 'Modifier les avoirs existants'),
  ('credits', 'delete', 'Supprimer les avoirs', 'Supprimer des avoirs'),
  ('credits', 'validate', 'Valider les avoirs', 'Valider et émettre les avoirs'),

  -- Clients
  ('clients', 'view', 'Voir les clients', 'Consulter la liste des clients'),
  ('clients', 'create', 'Créer des clients', 'Ajouter de nouveaux clients'),
  ('clients', 'edit', 'Modifier les clients', 'Modifier les informations clients'),
  ('clients', 'delete', 'Supprimer les clients', 'Supprimer des clients'),

  -- Articles
  ('articles', 'view', 'Voir les articles', 'Consulter le catalogue'),
  ('articles', 'create', 'Créer des articles', 'Ajouter de nouveaux articles'),
  ('articles', 'edit', 'Modifier les articles', 'Modifier les articles'),
  ('articles', 'delete', 'Supprimer les articles', 'Supprimer des articles'),

  -- Équipements
  ('equipment', 'view', 'Voir les équipements', 'Consulter les équipements'),
  ('equipment', 'create', 'Créer des équipements', 'Ajouter de nouveaux équipements'),
  ('equipment', 'edit', 'Modifier les équipements', 'Modifier les équipements'),
  ('equipment', 'delete', 'Supprimer les équipements', 'Supprimer des équipements'),

  -- Locations
  ('rentals', 'view', 'Voir les locations', 'Consulter les locations'),
  ('rentals', 'create', 'Créer des locations', 'Créer de nouvelles locations'),
  ('rentals', 'edit', 'Modifier les locations', 'Modifier les locations'),
  ('rentals', 'delete', 'Supprimer les locations', 'Supprimer des locations'),

  -- Paramètres
  ('settings', 'view', 'Voir les paramètres', 'Accéder aux paramètres'),
  ('settings', 'edit', 'Modifier les paramètres', 'Modifier les paramètres de l''application'),

  -- Emails
  ('emails', 'view', 'Voir les envois d''emails', 'Consulter l''historique des emails'),
  ('emails', 'send', 'Envoyer des emails', 'Envoyer des documents par email'),

  -- Gestion utilisateurs
  ('users', 'view', 'Voir les utilisateurs', 'Consulter la liste des utilisateurs'),
  ('users', 'create', 'Créer des utilisateurs', 'Ajouter de nouveaux utilisateurs'),
  ('users', 'edit', 'Modifier les utilisateurs', 'Modifier les utilisateurs'),
  ('users', 'delete', 'Supprimer les utilisateurs', 'Supprimer des utilisateurs')
ON CONFLICT (module, action) DO NOTHING;

-- Configuration des permissions pour le rôle Admin
INSERT INTO role_permissions (role_id, permission_id, access_level)
SELECT r.id, p.id, 'all'
FROM roles r, permissions p
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Configuration des permissions pour le rôle Associé
INSERT INTO role_permissions (role_id, permission_id, access_level)
SELECT r.id, p.id, 'all'
FROM roles r, permissions p
WHERE r.name = 'associate'
AND p.module IN ('dashboard', 'quotes', 'invoices', 'credits', 'clients', 'articles', 'equipment', 'rentals', 'emails')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Configuration des permissions pour le rôle Comptable
INSERT INTO role_permissions (role_id, permission_id, access_level)
SELECT r.id, p.id, 'all'
FROM roles r, permissions p
WHERE r.name = 'accountant'
AND p.module IN ('dashboard', 'invoices', 'credits', 'clients')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Configuration des permissions pour le rôle Salarié
INSERT INTO role_permissions (role_id, permission_id, access_level)
SELECT r.id, p.id, 'own'
FROM roles r, permissions p
WHERE r.name = 'employee'
AND p.module IN ('dashboard', 'quotes', 'invoices', 'credits')
AND p.action IN ('view', 'create')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Ajouter une colonne created_by aux tables principales pour la traçabilité
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'created_by_user_id'
  ) THEN
    ALTER TABLE quotes ADD COLUMN created_by_user_id uuid REFERENCES app_users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'created_by_user_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN created_by_user_id uuid REFERENCES app_users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credits' AND column_name = 'created_by_user_id'
  ) THEN
    ALTER TABLE credits ADD COLUMN created_by_user_id uuid REFERENCES app_users(id);
  END IF;
END $$;
