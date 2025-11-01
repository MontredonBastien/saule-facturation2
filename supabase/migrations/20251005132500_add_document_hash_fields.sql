/*
  # Ajout des champs de hash pour l'inaltérabilité

  ## Description
  Ajoute les champs hash et previousHash aux tables de documents
  pour garantir l'inaltérabilité conformément à la loi antifraude TVA.

  ## 1. Champs ajoutés
    - `hash` : Hash SHA-256 du document (garantit l'intégrité)
    - `previous_hash` : Hash du document précédent (chaînage blockchain)

  ## 2. Tables modifiées
    - quotes : Devis
    - invoices : Factures
    - credits : Avoirs

  ## 3. Principe du chaînage
  Chaque document contient :
    - Son propre hash (calculé à partir de ses données)
    - Le hash du document précédent (chaînage)
  
  Cela crée une blockchain simplifiée qui garantit :
    - Aucun document ne peut être modifié sans casser la chaîne
    - Aucun document ne peut être supprimé sans casser la chaîne
    - L'ordre chronologique est préservé

  ## 4. Conformité légale
  Conforme à l'article 286, 3° bis du Code général des impôts
  (Loi antifraude TVA du 1er janvier 2018)
*/

-- Ajouter les colonnes hash aux devis
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS hash text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS previous_hash text;

-- Ajouter les colonnes hash aux factures
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS hash text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS previous_hash text;

-- Ajouter les colonnes hash aux avoirs
ALTER TABLE credits ADD COLUMN IF NOT EXISTS hash text;
ALTER TABLE credits ADD COLUMN IF NOT EXISTS previous_hash text;

-- Index pour faciliter la vérification de la chaîne
CREATE INDEX IF NOT EXISTS idx_quotes_hash ON quotes(hash);
CREATE INDEX IF NOT EXISTS idx_quotes_previous_hash ON quotes(previous_hash);

CREATE INDEX IF NOT EXISTS idx_invoices_hash ON invoices(hash);
CREATE INDEX IF NOT EXISTS idx_invoices_previous_hash ON invoices(previous_hash);

CREATE INDEX IF NOT EXISTS idx_credits_hash ON credits(hash);
CREATE INDEX IF NOT EXISTS idx_credits_previous_hash ON credits(previous_hash);

-- Commentaires
COMMENT ON COLUMN quotes.hash IS 'Hash SHA-256 du document pour garantir l''inaltérabilité (loi antifraude TVA)';
COMMENT ON COLUMN quotes.previous_hash IS 'Hash du document précédent pour chaînage blockchain';

COMMENT ON COLUMN invoices.hash IS 'Hash SHA-256 du document pour garantir l''inaltérabilité (loi antifraude TVA)';
COMMENT ON COLUMN invoices.previous_hash IS 'Hash du document précédent pour chaînage blockchain';

COMMENT ON COLUMN credits.hash IS 'Hash SHA-256 du document pour garantir l''inaltérabilité (loi antifraude TVA)';
COMMENT ON COLUMN credits.previous_hash IS 'Hash du document précédent pour chaînage blockchain';
