/*
  # Corriger toutes les politiques RLS avec auth.uid()

  1. Corrections
    - Supprimer toutes les anciennes politiques problématiques
    - Recréer avec auth.uid() au lieu de uid()
    - Simplifier les jointures pour éviter les erreurs
    
  2. Tables affectées
    - quote_lines
    - invoice_lines_custom  
    - credit_lines
    
  3. Sécurité
    - Maintenir la sécurité au niveau entreprise
    - Utiliser auth.uid() pour l'authentification
*/

-- Nettoyer complètement les politiques existantes pour quote_lines
DROP POLICY IF EXISTS "quote_lines_delete_simple" ON quote_lines;
DROP POLICY IF EXISTS "quote_lines_insert_simple" ON quote_lines;
DROP POLICY IF EXISTS "quote_lines_select_simple" ON quote_lines;
DROP POLICY IF EXISTS "quote_lines_update_simple" ON quote_lines;

-- Politiques correctes pour quote_lines
CREATE POLICY "quote_lines_select_fixed"
  ON quote_lines
  FOR SELECT
  TO authenticated
  USING (
    quote_id IN (
      SELECT q.id
      FROM quotes q
      JOIN profiles p ON p.company_id = q.company_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "quote_lines_insert_fixed"
  ON quote_lines
  FOR INSERT
  TO authenticated
  WITH CHECK (
    quote_id IN (
      SELECT q.id
      FROM quotes q
      JOIN profiles p ON p.company_id = q.company_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "quote_lines_update_fixed"
  ON quote_lines
  FOR UPDATE
  TO authenticated
  USING (
    quote_id IN (
      SELECT q.id
      FROM quotes q
      JOIN profiles p ON p.company_id = q.company_id
      WHERE p.id = auth.uid()
    )
  )
  WITH CHECK (
    quote_id IN (
      SELECT q.id
      FROM quotes q
      JOIN profiles p ON p.company_id = q.company_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "quote_lines_delete_fixed"
  ON quote_lines
  FOR DELETE
  TO authenticated
  USING (
    quote_id IN (
      SELECT q.id
      FROM quotes q
      JOIN profiles p ON p.company_id = q.company_id
      WHERE p.id = auth.uid()
    )
  );

-- Nettoyer et corriger invoice_lines_custom
DROP POLICY IF EXISTS "invoice_lines_custom_company_policy" ON invoice_lines_custom;
DROP POLICY IF EXISTS "invoice_lines_custom_select" ON invoice_lines_custom;
DROP POLICY IF EXISTS "invoice_lines_custom_insert" ON invoice_lines_custom;
DROP POLICY IF EXISTS "invoice_lines_custom_update" ON invoice_lines_custom;
DROP POLICY IF EXISTS "invoice_lines_custom_delete" ON invoice_lines_custom;

CREATE POLICY "invoice_lines_custom_select_fixed"
  ON invoice_lines_custom
  FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT i.id
      FROM invoices_custom i
      JOIN profiles p ON p.company_id = i.company_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "invoice_lines_custom_insert_fixed"
  ON invoice_lines_custom
  FOR INSERT
  TO authenticated
  WITH CHECK (
    invoice_id IN (
      SELECT i.id
      FROM invoices_custom i
      JOIN profiles p ON p.company_id = i.company_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "invoice_lines_custom_update_fixed"
  ON invoice_lines_custom
  FOR UPDATE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT i.id
      FROM invoices_custom i
      JOIN profiles p ON p.company_id = i.company_id
      WHERE p.id = auth.uid()
    )
  )
  WITH CHECK (
    invoice_id IN (
      SELECT i.id
      FROM invoices_custom i
      JOIN profiles p ON p.company_id = i.company_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "invoice_lines_custom_delete_fixed"
  ON invoice_lines_custom
  FOR DELETE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT i.id
      FROM invoices_custom i
      JOIN profiles p ON p.company_id = i.company_id
      WHERE p.id = auth.uid()
    )
  );

-- Nettoyer et corriger credit_lines
DROP POLICY IF EXISTS "credit_lines_company_policy" ON credit_lines;
DROP POLICY IF EXISTS "credit_lines_select" ON credit_lines;
DROP POLICY IF EXISTS "credit_lines_insert" ON credit_lines;
DROP POLICY IF EXISTS "credit_lines_update" ON credit_lines;
DROP POLICY IF EXISTS "credit_lines_delete" ON credit_lines;

CREATE POLICY "credit_lines_select_fixed"
  ON credit_lines
  FOR SELECT
  TO authenticated
  USING (
    credit_id IN (
      SELECT c.id
      FROM credits c
      JOIN profiles p ON p.company_id = c.company_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "credit_lines_insert_fixed"
  ON credit_lines
  FOR INSERT
  TO authenticated
  WITH CHECK (
    credit_id IN (
      SELECT c.id
      FROM credits c
      JOIN profiles p ON p.company_id = c.company_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "credit_lines_update_fixed"
  ON credit_lines
  FOR UPDATE
  TO authenticated
  USING (
    credit_id IN (
      SELECT c.id
      FROM credits c
      JOIN profiles p ON p.company_id = c.company_id
      WHERE p.id = auth.uid()
    )
  )
  WITH CHECK (
    credit_id IN (
      SELECT c.id
      FROM credits c
      JOIN profiles p ON p.company_id = c.company_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "credit_lines_delete_fixed"
  ON credit_lines
  FOR DELETE
  TO authenticated
  USING (
    credit_id IN (
      SELECT c.id
      FROM credits c
      JOIN profiles p ON p.company_id = c.company_id
      WHERE p.id = auth.uid()
    )
  );