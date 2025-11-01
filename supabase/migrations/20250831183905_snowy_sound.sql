/*
  # Simplifier les politiques RLS pour quote_lines

  1. Problème identifié
    - Erreur 403 lors de l'insertion de quote_lines
    - Les politiques RLS actuelles sont trop complexes
    - Problème possible avec la fonction uid() ou la jointure avec profiles

  2. Solution
    - Supprimer toutes les politiques existantes
    - Créer des politiques simplifiées qui fonctionnent
    - Utiliser auth.uid() directement pour vérifier l'utilisateur

  3. Nouvelle approche
    - Politiques basées sur l'appartenance du quote à l'utilisateur
    - Vérification directe via la table quotes et profiles
*/

-- Supprimer toutes les politiques existantes pour quote_lines
DROP POLICY IF EXISTS "quote_lines_delete_policy" ON quote_lines;
DROP POLICY IF EXISTS "quote_lines_insert_policy" ON quote_lines;
DROP POLICY IF EXISTS "quote_lines_select_policy" ON quote_lines;
DROP POLICY IF EXISTS "quote_lines_update_policy" ON quote_lines;

-- Créer des politiques simplifiées

-- Politique pour SELECT
CREATE POLICY "quote_lines_select_simple" ON quote_lines
  FOR SELECT
  TO authenticated
  USING (
    quote_id IN (
      SELECT q.id FROM quotes q
      JOIN profiles p ON p.company_id = q.company_id
      WHERE p.id = auth.uid()
    )
  );

-- Politique pour INSERT
CREATE POLICY "quote_lines_insert_simple" ON quote_lines
  FOR INSERT
  TO authenticated
  WITH CHECK (
    quote_id IN (
      SELECT q.id FROM quotes q
      JOIN profiles p ON p.company_id = q.company_id
      WHERE p.id = auth.uid()
    )
  );

-- Politique pour UPDATE
CREATE POLICY "quote_lines_update_simple" ON quote_lines
  FOR UPDATE
  TO authenticated
  USING (
    quote_id IN (
      SELECT q.id FROM quotes q
      JOIN profiles p ON p.company_id = q.company_id
      WHERE p.id = auth.uid()
    )
  )
  WITH CHECK (
    quote_id IN (
      SELECT q.id FROM quotes q
      JOIN profiles p ON p.company_id = q.company_id
      WHERE p.id = auth.uid()
    )
  );

-- Politique pour DELETE
CREATE POLICY "quote_lines_delete_simple" ON quote_lines
  FOR DELETE
  TO authenticated
  USING (
    quote_id IN (
      SELECT q.id FROM quotes q
      JOIN profiles p ON p.company_id = q.company_id
      WHERE p.id = auth.uid()
    )
  );