/*
  # Créer la table des paiements

  1. Nouvelles Tables
    - `payments`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key vers invoices_custom)
      - `company_id` (uuid, foreign key vers companies)
      - `amount` (numeric, montant du paiement)
      - `date` (date, date du paiement)
      - `method` (text, méthode de paiement)
      - `reference` (text, référence du paiement)
      - `notes` (text, notes optionnelles)
      - `created_at` (timestamptz, date de création)

  2. Sécurité
    - Enable RLS on `payments` table
    - Add policy for company-based access
    
  3. Relations
    - Foreign key vers invoices_custom
    - Foreign key vers companies
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices_custom(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  method text NOT NULL DEFAULT 'virement',
  reference text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for company-based access
CREATE POLICY "payments_company_policy" ON payments
  FOR ALL TO authenticated
  USING (company_id = (SELECT company_id FROM v_user_company));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_company_id ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);