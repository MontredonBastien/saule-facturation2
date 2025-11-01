/**
 * Utilitaires pour générer et vérifier les hash de documents
 * Conforme à la loi antifraude TVA (inaltérabilité des données)
 */

/**
 * Génère un hash SHA-256 d'un document
 * @param documentData - Données du document à hasher
 * @returns Hash SHA-256 en hexadécimal
 */
export async function generateDocumentHash(documentData: any): Promise<string> {
  // Normaliser les données (ordre alphabétique des clés pour cohérence)
  const normalized = JSON.stringify(documentData, Object.keys(documentData).sort());

  // Convertir en ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);

  // Générer le hash SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convertir en hexadécimal
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Vérifie qu'un document n'a pas été modifié
 * @param documentData - Données du document
 * @param expectedHash - Hash attendu
 * @returns true si le hash correspond, false sinon
 */
export async function verifyDocumentHash(
  documentData: any,
  expectedHash: string
): Promise<boolean> {
  const calculatedHash = await generateDocumentHash(documentData);
  return calculatedHash === expectedHash;
}

/**
 * Extrait les données pertinentes pour le hash d'un devis
 */
export function extractQuoteHashData(quote: any) {
  return {
    number: quote.number,
    clientId: quote.clientId,
    createdAt: quote.createdAt,
    validUntil: quote.validUntil,
    lines: quote.lines,
    totalHT: quote.totalHT,
    totalVAT: quote.totalVAT,
    totalTTC: quote.totalTTC,
    globalDiscount: quote.globalDiscount,
    globalDiscountType: quote.globalDiscountType,
  };
}

/**
 * Extrait les données pertinentes pour le hash d'une facture
 */
export function extractInvoiceHashData(invoice: any) {
  return {
    number: invoice.number,
    clientId: invoice.clientId,
    issuedAt: invoice.issuedAt,
    dueDate: invoice.dueDate,
    lines: invoice.lines,
    totalHT: invoice.totalHT,
    totalVAT: invoice.totalVAT,
    totalTTC: invoice.totalTTC,
    globalDiscount: invoice.globalDiscount,
    globalDiscountType: invoice.globalDiscountType,
    depositAmount: invoice.depositAmount,
  };
}

/**
 * Extrait les données pertinentes pour le hash d'un avoir
 */
export function extractCreditHashData(credit: any) {
  return {
    number: credit.number,
    clientId: credit.clientId,
    createdAt: credit.createdAt,
    invoiceId: credit.invoiceId,
    lines: credit.lines,
    totalHT: credit.totalHT,
    totalVAT: credit.totalVAT,
    totalTTC: credit.totalTTC,
    reason: credit.reason,
    globalDiscount: credit.globalDiscount,
    globalDiscountType: credit.globalDiscountType,
  };
}

/**
 * Génère un hash avec chaînage (inclut le hash du document précédent)
 * Permet de créer une blockchain simplifiée pour garantir l'inaltérabilité
 */
export async function generateChainedHash(
  documentData: any,
  previousHash: string | null
): Promise<string> {
  const dataWithChain = {
    ...documentData,
    previousHash: previousHash || '0000000000000000000000000000000000000000000000000000000000000000',
  };

  return generateDocumentHash(dataWithChain);
}
