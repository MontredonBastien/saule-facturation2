import { AccessLevel } from '../types/user';
import { Quote, Invoice, Credit } from '../types';

export function filterDocumentsByPermission<T extends Quote | Invoice | Credit>(
  documents: T[],
  accessLevel: AccessLevel,
  currentUserId?: string
): T[] {
  switch (accessLevel) {
    case 'all':
      return documents;

    case 'own':
      if (!currentUserId) return [];
      return documents.filter(doc => (doc as any).created_by_user_id === currentUserId);

    case 'team':
      // Future: filtrer par équipe
      // Pour l'instant, équivalent à 'all'
      return documents;

    case 'none':
    default:
      return [];
  }
}

export function canEditDocument<T extends Quote | Invoice | Credit>(
  document: T,
  accessLevel: AccessLevel,
  currentUserId?: string
): boolean {
  if (accessLevel === 'none') return false;
  if (accessLevel === 'all') return true;
  if (accessLevel === 'own') {
    return (document as any).created_by_user_id === currentUserId;
  }
  return false;
}

export function canDeleteDocument<T extends Quote | Invoice | Credit>(
  document: T,
  accessLevel: AccessLevel,
  currentUserId?: string
): boolean {
  // Même logique que l'édition
  return canEditDocument(document, accessLevel, currentUserId);
}
