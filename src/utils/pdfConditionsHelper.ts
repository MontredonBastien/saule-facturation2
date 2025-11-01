import { Settings } from '../types';

/**
 * Fonction pour récupérer les conditions générales à afficher dans les PDFs
 */
export function getPDFConditions(settings: Settings, document: any, documentType: 'quote' | 'invoice' | 'credit'): string | null {
  if (!settings?.documentTemplate?.conditions) {
    return null;
  }

  const conditions = settings.documentTemplate.conditions;

  const conditionsToShow = [];

  // CGV basées sur le document spécifique
  if (conditions.cgv && conditions.cgv.trim() && document.showCgv) {
      conditionsToShow.push('CONDITIONS GÉNÉRALES DE VENTE\n\n' + conditions.cgv.trim());
  }

  // CGL basées sur le document spécifique
  if (conditions.cgl && conditions.cgl.trim() && document.showCgl) {
      conditionsToShow.push('CONDITIONS GÉNÉRALES DE LOCATION\n\n' + conditions.cgl.trim());
  }

  const result = conditionsToShow.length > 0 ? conditionsToShow.join('\n\n---\n\n') : null;
  return result;
}