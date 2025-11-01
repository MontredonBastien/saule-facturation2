/*
  # Ajout de contacts multiples pour les clients

  ## Nouvelles Tables

  ### `client_emails`
  Stocke les emails multiples pour chaque client avec une catégorie
  - `id` (uuid, primary key)
  - `client_id` (uuid, foreign key vers clients)
  - `email` (text, NOT NULL)
  - `category` (text, NOT NULL) - Ex: "Comptabilité", "Direction", "Commercial"
  - `is_primary` (boolean) - Email principal
  - `created_at` (timestamptz)

  ### `client_phones`
  Stocke les téléphones multiples pour chaque client avec une catégorie
  - `id` (uuid, primary key)
  - `client_id` (uuid, foreign key vers clients)
  - `phone` (text, NOT NULL)
  - `category` (text, NOT NULL) - Ex: "Bureau", "Mobile", "Fax"
  - `is_primary` (boolean) - Téléphone principal
  - `created_at` (timestamptz)

  ## Sécurité
  - Enable RLS sur les nouvelles tables
  - Politiques pour limiter l'accès aux contacts du même compte utilisateur
*/

-- Table pour les emails multiples
CREATE TABLE IF NOT EXISTS client_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  email text NOT NULL,
  category text NOT NULL DEFAULT 'Principal',
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table pour les téléphones multiples
CREATE TABLE IF NOT EXISTS client_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  phone text NOT NULL,
  category text NOT NULL DEFAULT 'Bureau',
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_client_emails_client_id ON client_emails(client_id);
CREATE INDEX IF NOT EXISTS idx_client_phones_client_id ON client_phones(client_id);

-- Enable RLS
ALTER TABLE client_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_phones ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour client_emails
CREATE POLICY "Users can view emails of their clients"
  ON client_emails FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_emails.client_id
    )
  );

CREATE POLICY "Users can insert emails for their clients"
  ON client_emails FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_emails.client_id
    )
  );

CREATE POLICY "Users can update emails of their clients"
  ON client_emails FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_emails.client_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_emails.client_id
    )
  );

CREATE POLICY "Users can delete emails of their clients"
  ON client_emails FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_emails.client_id
    )
  );

-- Politiques RLS pour client_phones
CREATE POLICY "Users can view phones of their clients"
  ON client_phones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_phones.client_id
    )
  );

CREATE POLICY "Users can insert phones for their clients"
  ON client_phones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_phones.client_id
    )
  );

CREATE POLICY "Users can update phones of their clients"
  ON client_phones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_phones.client_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_phones.client_id
    )
  );

CREATE POLICY "Users can delete phones of their clients"
  ON client_phones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_phones.client_id
    )
  );
