/*
  # Fix RLS policy for quote_lines table

  1. Security Updates
    - Drop existing restrictive policy for quote_lines
    - Create new policy that allows operations when quote belongs to user's company
    - Ensure policy works for both new and existing quotes

  2. Changes Made
    - Updated quote_lines policy to properly check company ownership
    - Added proper INSERT policy for quote_lines
    - Fixed policy condition to work with concurrent operations
*/

-- Drop existing policy
DROP POLICY IF EXISTS "quote_lines_company_policy" ON quote_lines;

-- Create new policies for quote_lines
CREATE POLICY "quote_lines_select" ON quote_lines
  FOR SELECT
  TO authenticated
  USING (
    quote_id IN (
      SELECT q.id FROM quotes q
      WHERE q.company_id = (
        SELECT v_user_company.company_id FROM v_user_company
      )
    )
  );

CREATE POLICY "quote_lines_insert" ON quote_lines
  FOR INSERT
  TO authenticated
  WITH CHECK (
    quote_id IN (
      SELECT q.id FROM quotes q
      WHERE q.company_id = (
        SELECT v_user_company.company_id FROM v_user_company
      )
    )
  );

CREATE POLICY "quote_lines_update" ON quote_lines
  FOR UPDATE
  TO authenticated
  USING (
    quote_id IN (
      SELECT q.id FROM quotes q
      WHERE q.company_id = (
        SELECT v_user_company.company_id FROM v_user_company
      )
    )
  )
  WITH CHECK (
    quote_id IN (
      SELECT q.id FROM quotes q
      WHERE q.company_id = (
        SELECT v_user_company.company_id FROM v_user_company
      )
    )
  );

CREATE POLICY "quote_lines_delete" ON quote_lines
  FOR DELETE
  TO authenticated
  USING (
    quote_id IN (
      SELECT q.id FROM quotes q
      WHERE q.company_id = (
        SELECT v_user_company.company_id FROM v_user_company
      )
    )
  );