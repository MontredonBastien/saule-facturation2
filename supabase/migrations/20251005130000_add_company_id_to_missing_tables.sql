/*
  # Ajout de company_id aux tables manquantes

  ## Description
  Ajoute la colonne company_id aux tables qui n'en ont pas encore pour permettre
  l'isolation multi-entreprises.

  ## Tables modifiées
    - equipment : Ajout de company_id
    - rentals : Ajout de company_id  
    - rental_items : Ajout de company_id (optionnel, via rental)

  ## Sécurité
  Toutes les valeurs existantes auront company_id = NULL temporairement.
  En production, vous devrez assigner les company_id corrects.
*/

-- Ajouter company_id à equipment si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'equipment' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE equipment ADD COLUMN company_id uuid REFERENCES companies(id);
    CREATE INDEX IF NOT EXISTS idx_equipment_company_id ON equipment(company_id);
  END IF;
END $$;

-- Ajouter company_id à rentals si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rentals' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE rentals ADD COLUMN company_id uuid REFERENCES companies(id);
    CREATE INDEX IF NOT EXISTS idx_rentals_company_id ON rentals(company_id);
  END IF;
END $$;

-- rental_items n'a pas besoin de company_id direct car il est lié via rental
-- Mais on peut l'ajouter pour optimiser les requêtes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_items' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE rental_items ADD COLUMN company_id uuid REFERENCES companies(id);
    CREATE INDEX IF NOT EXISTS idx_rental_items_company_id ON rental_items(company_id);
  END IF;
END $$;
