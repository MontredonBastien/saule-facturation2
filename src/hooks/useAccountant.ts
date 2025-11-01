import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AccountantInfo {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  phone: string;
  is_active: boolean;
}

interface CompanyAccess {
  company_id: string;
  company_name: string;
  access_level: 'readonly' | 'editor' | 'admin' | 'full_admin';
  is_active: boolean;
}

export function useAccountant() {
  const [isAccountant, setIsAccountant] = useState(false);
  const [accountantInfo, setAccountantInfo] = useState<AccountantInfo | null>(null);
  const [companyAccesses, setCompanyAccesses] = useState<CompanyAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccountantStatus();
  }, []);

  const checkAccountantStatus = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAccountant(false);
        setLoading(false);
        return;
      }

      // Vérifier si l'utilisateur est un comptable
      const { data: accountantData, error: accountantError } = await supabase
        .from('accountants')
        .select('*')
        .eq('auth_user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (accountantError && accountantError.code !== 'PGRST116') {
        throw accountantError;
      }

      if (accountantData) {
        setIsAccountant(true);
        setAccountantInfo(accountantData);

        // Charger les accès aux entreprises
        const { data: accessData, error: accessError } = await supabase
          .from('accountant_companies')
          .select('company_id, company_name, access_level, is_active')
          .eq('accountant_id', accountantData.id);

        if (accessError) throw accessError;

        setCompanyAccesses(accessData || []);
      } else {
        setIsAccountant(false);
        setAccountantInfo(null);
        setCompanyAccesses([]);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut comptable:', error);
      setIsAccountant(false);
    } finally {
      setLoading(false);
    }
  };

  const getAccessLevel = (companyId: string): string | null => {
    const access = companyAccesses.find(a => a.company_id === companyId && a.is_active);
    return access ? access.access_level : null;
  };

  const hasAccess = (companyId: string): boolean => {
    return companyAccesses.some(a => a.company_id === companyId && a.is_active);
  };

  const canEdit = (companyId: string): boolean => {
    const accessLevel = getAccessLevel(companyId);
    return accessLevel === 'editor' || accessLevel === 'admin' || accessLevel === 'full_admin';
  };

  const canAdmin = (companyId: string): boolean => {
    const accessLevel = getAccessLevel(companyId);
    return accessLevel === 'admin' || accessLevel === 'full_admin';
  };

  const canFullAdmin = (companyId: string): boolean => {
    const accessLevel = getAccessLevel(companyId);
    return accessLevel === 'full_admin';
  };

  return {
    isAccountant,
    accountantInfo,
    companyAccesses,
    loading,
    getAccessLevel,
    hasAccess,
    canEdit,
    canAdmin,
    canFullAdmin,
    refetch: checkAccountantStatus
  };
}
