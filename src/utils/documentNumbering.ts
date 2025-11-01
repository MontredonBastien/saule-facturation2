import { supabase } from '../lib/supabase';

/**
 * Types de documents supportés
 */
export type DocumentType = 'quote' | 'invoice' | 'credit';

/**
 * Configuration de la numérotation
 */
interface NumberingConfig {
  quote: { prefix: string };
  invoice: { prefix: string };
  credit: { prefix: string };
}

/**
 * Configuration par défaut des préfixes
 */
const DEFAULT_PREFIXES: NumberingConfig = {
  quote: { prefix: 'DEV-' },
  invoice: { prefix: 'FAC-' },
  credit: { prefix: 'AVO-' },
};

/**
 * Génère le prochain numéro de document de manière atomique
 * @param companyId - ID de la société
 * @param documentType - Type de document (quote, invoice, credit)
 * @param prefix - Préfixe personnalisé (optionnel)
 * @returns Promise<string> - Numéro de document formaté (ex: "FAC-00001")
 */
export async function getNextDocumentNumber(
  companyId: string,
  documentType: DocumentType,
  prefix?: string
): Promise<string> {
  try {
    // Utiliser le préfixe fourni ou le préfixe par défaut
    const docPrefix = prefix || DEFAULT_PREFIXES[documentType].prefix;

    // Appeler la fonction RPC Supabase pour obtenir le prochain numéro
    const { data, error } = await supabase.rpc('next_number', {
      p_company_id: companyId,
      p_document_type: documentType,
      p_prefix: docPrefix,
    });

    if (error) {
      console.error('Erreur lors de la génération du numéro de document:', error);
      throw error;
    }

    return data as string;
  } catch (error) {
    console.error('Erreur lors de la génération du numéro de document:', error);
    // Fallback: générer un numéro temporaire
    const timestamp = Date.now();
    const prefix = prefix || DEFAULT_PREFIXES[documentType].prefix;
    return `${prefix}TEMP-${timestamp}`;
  }
}

/**
 * Vérifie si un numéro de document existe déjà
 * @param companyId - ID de la société
 * @param documentType - Type de document
 * @param number - Numéro à vérifier
 * @returns Promise<boolean> - true si le numéro existe déjà
 */
export async function documentNumberExists(
  companyId: string,
  documentType: DocumentType,
  number: string
): Promise<boolean> {
  try {
    const tableName = documentType === 'quote' ? 'quotes' :
                      documentType === 'invoice' ? 'invoices' : 'credits';

    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .eq('company_id', companyId)
      .eq('number', number)
      .maybeSingle();

    if (error) {
      console.error('Erreur lors de la vérification du numéro:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Erreur lors de la vérification du numéro:', error);
    return false;
  }
}

/**
 * Récupère le dernier numéro utilisé pour un type de document
 * @param companyId - ID de la société
 * @param documentType - Type de document
 * @returns Promise<string | null> - Dernier numéro ou null
 */
export async function getLastDocumentNumber(
  companyId: string,
  documentType: DocumentType
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('counters')
      .select('current_number, prefix')
      .eq('company_id', companyId)
      .eq('document_type', documentType)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const paddedNumber = String(data.current_number).padStart(5, '0');
    return `${data.prefix}${paddedNumber}`;
  } catch (error) {
    console.error('Erreur lors de la récupération du dernier numéro:', error);
    return null;
  }
}

/**
 * Réinitialise le compteur pour un type de document
 * ATTENTION: Cette fonction doit être utilisée avec précaution
 * @param companyId - ID de la société
 * @param documentType - Type de document
 * @param newValue - Nouvelle valeur du compteur (défaut: 0)
 * @returns Promise<boolean> - true si la réinitialisation a réussi
 */
export async function resetDocumentCounter(
  companyId: string,
  documentType: DocumentType,
  newValue: number = 0
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('counters')
      .update({ current_number: newValue, updated_at: new Date().toISOString() })
      .eq('company_id', companyId)
      .eq('document_type', documentType);

    if (error) {
      console.error('Erreur lors de la réinitialisation du compteur:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du compteur:', error);
    return false;
  }
}
