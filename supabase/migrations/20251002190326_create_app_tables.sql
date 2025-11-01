/*
  # Schéma initial pour FacturApp

  1. Nouvelles tables
    - `app_settings` - Paramètres globaux de l'application
    - `articles` - Catalogue de produits/services  
    - `quotes` - Devis
    - `quote_lines` - Lignes de devis
    - `invoices_custom` - Factures personnalisées
    - `invoice_lines_custom` - Lignes de factures
    - `credits` - Avoirs
    - `credit_lines` - Lignes d'avoirs
    - `audit_logs` - Journal d'audit
    
  2. Sécurité
    - Activation RLS sur toutes les tables
    - Politiques d'accès basées sur l'entreprise
*/

-- Table des paramètres d'application
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  settings_data jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Table des articles/produits
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  unit text DEFAULT 'unité',
  price_ht numeric DEFAULT 0,
  vat_rate numeric DEFAULT 20,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des devis
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE RESTRICT,
  number text,
  status text DEFAULT 'draft',
  reference text,
  valid_until date,
  total_ht numeric DEFAULT 0,
  total_vat numeric DEFAULT 0,
  total_ttc numeric DEFAULT 0,
  deposit_percentage numeric DEFAULT 0,
  deposit_amount numeric DEFAULT 0,
  comments text,
  show_comments boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des lignes de devis
CREATE TABLE IF NOT EXISTS quote_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  designation text NOT NULL,
  description text,
  quantity numeric DEFAULT 1,
  unit text DEFAULT 'unité',
  price_ht numeric DEFAULT 0,
  vat_rate numeric DEFAULT 20,
  total_ht numeric DEFAULT 0,
  line_order integer DEFAULT 0
);

-- Table des factures personnalisées
CREATE TABLE IF NOT EXISTS invoices_custom (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE RESTRICT,
  number text,
  status text DEFAULT 'draft',
  reference text,
  issued_at date DEFAULT CURRENT_DATE,
  due_date date,
  payment_method text DEFAULT 'virement',
  total_ht numeric DEFAULT 0,
  total_vat numeric DEFAULT 0,
  total_ttc numeric DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  remaining_amount numeric DEFAULT 0,
  comments text,
  created_at timestamptz DEFAULT now()
);

-- Table des lignes de factures
CREATE TABLE IF NOT EXISTS invoice_lines_custom (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices_custom(id) ON DELETE CASCADE,
  designation text NOT NULL,
  description text,
  quantity numeric DEFAULT 1,
  unit text DEFAULT 'unité',
  price_ht numeric DEFAULT 0,
  vat_rate numeric DEFAULT 20,
  total_ht numeric DEFAULT 0,
  line_order integer DEFAULT 0
);

-- Table des avoirs
CREATE TABLE IF NOT EXISTS credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_id uuid REFERENCES invoices_custom(id) ON DELETE SET NULL,
  number text,
  status text DEFAULT 'draft',
  reason text NOT NULL,
  total_ht numeric DEFAULT 0,
  total_vat numeric DEFAULT 0,
  total_ttc numeric DEFAULT 0,
  comments text,
  created_at timestamptz DEFAULT now()
);

-- Table des lignes d'avoirs
CREATE TABLE IF NOT EXISTS credit_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id uuid REFERENCES credits(id) ON DELETE CASCADE,
  designation text NOT NULL,
  description text,
  quantity numeric DEFAULT 1,
  unit text DEFAULT 'unité',
  price_ht numeric DEFAULT 0,
  vat_rate numeric DEFAULT 20,
  total_ht numeric DEFAULT 0,
  line_order integer DEFAULT 0
);

-- Table du journal d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  user_name text,
  action text NOT NULL,
  module text NOT NULL,
  entity_id uuid,
  entity_type text,
  details text,
  created_at timestamptz DEFAULT now()
);

-- Activation de RLS sur toutes les tables
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;  
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_custom ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines_custom ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les paramètres d'application
CREATE POLICY "app_settings_company_policy" ON app_settings
  FOR ALL TO authenticated
  USING (company_id = (SELECT company_id FROM v_user_company));

-- Politiques RLS pour les articles
CREATE POLICY "articles_company_policy" ON articles
  FOR ALL TO authenticated  
  USING (company_id = (SELECT company_id FROM v_user_company));

-- Politiques RLS pour les devis
CREATE POLICY "quotes_company_policy" ON quotes
  FOR ALL TO authenticated
  USING (company_id = (SELECT company_id FROM v_user_company));

CREATE POLICY "quote_lines_company_policy" ON quote_lines
  FOR ALL TO authenticated
  USING (quote_id IN (
    SELECT id FROM quotes 
    WHERE company_id = (SELECT company_id FROM v_user_company)
  ));

-- Politiques RLS pour les factures
CREATE POLICY "invoices_custom_company_policy" ON invoices_custom
  FOR ALL TO authenticated
  USING (company_id = (SELECT company_id FROM v_user_company));

CREATE POLICY "invoice_lines_custom_company_policy" ON invoice_lines_custom
  FOR ALL TO authenticated
  USING (invoice_id IN (
    SELECT id FROM invoices_custom 
    WHERE company_id = (SELECT company_id FROM v_user_company)
  ));

-- Politiques RLS pour les avoirs
CREATE POLICY "credits_company_policy" ON credits
  FOR ALL TO authenticated
  USING (company_id = (SELECT company_id FROM v_user_company));

CREATE POLICY "credit_lines_company_policy" ON credit_lines
  FOR ALL TO authenticated
  USING (credit_id IN (
    SELECT id FROM credits 
    WHERE company_id = (SELECT company_id FROM v_user_company)
  ));

-- Politiques RLS pour l'audit
CREATE POLICY "audit_logs_company_policy" ON audit_logs
  FOR ALL TO authenticated
  USING (company_id = (SELECT company_id FROM v_user_company));

-- Fonction pour calculer les totaux automatiquement
CREATE OR REPLACE FUNCTION calculate_line_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_ht = NEW.quantity * NEW.price_ht;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour calculer les totaux des lignes
CREATE TRIGGER quote_lines_calculate_total
  BEFORE INSERT OR UPDATE ON quote_lines
  FOR EACH ROW EXECUTE FUNCTION calculate_line_total();

CREATE TRIGGER invoice_lines_custom_calculate_total
  BEFORE INSERT OR UPDATE ON invoice_lines_custom
  FOR EACH ROW EXECUTE FUNCTION calculate_line_total();

CREATE TRIGGER credit_lines_calculate_total
  BEFORE INSERT OR UPDATE ON credit_lines
  FOR EACH ROW EXECUTE FUNCTION calculate_line_total();
