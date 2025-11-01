/*
  # Mise à jour des quotas des plans d'abonnement

  1. Modifications
    - Ajout de colonnes pour limites spécifiques (devis, factures, avoirs)
    - Ajout de colonnes pour fonctionnalités (support email, facturation électronique)
    - Mise à jour des plans avec les nouvelles limites

  2. Nouveaux quotas
    - Gratuit (0€) : 10 devis, 10 factures, 1 utilisateur, pas de support, pas de facturation électronique
    - Pro (10€) : Illimité, 2 utilisateurs, facturation électronique, pas de support email
    - Business (15€) : Tout illimité, support email inclus
*/

-- Ajouter les nouvelles colonnes si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'max_quotes'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN max_quotes integer DEFAULT -1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'max_invoices'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN max_invoices integer DEFAULT -1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'max_credits'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN max_credits integer DEFAULT -1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'has_email_support'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN has_email_support boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'has_electronic_invoicing'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN has_electronic_invoicing boolean DEFAULT false;
  END IF;
END $$;

-- Mettre à jour le plan Gratuit (0€)
UPDATE subscription_plans
SET 
  max_users = 1,
  max_quotes = 10,
  max_invoices = 10,
  max_credits = 10,
  max_documents_per_month = 30,
  has_email_support = false,
  has_electronic_invoicing = false,
  features = jsonb_build_array(
    '1 utilisateur',
    '10 devis maximum',
    '10 factures maximum',
    '10 avoirs maximum',
    'Pas de support email',
    'Pas de facturation électronique'
  )
WHERE name = 'free';

-- Mettre à jour le plan Pro (10€)
UPDATE subscription_plans
SET 
  max_users = 2,
  max_quotes = -1,
  max_invoices = -1,
  max_credits = -1,
  max_documents_per_month = -1,
  has_email_support = false,
  has_electronic_invoicing = true,
  features = jsonb_build_array(
    '2 utilisateurs',
    'Devis illimités',
    'Factures illimitées',
    'Avoirs illimités',
    'Facturation électronique',
    'Factur-X',
    'Multi-contacts clients',
    'Pas de support email'
  )
WHERE name = 'starter';

-- Mettre à jour le plan Business (15€)
UPDATE subscription_plans
SET 
  max_users = -1,
  max_quotes = -1,
  max_invoices = -1,
  max_credits = -1,
  max_documents_per_month = -1,
  has_email_support = true,
  has_electronic_invoicing = true,
  features = jsonb_build_array(
    'Utilisateurs illimités',
    'Documents illimités',
    'Facturation électronique',
    'Factur-X',
    'Multi-contacts clients',
    'Support email prioritaire',
    'Toutes les fonctionnalités'
  )
WHERE name = 'business';

-- Supprimer le plan Enterprise s'il existe
DELETE FROM subscription_plans WHERE name = 'enterprise';
