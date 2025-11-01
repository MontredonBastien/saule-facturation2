/*
  # Ajout du champ forme juridique aux clients

  1. Modifications
    - Ajouter la colonne `legal_form` à la table `clients`
    - Permet de stocker la forme juridique de l'entreprise (SARL, SAS, EURL, etc.)

  2. Notes
    - Champ optionnel (nullable)
    - Utilisé uniquement pour les clients professionnels
*/

-- Ajouter la colonne legal_form si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'legal_form'
  ) THEN
    ALTER TABLE clients ADD COLUMN legal_form text;
  END IF;
END $$;
