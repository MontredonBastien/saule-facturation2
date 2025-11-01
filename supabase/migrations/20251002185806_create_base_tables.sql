/*
  # Cr\u00e9ation des tables de base

  1. Nouvelles Tables
    - `companies` - Entreprises (multi-tenant)
      - `id` (uuid, primary key)
      - `name` (text, nom de l'entreprise)
      - `siret` (text, num\u00e9ro SIRET)
      - `vat_number` (text, num\u00e9ro TVA intracommunautaire)
      - `address` (text, adresse compl\u00e8te)
      - `zip_code` (text, code postal)
      - `city` (text, ville)
      - `country` (text, pays)
      - `phone` (text, t\u00e9l\u00e9phone)
      - `email` (text, email)
      - `website` (text, site web)
      - `logo_url` (text, URL du logo)
      - `created_at` (timestamptz, date de cr\u00e9ation)

    - `profiles` - Profils utilisateurs
      - `id` (uuid, primary key, li\u00e9 \u00e0 auth.users)
      - `company_id` (uuid, foreign key vers companies)
      - `email` (text, email de l'utilisateur)
      - `full_name` (text, nom complet)
      - `role` (text, r\u00f4le dans l'entreprise)
      - `created_at` (timestamptz, date de cr\u00e9ation)

    - `clients` - Clients (professionnels et particuliers)
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key vers companies)
      - `type` (text, 'professional' ou 'individual')
      - `name` (text, nom/raison sociale)
      - `siret` (text, SIRET pour les pros)
      - `vat_number` (text, num\u00e9ro TVA pour les pros)
      - `contact_name` (text, nom du contact)
      - `email` (text, email)
      - `phone` (text, t\u00e9l\u00e9phone)
      - `address` (text, adresse)
      - `zip_code` (text, code postal)
      - `city` (text, ville)
      - `country` (text, pays)
      - `notes` (text, notes internes)
      - `active` (boolean, actif/inactif)
      - `created_at` (timestamptz, date de cr\u00e9ation)

  2. S\u00e9curit\u00e9
    - Enable RLS sur toutes les tables
    - Politiques d'acc\u00e8s bas\u00e9es sur company_id
    - Vue v_user_company pour faciliter les requ\u00eates

  3. Index
    - Index sur company_id pour performance
    - Index sur email pour recherche rapide
*/

-- Table des entreprises
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  siret text,
  vat_number text,
  address text,
  zip_code text,
  city text,
  country text DEFAULT 'France',
  phone text,
  email text,
  website text,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

-- Table des profils utilisateurs (li\u00e9e \u00e0 auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'professional',
  name text NOT NULL,
  siret text,
  vat_number text,
  contact_name text,
  email text,
  phone text,
  address text,
  zip_code text,
  city text,
  country text DEFAULT 'France',
  notes text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Vue pour simplifier l'acc\u00e8s \u00e0 company_id de l'utilisateur connect\u00e9
CREATE OR REPLACE VIEW v_user_company AS
  SELECT company_id
  FROM profiles
  WHERE id = auth.uid();

-- Politiques RLS pour companies
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  TO authenticated
  USING (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Politiques RLS pour profiles
CREATE POLICY "Users can view profiles from their company"
  ON profiles FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Politiques RLS pour clients
CREATE POLICY "Users can view clients from their company"
  ON clients FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert clients in their company"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update clients from their company"
  ON clients FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete clients from their company"
  ON clients FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(active);
