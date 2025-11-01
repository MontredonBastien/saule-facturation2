import { supabase } from '../lib/supabase';

export interface AuditLogEntry {
  action: string;
  module: string;
  entityId?: string;
  entityType?: string;
  details?: string;
}

/**
 * Enregistre une action dans le journal d'audit
 * @param companyId - ID de la société
 * @param logEntry - Entrée du journal d'audit
 * @returns Promise<boolean> - true si l'enregistrement a réussi
 */
export async function logAudit(
  companyId: string,
  logEntry: AuditLogEntry
): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from('audit_logs').insert({
      company_id: companyId,
      user_id: userData?.user?.id || null,
      user_name: userData?.user?.email || 'Système',
      action: logEntry.action,
      module: logEntry.module,
      entity_id: logEntry.entityId,
      entity_type: logEntry.entityType,
      details: logEntry.details,
    });

    if (error) {
      console.error('Erreur lors de l\'enregistrement du journal d\'audit:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du journal d\'audit:', error);
    return false;
  }
}

/**
 * Récupère les entrées du journal d'audit pour une société
 * @param companyId - ID de la société
 * @param filters - Filtres optionnels
 * @returns Promise avec les entrées du journal
 */
export async function getAuditLogs(
  companyId: string,
  filters?: {
    module?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (filters?.module) {
      query = query.eq('module', filters.module);
    }

    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    if (filters?.entityId) {
      query = query.eq('entity_id', filters.entityId);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération du journal d\'audit:', error);
      return { data: [], error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de la récupération du journal d\'audit:', error);
    return { data: [], error };
  }
}
