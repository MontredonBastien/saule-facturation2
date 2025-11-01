/*
  # Logs d'actions super-admin

  ## Description
  Table pour tracer toutes les actions des super-administrateurs.
  Permet l'audit et la sécurité.

  ## 1. Table créée
    - `super_admin_logs` : Historique des actions

  ## 2. Types d'actions
    - company_created : Création d'entreprise
    - company_updated : Modification d'entreprise
    - company_deleted : Suppression d'entreprise
    - subscription_changed : Changement de plan
    - modules_updated : Modification des modules
    - quota_changed : Changement de quota
    - company_activated : Activation d'entreprise
    - company_deactivated : Désactivation d'entreprise

  ## 3. Données enregistrées
    - Qui : super_admin_id
    - Quoi : action_type
    - Sur qui/quoi : target_company_id
    - Quand : created_at
    - Détails : old_value, new_value (JSON)
    - Contexte : notes

  ## 4. Politique RLS
  Seuls les super-admins peuvent consulter les logs.
*/

-- Table des logs d'actions super-admin
CREATE TABLE IF NOT EXISTS super_admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id uuid REFERENCES super_admins(id),
  action_type text NOT NULL,
  target_company_id uuid REFERENCES companies(id),
  old_value jsonb,
  new_value jsonb,
  notes text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  CHECK (action_type IN (
    'company_created',
    'company_updated',
    'company_deleted',
    'subscription_changed',
    'modules_updated',
    'quota_changed',
    'company_activated',
    'company_deactivated',
    'super_admin_created',
    'super_admin_deactivated'
  ))
);

-- Index pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_super_admin_logs_super_admin_id ON super_admin_logs(super_admin_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_logs_target_company ON super_admin_logs(target_company_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_logs_action_type ON super_admin_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_super_admin_logs_created_at ON super_admin_logs(created_at DESC);

-- Activer RLS
ALTER TABLE super_admin_logs ENABLE ROW LEVEL SECURITY;

-- Politique : Seuls les super-admins peuvent voir les logs
CREATE POLICY "Les super-admins peuvent voir tous les logs"
  ON super_admin_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.is_active = true
    )
  );

-- Politique : Seuls les super-admins peuvent créer des logs
CREATE POLICY "Les super-admins peuvent créer des logs"
  ON super_admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.auth_user_id = auth.uid()
      AND sa.is_active = true
    )
  );

-- Fonction helper pour logger facilement une action
CREATE OR REPLACE FUNCTION log_super_admin_action(
  p_super_admin_id uuid,
  p_action_type text,
  p_target_company_id uuid DEFAULT NULL,
  p_old_value jsonb DEFAULT NULL,
  p_new_value jsonb DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO super_admin_logs (
    super_admin_id,
    action_type,
    target_company_id,
    old_value,
    new_value,
    notes
  ) VALUES (
    p_super_admin_id,
    p_action_type,
    p_target_company_id,
    p_old_value,
    p_new_value,
    p_notes
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue pour faciliter la lecture des logs avec détails
CREATE OR REPLACE VIEW super_admin_logs_detailed AS
SELECT
  l.id,
  l.action_type,
  l.created_at,
  sa.email as super_admin_email,
  sa.full_name as super_admin_name,
  c.name as target_company_name,
  c.email as target_company_email,
  l.old_value,
  l.new_value,
  l.notes
FROM super_admin_logs l
LEFT JOIN super_admins sa ON l.super_admin_id = sa.id
LEFT JOIN companies c ON l.target_company_id = c.id
ORDER BY l.created_at DESC;

-- Commentaires
COMMENT ON TABLE super_admin_logs IS 'Historique de toutes les actions des super-administrateurs';
COMMENT ON FUNCTION log_super_admin_action IS 'Fonction helper pour enregistrer facilement une action super-admin';
COMMENT ON VIEW super_admin_logs_detailed IS 'Vue enrichie des logs avec les informations jointes';
