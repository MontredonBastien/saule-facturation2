/*
  # Ajouter les champs de transformation manquants

  1. Tables modifiées
    - `quotes` : Ajouter `transformed_to_invoice_id`
    - `invoices_custom` : Ajouter `quote_id` et `transformed_to_credit_id`
    
  2. Relations
    - Liens entre devis et factures
    - Liens entre factures et avoirs
    
  3. Sécurité
    - Aucune modification RLS nécessaire
*/

-- Ajouter le champ transformed_to_invoice_id à la table quotes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'transformed_to_invoice_id'
  ) THEN
    ALTER TABLE quotes ADD COLUMN transformed_to_invoice_id uuid;
  END IF;
END $$;

-- Ajouter les champs quote_id et transformed_to_credit_id à la table invoices_custom
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices_custom' AND column_name = 'quote_id'
  ) THEN
    ALTER TABLE invoices_custom ADD COLUMN quote_id uuid;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices_custom' AND column_name = 'transformed_to_credit_id'
  ) THEN
    ALTER TABLE invoices_custom ADD COLUMN transformed_to_credit_id uuid;
  END IF;
END $$;

-- Ajouter les contraintes de clés étrangères si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'quotes_transformed_to_invoice_id_fkey'
  ) THEN
    ALTER TABLE quotes 
    ADD CONSTRAINT quotes_transformed_to_invoice_id_fkey 
    FOREIGN KEY (transformed_to_invoice_id) REFERENCES invoices_custom(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'invoices_custom_quote_id_fkey'
  ) THEN
    ALTER TABLE invoices_custom 
    ADD CONSTRAINT invoices_custom_quote_id_fkey 
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'invoices_custom_transformed_to_credit_id_fkey'
  ) THEN
    ALTER TABLE invoices_custom 
    ADD CONSTRAINT invoices_custom_transformed_to_credit_id_fkey 
    FOREIGN KEY (transformed_to_credit_id) REFERENCES credits(id) ON DELETE SET NULL;
  END IF;
END $$;