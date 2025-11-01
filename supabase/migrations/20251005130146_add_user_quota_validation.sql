/*
  # Validation des quotas utilisateurs

  ## Description
  Empêche la création de nouveaux utilisateurs si l'entreprise a atteint son quota.

  ## Fonctionnement
  Un trigger vérifie avant chaque INSERT dans app_users si l'entreprise
  a encore de la place selon son plan d'abonnement.

  ## Logique
  1. Récupère le quota max (custom_max_users OU plan.max_users)
  2. Compte les utilisateurs actifs de l'entreprise
  3. Si quota atteint → erreur
  4. Sinon → création autorisée

  ## Exception
  Si le plan permet des utilisateurs illimités (max_users = NULL),
  aucune limite n'est appliquée.
*/

-- Fonction pour valider le quota avant création d'utilisateur
CREATE OR REPLACE FUNCTION validate_user_quota()
RETURNS TRIGGER AS $$
DECLARE
  v_max_users integer;
  v_current_users integer;
  v_company_name text;
BEGIN
  -- Si pas de company_id, pas de vérification (mode démo)
  IF NEW.company_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Récupérer le quota maximum de l'entreprise
  SELECT 
    COALESCE(cs.custom_max_users, sp.max_users),
    c.name
  INTO v_max_users, v_company_name
  FROM companies c
  LEFT JOIN company_subscriptions cs ON c.id = cs.company_id
  LEFT JOIN subscription_plans sp ON cs.plan_id = sp.id
  WHERE c.id = NEW.company_id;

  -- Si pas de limite (NULL = illimité), autoriser
  IF v_max_users IS NULL THEN
    RETURN NEW;
  END IF;

  -- Compter les utilisateurs actifs actuels (sans compter celui qu'on crée)
  SELECT COUNT(*)
  INTO v_current_users
  FROM app_users
  WHERE company_id = NEW.company_id
    AND is_active = true
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- Vérifier si le quota est atteint
  IF v_current_users >= v_max_users THEN
    RAISE EXCEPTION 'Quota d''utilisateurs atteint pour %. Quota: %, Utilisateurs actuels: %. Veuillez mettre à niveau votre plan.',
      v_company_name, v_max_users, v_current_users
      USING ERRCODE = 'check_violation',
            HINT = 'Contactez votre super-admin pour augmenter votre quota';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS trigger_validate_user_quota ON app_users;

-- Créer le trigger sur INSERT
CREATE TRIGGER trigger_validate_user_quota
  BEFORE INSERT ON app_users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_quota();

-- Également vérifier lors d'un UPDATE qui réactive un utilisateur
CREATE OR REPLACE FUNCTION validate_user_reactivation()
RETURNS TRIGGER AS $$
DECLARE
  v_max_users integer;
  v_current_users integer;
  v_company_name text;
BEGIN
  -- Si l'utilisateur passe de inactif à actif
  IF OLD.is_active = false AND NEW.is_active = true THEN
    -- Si pas de company_id, pas de vérification
    IF NEW.company_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Récupérer le quota maximum
    SELECT 
      COALESCE(cs.custom_max_users, sp.max_users),
      c.name
    INTO v_max_users, v_company_name
    FROM companies c
    LEFT JOIN company_subscriptions cs ON c.id = cs.company_id
    LEFT JOIN subscription_plans sp ON cs.plan_id = sp.id
    WHERE c.id = NEW.company_id;

    -- Si pas de limite, autoriser
    IF v_max_users IS NULL THEN
      RETURN NEW;
    END IF;

    -- Compter les utilisateurs actifs (sans celui qu'on réactive)
    SELECT COUNT(*)
    INTO v_current_users
    FROM app_users
    WHERE company_id = NEW.company_id
      AND is_active = true
      AND id != NEW.id;

    -- Vérifier le quota
    IF v_current_users >= v_max_users THEN
      RAISE EXCEPTION 'Quota d''utilisateurs atteint pour %. Impossible de réactiver cet utilisateur. Quota: %, Utilisateurs actuels: %.',
        v_company_name, v_max_users, v_current_users
        USING ERRCODE = 'check_violation',
              HINT = 'Désactivez un autre utilisateur ou augmentez votre quota';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la réactivation
DROP TRIGGER IF EXISTS trigger_validate_user_reactivation ON app_users;

CREATE TRIGGER trigger_validate_user_reactivation
  BEFORE UPDATE ON app_users
  FOR EACH ROW
  WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active)
  EXECUTE FUNCTION validate_user_reactivation();

-- Vue pour faciliter la vérification du quota disponible
CREATE OR REPLACE VIEW company_quota_status AS
SELECT
  c.id as company_id,
  c.name as company_name,
  COALESCE(cs.custom_max_users, sp.max_users) as max_users,
  COALESCE(cu.current_users_count, 0) as current_users,
  CASE
    WHEN COALESCE(cs.custom_max_users, sp.max_users) IS NULL THEN NULL
    ELSE COALESCE(cs.custom_max_users, sp.max_users) - COALESCE(cu.current_users_count, 0)
  END as remaining_users,
  CASE
    WHEN COALESCE(cs.custom_max_users, sp.max_users) IS NULL THEN false
    WHEN COALESCE(cu.current_users_count, 0) >= COALESCE(cs.custom_max_users, sp.max_users) THEN true
    ELSE false
  END as quota_reached,
  sp.display_name as plan_name,
  cs.is_active as subscription_active
FROM companies c
LEFT JOIN company_subscriptions cs ON c.id = cs.company_id
LEFT JOIN subscription_plans sp ON cs.plan_id = sp.id
LEFT JOIN company_usage cu ON c.id = cu.company_id;

-- Commenter la vue
COMMENT ON VIEW company_quota_status IS 'Vue pratique pour vérifier le statut du quota utilisateurs par entreprise';
