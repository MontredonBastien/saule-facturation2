import React, { useState, useEffect } from 'react';
import { Plus, Users as UsersIcon, Shield, Eye, EyeOff, Trash2, CreditCard as EditIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AppUser, Role } from '../types/user';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';
import UserPermissionsForm from '../components/UserPermissionsForm';
import QuotaAlert from '../components/QuotaAlert';

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPermissionsForm, setShowPermissionsForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | undefined>();
  const [permissionsUser, setPermissionsUser] = useState<AppUser | undefined>();
  const [companyId, setCompanyId] = useState<string | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResult, rolesResult] = await Promise.all([
        supabase
          .from('app_users')
          .select(`
            *,
            role:roles(*)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('roles')
          .select('*')
          .order('display_name')
      ]);

      if (usersResult.data) setUsers(usersResult.data);
      if (rolesResult.data) setRoles(rolesResult.data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: AppUser) => {
    try {
      const { error } = await supabase
        .from('app_users')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Erreur modification statut:', error);
      alert('Erreur lors de la modification du statut');
    }
  };

  const handleDelete = async (user: AppUser) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.full_name}" ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('app_users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleEdit = (user: AppUser) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleManagePermissions = (user: AppUser) => {
    setPermissionsUser(user);
    setShowPermissionsForm(true);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
              <p className="text-gray-600 mt-1">Gérez les utilisateurs et leurs permissions</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingUser(undefined);
              setShowUserForm(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvel utilisateur
          </button>
        </div>
      </div>

      <QuotaAlert companyId={companyId} />

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Chargement...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur</h3>
          <p className="text-gray-600 mb-6">Commencez par créer votre premier utilisateur</p>
          <button
            onClick={() => {
              setEditingUser(undefined);
              setShowUserForm(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Créer un utilisateur
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role?.display_name || 'Aucun rôle'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.is_active ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString('fr-FR')
                      : 'Jamais'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleManagePermissions(user)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                        title="Gérer les permissions"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 text-gray-600 hover:text-gray-900"
                        title="Modifier"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-1 text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal formulaire utilisateur */}
      <Modal
        isOpen={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setEditingUser(undefined);
        }}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        size="lg"
      >
        <UserForm
          user={editingUser}
          roles={roles}
          onSave={async () => {
            await loadData();
            setShowUserForm(false);
            setEditingUser(undefined);
          }}
          onClose={() => {
            setShowUserForm(false);
            setEditingUser(undefined);
          }}
        />
      </Modal>

      {/* Modal permissions personnalisées */}
      <Modal
        isOpen={showPermissionsForm}
        onClose={() => {
          setShowPermissionsForm(false);
          setPermissionsUser(undefined);
        }}
        title={`Permissions de ${permissionsUser?.full_name}`}
        size="xl"
      >
        {permissionsUser && (
          <UserPermissionsForm
            user={permissionsUser}
            onClose={() => {
              setShowPermissionsForm(false);
              setPermissionsUser(undefined);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
