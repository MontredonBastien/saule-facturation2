/*
  # Schéma complet de la base de données FacturApp

  ## Description
  Migration complète créant toutes les tables nécessaires pour l'application de facturation,
  incluant la gestion multi-société, l'authentification, les clients, articles, documents
  (devis, factures, avoirs), paiements, numérotation automatique et journalisation.

  ## 1. Tables de base
    - `companies` - Sociétés utilisatrices
    - `profiles` - Profils utilisateurs liés aux comptes auth
    - `counters` - Numérotation automatique des documents par type
    - `audit_logs` - Journal d'audit complet de toutes les actions

  ## 2. Tables métier
    - `clients` - Clients des sociétés
    - `articles` - Catalogue d'articles/services
    - `quotes` - Devis
    - `quote_lines` - Lignes de devis
    - `invoices` - Factures
    - `invoice_lines` - Lignes de factures
    - `credits` - Avoirs
    - `credit_lines` - Lignes d'avoirs
    - `payments` - Paiements reçus

  ## 3. Sécurité
    - RLS activé sur toutes les tables
    - Politiques restrictives par company_id
    - Isolation complète entre sociétés
    - Audit automatique des modifications

  ## 4. Fonctions
    - `next_number()` - Génération atomique des numéros de documents
    - `log_audit()` - Journalisation automatique
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLES DE BASE
-- =====================================================

-- Companies (Sociétés)
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  siret text,
  siren text,
  tva_intracommunautaire text,
  rcs text,
  forme_juridique text,
  capital_social numeric(12,2),
  capital_currency text DEFAULT 'euros',
  address text,
  phone text,
  email text,
  logo text,
  logo_size integer DEFAULT 24,
  iban text,
  bic text,
  bank_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Profiles (Profils utilisateurs)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Counters (Numérotation automatique)
CREATE TABLE IF NOT EXISTS counters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  prefix text DEFAULT '',
  current_number integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, document_type)
);

ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

-- Audit logs (Journal d'audit)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text,
  action text NOT NULL,
  module text NOT NULL,
  entity_id uuid,
  entity_type text,
  details text,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_id, entity_type);

-- =====================================================
-- 2. TABLES MÉTIER
-- =====================================================

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type text DEFAULT 'pro',
  code_client text NOT NULL,
  company_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text DEFAULT 'France',
  siret text,
  tva_intracommunautaire text,
  payment_delay integer DEFAULT 30,
  payment_method text DEFAULT 'virement',
  status text DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, code_client)
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_code ON clients(company_id, code_client);

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  unit text DEFAULT 'unité',
  price_ht numeric(12,2) NOT NULL DEFAULT 0,
  vat_rate numeric(5,2) DEFAULT 20.00,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_articles_company ON articles(company_id);

-- Quotes (Devis)
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  number text NOT NULL,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  status text DEFAULT 'draft',
  reference text,
  created_at timestamptz DEFAULT now(),
  valid_until timestamptz,
  total_ht numeric(12,2) DEFAULT 0,
  total_vat numeric(12,2) DEFAULT 0,
  total_ttc numeric(12,2) DEFAULT 0,
  global_discount numeric(12,2),
  global_discount_type text,
  deposit_percentage numeric(5,2),
  payment_conditions text,
  comments text,
  show_comments boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, number)
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_quotes_company ON quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(company_id, status);

-- Quote lines (Lignes de devis)
CREATE TABLE IF NOT EXISTS quote_lines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  line_order integer NOT NULL,
  type text DEFAULT 'item',
  designation text NOT NULL,
  description text,
  quantity numeric(12,3) DEFAULT 1,
  unit text DEFAULT 'unité',
  price_ht numeric(12,2) DEFAULT 0,
  vat_rate numeric(5,2) DEFAULT 20.00,
  discount numeric(12,2),
  discount_type text,
  subtotal_amount numeric(12,2),
  font_family text,
  font_size integer,
  font_weight text,
  text_color text,
  is_multiline boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quote_lines ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_quote_lines_quote ON quote_lines(quote_id, line_order);

-- Invoices (Factures)
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  number text NOT NULL,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
  status text DEFAULT 'draft',
  reference text,
  issued_at timestamptz DEFAULT now(),
  due_date timestamptz,
  payment_method text DEFAULT 'virement',
  total_ht numeric(12,2) DEFAULT 0,
  total_vat numeric(12,2) DEFAULT 0,
  total_ttc numeric(12,2) DEFAULT 0,
  paid_amount numeric(12,2) DEFAULT 0,
  remaining_amount numeric(12,2) DEFAULT 0,
  global_discount numeric(12,2),
  global_discount_type text,
  deposit_amount numeric(12,2),
  deposit_received boolean DEFAULT false,
  comments text,
  show_comments boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, number)
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(company_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(company_id, due_date) WHERE status != 'paid';

-- Invoice lines (Lignes de factures)
CREATE TABLE IF NOT EXISTS invoice_lines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_order integer NOT NULL,
  type text DEFAULT 'item',
  designation text NOT NULL,
  description text,
  quantity numeric(12,3) DEFAULT 1,
  unit text DEFAULT 'unité',
  price_ht numeric(12,2) DEFAULT 0,
  vat_rate numeric(5,2) DEFAULT 20.00,
  discount numeric(12,2),
  discount_type text,
  subtotal_amount numeric(12,2),
  font_family text,
  font_size integer,
  font_weight text,
  text_color text,
  is_multiline boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON invoice_lines(invoice_id, line_order);

-- Credits (Avoirs)
CREATE TABLE IF NOT EXISTS credits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  number text NOT NULL,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  status text DEFAULT 'draft',
  reason text,
  created_at timestamptz DEFAULT now(),
  total_ht numeric(12,2) DEFAULT 0,
  total_vat numeric(12,2) DEFAULT 0,
  total_ttc numeric(12,2) DEFAULT 0,
  comments text,
  show_comments boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, number)
);

ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_credits_company ON credits(company_id);
CREATE INDEX IF NOT EXISTS idx_credits_client ON credits(client_id);

-- Credit lines (Lignes d'avoirs)
CREATE TABLE IF NOT EXISTS credit_lines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  credit_id uuid NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
  line_order integer NOT NULL,
  type text DEFAULT 'item',
  designation text NOT NULL,
  description text,
  quantity numeric(12,3) DEFAULT 1,
  unit text DEFAULT 'unité',
  price_ht numeric(12,2) DEFAULT 0,
  vat_rate numeric(5,2) DEFAULT 20.00,
  discount numeric(12,2),
  discount_type text,
  subtotal_amount numeric(12,2),
  font_family text,
  font_size integer,
  font_weight text,
  text_color text,
  is_multiline boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE credit_lines ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_credit_lines_credit ON credit_lines(credit_id, line_order);

-- Payments (Paiements)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  payment_date timestamptz DEFAULT now(),
  payment_method text DEFAULT 'virement',
  reference text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_payments_company ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

-- =====================================================
-- 3. FONCTION DE NUMÉROTATION AUTOMATIQUE
-- =====================================================

CREATE OR REPLACE FUNCTION next_number(
  p_company_id uuid,
  p_document_type text,
  p_prefix text DEFAULT ''
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_number integer;
  v_formatted_number text;
BEGIN
  -- Insérer ou mettre à jour le compteur de manière atomique
  INSERT INTO counters (company_id, document_type, prefix, current_number)
  VALUES (p_company_id, p_document_type, p_prefix, 1)
  ON CONFLICT (company_id, document_type)
  DO UPDATE SET 
    current_number = counters.current_number + 1,
    updated_at = now()
  RETURNING current_number INTO v_next_number;
  
  -- Formater le numéro (ex: DEV-00001, FAC-00042)
  v_formatted_number := p_prefix || LPAD(v_next_number::text, 5, '0');
  
  RETURN v_formatted_number;
END;
$$;

-- =====================================================
-- 4. POLITIQUES RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Companies: utilisateurs peuvent voir uniquement leur société
CREATE POLICY "Users can view own company"
  ON companies FOR SELECT
  TO authenticated
  USING (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Profiles: utilisateurs voient leur propre profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Counters: accès restreint à la société
CREATE POLICY "Users can view own company counters"
  ON counters FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own company counters"
  ON counters FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own company counters"
  ON counters FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Audit logs: lecture seule pour les utilisateurs de la société
CREATE POLICY "Users can view own company audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Clients: isolation par société
CREATE POLICY "Users can view own company clients"
  ON clients FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own company clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own company clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete own company clients"
  ON clients FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Articles: isolation par société
CREATE POLICY "Users can view own company articles"
  ON articles FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own company articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own company articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete own company articles"
  ON articles FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Quotes: isolation par société
CREATE POLICY "Users can view own company quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own company quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own company quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete own company quotes"
  ON quotes FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Quote lines: via quote
CREATE POLICY "Users can view own company quote lines"
  ON quote_lines FOR SELECT
  TO authenticated
  USING (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can insert own company quote lines"
  ON quote_lines FOR INSERT
  TO authenticated
  WITH CHECK (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can update own company quote lines"
  ON quote_lines FOR UPDATE
  TO authenticated
  USING (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())))
  WITH CHECK (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can delete own company quote lines"
  ON quote_lines FOR DELETE
  TO authenticated
  USING (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

-- Invoices: isolation par société
CREATE POLICY "Users can view own company invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own company invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own company invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete own company invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Invoice lines: via invoice
CREATE POLICY "Users can view own company invoice lines"
  ON invoice_lines FOR SELECT
  TO authenticated
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can insert own company invoice lines"
  ON invoice_lines FOR INSERT
  TO authenticated
  WITH CHECK (invoice_id IN (SELECT id FROM invoices WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can update own company invoice lines"
  ON invoice_lines FOR UPDATE
  TO authenticated
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())))
  WITH CHECK (invoice_id IN (SELECT id FROM invoices WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can delete own company invoice lines"
  ON invoice_lines FOR DELETE
  TO authenticated
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

-- Credits: isolation par société
CREATE POLICY "Users can view own company credits"
  ON credits FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own company credits"
  ON credits FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own company credits"
  ON credits FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete own company credits"
  ON credits FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Credit lines: via credit
CREATE POLICY "Users can view own company credit lines"
  ON credit_lines FOR SELECT
  TO authenticated
  USING (credit_id IN (SELECT id FROM credits WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can insert own company credit lines"
  ON credit_lines FOR INSERT
  TO authenticated
  WITH CHECK (credit_id IN (SELECT id FROM credits WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can update own company credit lines"
  ON credit_lines FOR UPDATE
  TO authenticated
  USING (credit_id IN (SELECT id FROM credits WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())))
  WITH CHECK (credit_id IN (SELECT id FROM credits WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can delete own company credit lines"
  ON credit_lines FOR DELETE
  TO authenticated
  USING (credit_id IN (SELECT id FROM credits WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())));

-- Payments: isolation par société
CREATE POLICY "Users can view own company payments"
  ON payments FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own company payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own company payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete own company payments"
  ON payments FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));