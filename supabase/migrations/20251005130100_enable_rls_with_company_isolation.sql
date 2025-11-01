/*
  # Réactivation du RLS avec isolation par entreprise

  ## Description
  Cette migration réactive le Row Level Security (RLS) sur toutes les tables principales
  et crée des politiques pour isoler les données par company_id.

  ## 1. Principe de sécurité
  Chaque entreprise ne peut voir QUE ses propres données.
  Les utilisateurs d'une entreprise accèdent aux données via leur company_id.

  ## 2. Tables sécurisées
    - clients : Isolation par company_id
    - articles : Isolation par company_id
    - quotes : Isolation par company_id
    - invoices : Isolation par company_id
    - credits : Isolation par company_id
    - equipment : Isolation par company_id
    - rentals : Isolation par company_id
    - rental_items : Via rental.company_id

  ## 3. Politiques créées
  Pour chaque table, 4 politiques :
    - SELECT : L'utilisateur peut voir les données de son entreprise
    - INSERT : L'utilisateur peut créer des données pour son entreprise
    - UPDATE : L'utilisateur peut modifier les données de son entreprise
    - DELETE : L'utilisateur peut supprimer les données de son entreprise

  ## 4. Mode démo temporaire
  En attendant l'authentification Supabase, les politiques permettent l'accès
  si company_id IS NULL ou si get_current_company_id() IS NULL.
*/

-- Fonction helper pour obtenir le company_id de l'utilisateur actuel
-- En mode démo, retourne NULL pour permettre l'accès
-- En production, sera modifiée pour utiliser auth.uid()
CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS uuid AS $$
BEGIN
  -- Mode démo : permet tous les accès
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CLIENTS TABLE
-- ============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les clients de leur entreprise" ON clients;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des clients pour leur entreprise" ON clients;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier les clients de leur entreprise" ON clients;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les clients de leur entreprise" ON clients;

CREATE POLICY "Les utilisateurs peuvent voir les clients de leur entreprise"
  ON clients FOR SELECT
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent créer des clients pour leur entreprise"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent modifier les clients de leur entreprise"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  )
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent supprimer les clients de leur entreprise"
  ON clients FOR DELETE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

-- ============================================
-- ARTICLES TABLE
-- ============================================

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les articles de leur entreprise" ON articles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des articles pour leur entreprise" ON articles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier les articles de leur entreprise" ON articles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les articles de leur entreprise" ON articles;

CREATE POLICY "Les utilisateurs peuvent voir les articles de leur entreprise"
  ON articles FOR SELECT
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent créer des articles pour leur entreprise"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent modifier les articles de leur entreprise"
  ON articles FOR UPDATE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  )
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent supprimer les articles de leur entreprise"
  ON articles FOR DELETE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

-- ============================================
-- QUOTES TABLE
-- ============================================

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les devis de leur entreprise" ON quotes;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des devis pour leur entreprise" ON quotes;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier les devis de leur entreprise" ON quotes;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les devis de leur entreprise" ON quotes;

CREATE POLICY "Les utilisateurs peuvent voir les devis de leur entreprise"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent créer des devis pour leur entreprise"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent modifier les devis de leur entreprise"
  ON quotes FOR UPDATE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  )
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent supprimer les devis de leur entreprise"
  ON quotes FOR DELETE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

-- ============================================
-- INVOICES TABLE
-- ============================================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les factures de leur entreprise" ON invoices;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des factures pour leur entreprise" ON invoices;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier les factures de leur entreprise" ON invoices;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les factures de leur entreprise" ON invoices;

CREATE POLICY "Les utilisateurs peuvent voir les factures de leur entreprise"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent créer des factures pour leur entreprise"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent modifier les factures de leur entreprise"
  ON invoices FOR UPDATE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  )
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent supprimer les factures de leur entreprise"
  ON invoices FOR DELETE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

-- ============================================
-- CREDITS TABLE
-- ============================================

ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les avoirs de leur entreprise" ON credits;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des avoirs pour leur entreprise" ON credits;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier les avoirs de leur entreprise" ON credits;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les avoirs de leur entreprise" ON credits;

CREATE POLICY "Les utilisateurs peuvent voir les avoirs de leur entreprise"
  ON credits FOR SELECT
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent créer des avoirs pour leur entreprise"
  ON credits FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent modifier les avoirs de leur entreprise"
  ON credits FOR UPDATE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  )
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent supprimer les avoirs de leur entreprise"
  ON credits FOR DELETE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

-- ============================================
-- EQUIPMENT TABLE
-- ============================================

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les équipements de leur entreprise" ON equipment;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des équipements pour leur entreprise" ON equipment;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier les équipements de leur entreprise" ON equipment;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les équipements de leur entreprise" ON equipment;

CREATE POLICY "Les utilisateurs peuvent voir les équipements de leur entreprise"
  ON equipment FOR SELECT
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent créer des équipements pour leur entreprise"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent modifier les équipements de leur entreprise"
  ON equipment FOR UPDATE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  )
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent supprimer les équipements de leur entreprise"
  ON equipment FOR DELETE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

-- ============================================
-- RENTALS TABLE
-- ============================================

ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les locations de leur entreprise" ON rentals;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des locations pour leur entreprise" ON rentals;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier les locations de leur entreprise" ON rentals;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les locations de leur entreprise" ON rentals;

CREATE POLICY "Les utilisateurs peuvent voir les locations de leur entreprise"
  ON rentals FOR SELECT
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent créer des locations pour leur entreprise"
  ON rentals FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent modifier les locations de leur entreprise"
  ON rentals FOR UPDATE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  )
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

CREATE POLICY "Les utilisateurs peuvent supprimer les locations de leur entreprise"
  ON rentals FOR DELETE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL
  );

-- ============================================
-- RENTAL_ITEMS TABLE
-- ============================================

ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les items de location de leur entreprise" ON rental_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des items de location pour leur entreprise" ON rental_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier les items de location de leur entreprise" ON rental_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les items de location de leur entreprise" ON rental_items;

CREATE POLICY "Les utilisateurs peuvent voir les items de location de leur entreprise"
  ON rental_items FOR SELECT
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL OR
    EXISTS (
      SELECT 1 FROM rentals r
      WHERE r.id = rental_items.rental_id
      AND (r.company_id IS NULL OR r.company_id = get_current_company_id() OR get_current_company_id() IS NULL)
    )
  );

CREATE POLICY "Les utilisateurs peuvent créer des items de location pour leur entreprise"
  ON rental_items FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL OR
    EXISTS (
      SELECT 1 FROM rentals r
      WHERE r.id = rental_items.rental_id
      AND (r.company_id IS NULL OR r.company_id = get_current_company_id() OR get_current_company_id() IS NULL)
    )
  );

CREATE POLICY "Les utilisateurs peuvent modifier les items de location de leur entreprise"
  ON rental_items FOR UPDATE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL OR
    EXISTS (
      SELECT 1 FROM rentals r
      WHERE r.id = rental_items.rental_id
      AND (r.company_id IS NULL OR r.company_id = get_current_company_id() OR get_current_company_id() IS NULL)
    )
  );

CREATE POLICY "Les utilisateurs peuvent supprimer les items de location de leur entreprise"
  ON rental_items FOR DELETE
  TO authenticated
  USING (
    company_id IS NULL OR 
    company_id = get_current_company_id() OR
    get_current_company_id() IS NULL OR
    EXISTS (
      SELECT 1 FROM rentals r
      WHERE r.id = rental_items.rental_id
      AND (r.company_id IS NULL OR r.company_id = get_current_company_id() OR get_current_company_id() IS NULL)
    )
  );
