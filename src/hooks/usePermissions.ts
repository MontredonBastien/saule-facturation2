import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ModuleName, ActionName, AccessLevel, PermissionMatrix } from '../types/user';

export function usePermissions() {
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      // Récupérer l'utilisateur Supabase actuel
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setPermissionMatrix({});
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Récupérer l'utilisateur de l'application
      const { data: appUser, error: userError } = await supabase
        .from('app_users')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('auth_user_id', authUser.id)
        .single();

      if (userError || !appUser) {
        // Utilisateur non configuré = accès admin par défaut (mode démo)
        setIsAdmin(true);
        setPermissionMatrix(createFullAccessMatrix());
        setLoading(false);
        return;
      }

      setCurrentUserId(appUser.id);

      // Vérifier si admin
      const adminStatus = appUser.role?.name === 'admin';
      setIsAdmin(adminStatus);

      if (adminStatus) {
        setPermissionMatrix(createFullAccessMatrix());
        setLoading(false);
        return;
      }

      // Charger les permissions du rôle
      const { data: rolePerms, error: roleError } = await supabase
        .from('role_permissions')
        .select('*, permission:permissions(*)')
        .eq('role_id', appUser.role_id);

      if (roleError) throw roleError;

      // Charger les permissions personnalisées
      const { data: customPerms, error: customError } = await supabase
        .from('user_custom_permissions')
        .select('*, permission:permissions(*)')
        .eq('user_id', appUser.id);

      if (customError) throw customError;

      // Construire la matrice de permissions
      const matrix: PermissionMatrix = {};

      // Ajouter les permissions du rôle
      (rolePerms || []).forEach((rp: any) => {
        const perm = rp.permission;
        if (!matrix[perm.module]) {
          matrix[perm.module] = {};
        }
        matrix[perm.module][perm.action] = rp.access_level;
      });

      // Surcharger avec les permissions personnalisées
      (customPerms || []).forEach((cp: any) => {
        const perm = cp.permission;
        if (!matrix[perm.module]) {
          matrix[perm.module] = {};
        }
        matrix[perm.module][perm.action] = cp.access_level;
      });

      setPermissionMatrix(matrix);
    } catch (error) {
      console.error('Erreur chargement permissions:', error);
      // En cas d'erreur, donner un accès complet (mode démo)
      setIsAdmin(true);
      setPermissionMatrix(createFullAccessMatrix());
    } finally {
      setLoading(false);
    }
  };

  const createFullAccessMatrix = (): PermissionMatrix => {
    const modules: ModuleName[] = [
      'dashboard', 'quotes', 'invoices', 'credits', 'articles',
      'clients', 'equipment', 'rentals', 'settings', 'emails', 'users'
    ];
    const actions: ActionName[] = ['view', 'create', 'edit', 'delete', 'validate', 'manage_payments', 'send'];

    const matrix: PermissionMatrix = {};
    modules.forEach(module => {
      matrix[module] = {};
      actions.forEach(action => {
        matrix[module][action] = 'all';
      });
    });

    return matrix;
  };

  const hasPermission = (module: ModuleName, action: ActionName): boolean => {
    if (isAdmin) return true;
    const accessLevel = permissionMatrix[module]?.[action];
    return accessLevel !== 'none' && accessLevel !== undefined;
  };

  const getAccessLevel = (module: ModuleName, action: ActionName): AccessLevel => {
    if (isAdmin) return 'all';
    return permissionMatrix[module]?.[action] || 'none';
  };

  const canAccessModule = (module: ModuleName): boolean => {
    if (isAdmin) return true;
    return hasPermission(module, 'view');
  };

  return {
    permissionMatrix,
    currentUserId,
    isAdmin,
    loading,
    hasPermission,
    getAccessLevel,
    canAccessModule,
    refreshPermissions: loadPermissions
  };
}
