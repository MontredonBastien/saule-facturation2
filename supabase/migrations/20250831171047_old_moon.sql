/*
  # Fix RLS policies for quote_lines table

  1. Problem
    - Getting 403 error when inserting quote_lines due to RLS policy violation
    - Current policy is too restrictive and doesn't allow proper insertion

  2. Solution
    - Drop existing problematic policies
    - Create new, simpler RLS policies that work correctly
    - Ensure authenticated users can manage quote_lines for their company's quotes

  3. Changes
    - Remove existing quote_lines policies
    - Add new working policies for SELECT, INSERT, UPDATE, DELETE
*/

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "quote_lines_delete" ON quote_lines;
DROP POLICY IF EXISTS "quote_lines_insert" ON quote_lines;
DROP POLICY IF EXISTS "quote_lines_select" ON quote_lines;
DROP POLICY IF EXISTS "quote_lines_update" ON quote_lines;

-- Create new working policies for quote_lines
CREATE POLICY "quote_lines_select_policy"
  ON quote_lines
  FOR SELECT
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM quotes 
      WHERE company_id = (
        SELECT company_id FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "quote_lines_insert_policy"
  ON quote_lines
  FOR INSERT
  TO authenticated
  WITH CHECK (
    quote_id IN (
      SELECT id FROM quotes 
      WHERE company_id = (
        SELECT company_id FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "quote_lines_update_policy"
  ON quote_lines
  FOR UPDATE
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM quotes 
      WHERE company_id = (
        SELECT company_id FROM profiles 
        WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    quote_id IN (
      SELECT id FROM quotes 
      WHERE company_id = (
        SELECT company_id FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "quote_lines_delete_policy"
  ON quote_lines
  FOR DELETE
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM quotes 
      WHERE company_id = (
        SELECT company_id FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );