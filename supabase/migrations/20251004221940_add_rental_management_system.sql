/*
  # Add Rental Management System

  1. New Tables
    - `equipment`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text) - Equipment name
      - `description` (text) - Detailed description
      - `reference` (text) - Internal reference number
      - `category` (text) - Equipment category
      - `purchase_price` (decimal) - Purchase price
      - `purchase_date` (date) - Purchase date
      - `status` (text) - available, rented, maintenance, retired
      - `quantity_total` (integer) - Total quantity owned
      - `quantity_available` (integer) - Currently available quantity
      - `daily_rate` (decimal) - Daily rental rate
      - `weekly_rate` (decimal) - Weekly rental rate
      - `monthly_rate` (decimal) - Monthly rental rate
      - `deposit_amount` (decimal) - Security deposit amount
      - `image_url` (text) - Equipment image
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `rentals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `client_id` (uuid, foreign key to clients)
      - `rental_number` (text, unique) - LOC-YYYY-NNNN
      - `start_date` (date) - Rental start date
      - `end_date` (date) - Rental end date
      - `actual_return_date` (date) - Actual return date
      - `status` (text) - draft, confirmed, ongoing, completed, cancelled, overdue
      - `subtotal` (decimal) - Subtotal before tax
      - `tax_amount` (decimal) - Tax amount
      - `total` (decimal) - Total amount
      - `deposit_paid` (decimal) - Deposit amount paid
      - `deposit_returned` (decimal) - Deposit amount returned
      - `payment_status` (text) - pending, partial, paid, refunded
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `rental_items`
      - `id` (uuid, primary key)
      - `rental_id` (uuid, foreign key to rentals)
      - `equipment_id` (uuid, foreign key to equipment)
      - `quantity` (integer) - Quantity rented
      - `daily_rate` (decimal) - Rate at time of rental
      - `weekly_rate` (decimal) - Rate at time of rental
      - `monthly_rate` (decimal) - Rate at time of rental
      - `applied_rate` (decimal) - Actual rate applied
      - `rate_type` (text) - daily, weekly, monthly, custom
      - `days_count` (integer) - Number of days
      - `subtotal` (decimal) - Line subtotal
      - `notes` (text) - Item-specific notes
      - `created_at` (timestamptz)
    
    - `equipment_maintenance`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `equipment_id` (uuid, foreign key to equipment)
      - `maintenance_date` (date) - Maintenance date
      - `maintenance_type` (text) - repair, inspection, cleaning, other
      - `description` (text) - Maintenance description
      - `cost` (decimal) - Maintenance cost
      - `performed_by` (text) - Who performed the maintenance
      - `next_maintenance_date` (date) - Next scheduled maintenance
      - `status` (text) - scheduled, completed, cancelled
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
*/

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  reference text DEFAULT '',
  category text DEFAULT '',
  purchase_price decimal(10,2) DEFAULT 0,
  purchase_date date,
  status text DEFAULT 'available',
  quantity_total integer DEFAULT 1,
  quantity_available integer DEFAULT 1,
  daily_rate decimal(10,2) DEFAULT 0,
  weekly_rate decimal(10,2) DEFAULT 0,
  monthly_rate decimal(10,2) DEFAULT 0,
  deposit_amount decimal(10,2) DEFAULT 0,
  image_url text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE RESTRICT NOT NULL,
  rental_number text UNIQUE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  actual_return_date date,
  status text DEFAULT 'draft',
  subtotal decimal(10,2) DEFAULT 0,
  tax_amount decimal(10,2) DEFAULT 0,
  total decimal(10,2) DEFAULT 0,
  deposit_paid decimal(10,2) DEFAULT 0,
  deposit_returned decimal(10,2) DEFAULT 0,
  payment_status text DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rental_items table
CREATE TABLE IF NOT EXISTS rental_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid REFERENCES rentals(id) ON DELETE CASCADE NOT NULL,
  equipment_id uuid REFERENCES equipment(id) ON DELETE RESTRICT NOT NULL,
  quantity integer DEFAULT 1,
  daily_rate decimal(10,2) DEFAULT 0,
  weekly_rate decimal(10,2) DEFAULT 0,
  monthly_rate decimal(10,2) DEFAULT 0,
  applied_rate decimal(10,2) DEFAULT 0,
  rate_type text DEFAULT 'daily',
  days_count integer DEFAULT 1,
  subtotal decimal(10,2) DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create equipment_maintenance table
CREATE TABLE IF NOT EXISTS equipment_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  maintenance_date date NOT NULL,
  maintenance_type text DEFAULT 'inspection',
  description text DEFAULT '',
  cost decimal(10,2) DEFAULT 0,
  performed_by text DEFAULT '',
  next_maintenance_date date,
  status text DEFAULT 'completed',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_maintenance ENABLE ROW LEVEL SECURITY;

-- Policies for equipment
CREATE POLICY "Users can view own equipment"
  ON equipment FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment"
  ON equipment FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment"
  ON equipment FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for rentals
CREATE POLICY "Users can view own rentals"
  ON rentals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rentals"
  ON rentals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rentals"
  ON rentals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own rentals"
  ON rentals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for rental_items
CREATE POLICY "Users can view own rental items"
  ON rental_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_items.rental_id
      AND rentals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own rental items"
  ON rental_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_items.rental_id
      AND rentals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own rental items"
  ON rental_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_items.rental_id
      AND rentals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_items.rental_id
      AND rentals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own rental items"
  ON rental_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_items.rental_id
      AND rentals.user_id = auth.uid()
    )
  );

-- Policies for equipment_maintenance
CREATE POLICY "Users can view own equipment maintenance"
  ON equipment_maintenance FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment maintenance"
  ON equipment_maintenance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment maintenance"
  ON equipment_maintenance FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment maintenance"
  ON equipment_maintenance FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_equipment_user_id ON equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_rentals_user_id ON rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_rentals_client_id ON rentals(client_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_dates ON rentals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rental_items_rental_id ON rental_items(rental_id);
CREATE INDEX IF NOT EXISTS idx_rental_items_equipment_id ON rental_items(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_equipment_id ON equipment_maintenance(equipment_id);