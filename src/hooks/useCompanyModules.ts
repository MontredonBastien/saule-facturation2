import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ModuleName } from '../types';

interface CompanyModulesStatus {
  enabledModules: ModuleName[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour récupérer les modules activés pour l'entreprise de l'utilisateur
 *
 * Si aucune configuration n'existe, tous les modules sont activés (rétrocompatibilité)
 * En mode démo, on retourne tous les modules
 */
export function useCompanyModules(companyId?: string): CompanyModulesStatus {
  const [status, setStatus] = useState<CompanyModulesStatus>({
    enabledModules: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadCompanyModules();
  }, [companyId]);

  const loadCompanyModules = async () => {
    try {
      // En mode démo ou sans companyId, activer tous les modules
      if (!companyId) {
        setStatus({
          enabledModules: [
            'dashboard',
            'quotes',
            'invoices',
            'credits',
            'articles',
            'clients',
            'settings',
            'emails',
            'users',
          ],
          loading: false,
          error: null,
        });
        return;
      }

      // Récupérer les modules activés depuis la base
      const { data, error } = await supabase
        .from('company_modules')
        .select('module_name')
        .eq('company_id', companyId)
        .eq('is_enabled', true);

      if (error) {
        console.error('Erreur chargement modules:', error);
        // En cas d'erreur, activer tous les modules (fail-safe)
        setStatus({
          enabledModules: [
            'dashboard',
            'quotes',
            'invoices',
            'credits',
            'articles',
            'clients',
            'settings',
            'emails',
            'users',
          ],
          loading: false,
          error: error.message,
        });
        return;
      }

      // Si aucune configuration n'existe, activer tous les modules (rétrocompatibilité)
      if (!data || data.length === 0) {
        setStatus({
          enabledModules: [
            'dashboard',
            'quotes',
            'invoices',
            'credits',
            'articles',
            'clients',
            'settings',
            'emails',
            'users',
          ],
          loading: false,
          error: null,
        });
        return;
      }

      // Retourner les modules activés
      const modules = data.map((m) => m.module_name as ModuleName);

      // Toujours inclure dashboard et settings (modules essentiels)
      const essentialModules: ModuleName[] = ['dashboard', 'settings'];
      const allModules = [...new Set([...essentialModules, ...modules])];

      setStatus({
        enabledModules: allModules,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Erreur chargement modules:', error);
      // Fail-safe: activer tous les modules
      setStatus({
        enabledModules: [
          'dashboard',
          'quotes',
          'invoices',
          'credits',
          'articles',
          'clients',
          'settings',
          'emails',
          'users',
        ],
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  };

  return status;
}
