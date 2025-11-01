/*
  # Ajouter champs de paiement et pièces jointes

  1. Modifications Tables
    - `invoices_custom`
      - `payment_date` (date optionnelle)
      - `actual_payment_method` (text optionnel)
      - `attachments` (jsonb pour stocker les pièces jointes)
    - `quotes`
      - `attachments` (jsonb pour stocker les pièces jointes)
    - `credits`
      - `attachments` (jsonb pour stocker les pièces jointes)

  2. Sécurité
    - Pas de modification des politiques RLS existantes
*/

-- Ajouter les champs de paiement et pièces jointes aux factures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices_custom' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE invoices_custom ADD COLUMN payment_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices_custom' AND column_name = 'actual_payment_method'
  ) THEN
    ALTER TABLE invoices_custom ADD COLUMN actual_payment_method text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices_custom' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE invoices_custom ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Ajouter les pièces jointes aux devis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE quotes ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Ajouter les pièces jointes aux avoirs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credits' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE credits ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;