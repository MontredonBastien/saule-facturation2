import React, { useState, useEffect } from 'react';
import { Shield, Info } from 'lucide-react';
import { AppUser, Permission, RolePermission, UserCustomPermission, AccessLevel } from '../types/user';
import { supabase } from '../lib/supabase';

interface UserPermissionsFormProps {
  user: AppUser;
  onClose: () => void;
}

interface PermissionWithSettings extends Permission {
  roleAccessLevel?: AccessLevel;
  customAccessLevel?: AccessLevel;
  effectiveAccessLevel: AccessLevel;
}

export default function UserPermissionsForm({ user, onClose }: UserPermissionsFormProps) {
  const [permissions, setPermissions] = useState<PermissionWithSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Map<string, AccessLevel>>(new Map());

  useEffect(() => {
    loadPermissions();
  }, [user.id]);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      // Charger toutes les permissions
      const { data: allPermissions, error: permError } = await supabase
        .from('permissions')
        .select('*')
        .order('module', { ascending: true })
        .order('action', { ascending: true });

      if (permError) throw permError;

      // Charger les permissions du rôle
      let rolePermissions: RolePermission[] = [];
      if (user.role_id) {
        const { data: rolePerms, error: roleError } = await supabase
          .from('role_permissions')
          .select('*, permission:permissions(*)')
          .eq('role_id', user.role_id);

        if (roleError) throw roleError;
        rolePermissions = rolePerms || [];
      }

      // Charger les permissions personnalisées de l'utilisateur
      const { data: customPerms, error: customError } = await supabase
        .from('user_custom_permissions')
        .select('*, permission:permissions(*)')
        .eq('user_id', user.id);

      if (customError) throw customError;
      const customPermissions: UserCustomPermission[] = customPerms || [];

      // Combiner les permissions
      const permissionsWithSettings: PermissionWithSettings[] = (allPermissions || []).map(perm => {
        const rolePerm = rolePermissions.find(rp => rp.permission_id === perm.id);
        const customPerm = customPermissions.find(cp => cp.permission_id === perm.id);

        return {
          ...perm,
          roleAccessLevel: rolePerm?.access_level,
          customAccessLevel: customPerm?.access_level,
          effectiveAccessLevel: customPerm?.access_level || rolePerm?.access_level || 'none'
        };
      });

      setPermissions(permissionsWithSettings);
    } catch (error) {
      console.error('Erreur chargement permissions:', error);
      alert('Erreur lors du chargement des permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePermission = (permissionId: string, newAccessLevel: AccessLevel) => {
    const newChanges = new Map(changes);
    newChanges.set(permissionId, newAccessLevel);
    setChanges(newChanges);

    // Mettre à jour l'affichage temporaire
    setPermissions(prevPermissions =>
      prevPermissions.map(perm =>
        perm.id === permissionId
          ? { ...perm, effectiveAccessLevel: newAccessLevel }
          : perm
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Supprimer les anciennes permissions personnalisées
      const { error: deleteError } = await supabase
        .from('user_custom_permissions')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Insérer les nouvelles permissions personnalisées
      if (changes.size > 0) {
        const customPermsToInsert = Array.from(changes.entries()).map(([permissionId, accessLevel]) => ({
          user_id: user.id,
          permission_id: permissionId,
          access_level: accessLevel
        }));

        const { error: insertError } = await supabase
          .from('user_custom_permissions')
          .insert(customPermsToInsert);

        if (insertError) throw insertError;
      }

      alert('Permissions mises à jour avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde permissions:', error);
      alert('Erreur lors de la sauvegarde des permissions');
    } finally {
      setSaving(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, PermissionWithSettings[]>);

  const accessLevelLabels: Record<AccessLevel, string> = {
    all: 'Tous',
    team: 'Équipe',
    own: 'Propres',
    none: 'Aucun'
  };

  const accessLevelColors: Record<AccessLevel, string> = {
    all: 'bg-green-100 text-green-800',
    team: 'bg-blue-100 text-blue-800',
    own: 'bg-yellow-100 text-yellow-800',
    none: 'bg-gray-100 text-gray-800'
  };

  const moduleLabels: Record<string, string> = {
    dashboard: 'Tableau de bord',
    quotes: 'Devis',
    invoices: 'Factures',
    credits: 'Avoirs',
    articles: 'Articles',
    clients: 'Clients',
    equipment: 'Équipements',
    rentals: 'Locations',
    settings: 'Paramètres',
    emails: 'Emails',
    users: 'Utilisateurs'
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des permissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Gestion des permissions personnalisées</p>
            <p>
              Les permissions affichées ci-dessous correspondent au rôle <strong>{user.role?.display_name}</strong>.
              Vous pouvez les personnaliser pour cet utilisateur spécifique.
            </p>
            <ul className="mt-2 space-y-1">
              <li><strong>Tous</strong> : Voir tous les documents de tous les utilisateurs</li>
              <li><strong>Équipe</strong> : Voir les documents de son équipe (fonctionnalité future)</li>
              <li><strong>Propres</strong> : Voir uniquement ses propres documents créés</li>
              <li><strong>Aucun</strong> : Aucun accès à ce module/action</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([module, perms]) => (
          <div key={module} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              {moduleLabels[module] || module}
            </h3>

            <div className="space-y-3">
              {perms.map((perm) => (
                <div key={perm.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {perm.display_name}
                    </div>
                    {perm.description && (
                      <div className="text-xs text-gray-500">{perm.description}</div>
                    )}
                    {perm.roleAccessLevel && !changes.has(perm.id) && (
                      <div className="text-xs text-gray-500 mt-1">
                        Rôle : <span className={`px-2 py-0.5 rounded ${accessLevelColors[perm.roleAccessLevel]}`}>
                          {accessLevelLabels[perm.roleAccessLevel]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {(['all', 'team', 'own', 'none'] as AccessLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => handleChangePermission(perm.id, level)}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          perm.effectiveAccessLevel === level
                            ? accessLevelColors[level]
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {accessLevelLabels[level]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving || changes.size === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? 'Enregistrement...' : `Enregistrer ${changes.size > 0 ? `(${changes.size} modifications)` : ''}`}
        </button>
      </div>
    </div>
  );
}
