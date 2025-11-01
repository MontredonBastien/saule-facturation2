import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SuperAdminStatus {
  isSuperAdmin: boolean;
  loading: boolean;
  superAdminId?: string;
}

/**
 * Hook pour vérifier si l'utilisateur actuel est un super-admin
 *
 * En mode démo (sans auth Supabase), on vérifie par email stocké localement
 * En mode production, on vérifie via auth.uid()
 */
export function useSuperAdmin(): SuperAdminStatus {
  const [status, setStatus] = useState<SuperAdminStatus>({
    isSuperAdmin: false,
    loading: true,
  });

  useEffect(() => {
    checkSuperAdminStatus();
  }, []);

  const checkSuperAdminStatus = async () => {
    try {
      // Récupérer l'email de l'utilisateur actuel
      // En mode démo, on utilise localStorage
      const demoSession = localStorage.getItem('demoSession');
      let userEmail: string | null = null;

      if (demoSession) {
        try {
          const session = JSON.parse(demoSession);
          userEmail = session.email;
        } catch (e) {
          console.error('Erreur parsing demoSession:', e);
        }
      }

      // En mode production avec Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userEmail = user.email;
      }

      // Si pas d'email, pas de super-admin
      if (!userEmail) {
        setStatus({ isSuperAdmin: false, loading: false });
        return;
      }

      // Vérifier si cet email est dans la table super_admins
      const { data, error } = await supabase
        .from('super_admins')
        .select('id, is_active')
        .eq('email', userEmail)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Erreur vérification super-admin:', error);
        setStatus({ isSuperAdmin: false, loading: false });
        return;
      }

      setStatus({
        isSuperAdmin: !!data,
        loading: false,
        superAdminId: data?.id,
      });
    } catch (error) {
      console.error('Erreur vérification super-admin:', error);
      setStatus({ isSuperAdmin: false, loading: false });
    }
  };

  return status;
}
