import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit2, Trash2, UserCheck, UserX, Eye, Search, Building } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';

interface AccountantAccess {
  access_id: string;
  company_id: string;
  company_name: string;
  company_siret: string;
  company_email: string;
  accountant_id: string;
  accountant_email: string;
  accountant_name: string;
  accountant_company: string;
  accountant_phone: string;
  access_level: string;
  is_active: boolean;
  granted_at: string;
  last_access: string;
}

const accessLevels = [
  { value: 'readonly', label: 'Lecture seule', description: 'Consultation uniquement' },
  { value: 'editor', label: 'Édition', description: 'Création et modification de documents' },
  { value: 'admin', label: 'Administrateur', description: 'Accès complet sauf paramètres financiers' },
  { value: 'full_admin', label: 'Admin complet', description: 'Accès total incluant finances' }
];

export default function AccountantClientsPage() {
  const [accountants, setAccountants] = useState<AccountantAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccess, setEditingAccess] = useState<AccountantAccess | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);

  // Formulaire
  const [formData, setFormData] = useState({
    accountant_email: '',
    accountant_name: '',
    accountant_company: '',
    accountant_phone: '',
    access_level: 'readonly' as const,
    notes: ''
  });

  useEffect(() => {
    loadCurrentCompany();
  }, []);

  useEffect(() => {
    if (currentCompanyId) {
      loadAccountants();
    }
  }, [currentCompanyId]);

  const loadCurrentCompany = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer l'utilisateur actuel et sa société
      const { data: userData, error: userError } = await supabase
        .from('app_users')
        .select('company_id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError) throw userError;
      setCurrentCompanyId(userData.company_id);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'entreprise:', error);
    }
  };

  const loadAccountants = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('company_accountants_list')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('accountant_name');

      if (error) throw error;

      setAccountants(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des comptables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (access?: AccountantAccess) => {
    if (access) {
      setEditingAccess(access);
      setFormData({
        accountant_email: access.accountant_email,
        accountant_name: access.accountant_name,
        accountant_company: access.accountant_company || '',
        accountant_phone: access.accountant_phone || '',
        access_level: access.access_level as any,
        notes: ''
      });
    } else {
      setEditingAccess(null);
      setFormData({
        accountant_email: '',
        accountant_name: '',
        accountant_company: '',
        accountant_phone: '',
        access_level: 'readonly',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAccess) {
        // Mise à jour du niveau d'accès
        const { error } = await supabase
          .from('accountant_company_access')
          .update({
            access_level: formData.access_level,
            notes: formData.notes
          })
          .eq('id', editingAccess.access_id);

        if (error) throw error;
      } else {
        // Création d'un nouveau comptable et accès
        // 1. Vérifier si le comptable existe déjà
        let { data: existingAccountant, error: searchError } = await supabase
          .from('accountants')
          .select('id')
          .eq('email', formData.accountant_email)
          .maybeSingle();

        if (searchError) throw searchError;

        let accountantId: string;

        if (existingAccountant) {
          accountantId = existingAccountant.id;
        } else {
          // Créer le comptable
          const { data: newAccountant, error: createError } = await supabase
            .from('accountants')
            .insert({
              email: formData.accountant_email,
              full_name: formData.accountant_name,
              company_name: formData.accountant_company,
              phone: formData.accountant_phone
            })
            .select()
            .single();

          if (createError) throw createError;
          accountantId = newAccountant.id;
        }

        // Créer l'accès
        const { error: accessError } = await supabase
          .from('accountant_company_access')
          .insert({
            accountant_id: accountantId,
            company_id: currentCompanyId,
            access_level: formData.access_level,
            notes: formData.notes
          });

        if (accessError) throw accessError;
      }

      await loadAccountants();
      handleCloseModal();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleToggleActive = async (access: AccountantAccess) => {
    try {
      const { error } = await supabase
        .from('accountant_company_access')
        .update({ is_active: !access.is_active })
        .eq('id', access.access_id);

      if (error) throw error;

      await loadAccountants();
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
    }
  };

  const handleDelete = async (accessId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet accès comptable ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('accountant_company_access')
        .delete()
        .eq('id', accessId);

      if (error) throw error;

      await loadAccountants();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const filteredAccountants = accountants.filter(accountant =>
    accountant.accountant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accountant.accountant_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accountant.accountant_company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Comptables</h1>
            <p className="text-gray-600 mt-1">Gérez les accès de vos comptables externes</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter un comptable</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un comptable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Chargement...
          </div>
        ) : filteredAccountants.length === 0 ? (
          <div className="p-8 text-center">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Aucun comptable trouvé' : 'Aucun comptable n\'a accès à votre entreprise'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comptable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cabinet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Niveau d'accès
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernier accès
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccountants.map((accountant) => (
                  <tr key={accountant.access_id} className={!accountant.is_active ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{accountant.accountant_name}</div>
                          <div className="text-sm text-gray-500">{accountant.accountant_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{accountant.accountant_company || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{accountant.accountant_phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        accountant.access_level === 'full_admin' ? 'bg-red-100 text-red-800' :
                        accountant.access_level === 'admin' ? 'bg-purple-100 text-purple-800' :
                        accountant.access_level === 'editor' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {accessLevels.find(l => l.value === accountant.access_level)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {accountant.last_access ? new Date(accountant.last_access).toLocaleDateString('fr-FR') : 'Jamais'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(accountant)}
                        className={`flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full transition ${
                          accountant.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {accountant.is_active ? (
                          <>
                            <UserCheck className="h-3 w-3" />
                            <span>Actif</span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3" />
                            <span>Inactif</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenModal(accountant)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(accountant.access_id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingAccess ? 'Modifier l\'accès comptable' : 'Ajouter un comptable'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email du comptable *
            </label>
            <input
              type="email"
              required
              disabled={!!editingAccess}
              value={formData.accountant_email}
              onChange={(e) => setFormData({ ...formData, accountant_email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          {!editingAccess && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountant_name}
                  onChange={(e) => setFormData({ ...formData, accountant_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du cabinet
                </label>
                <input
                  type="text"
                  value={formData.accountant_company}
                  onChange={(e) => setFormData({ ...formData, accountant_company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.accountant_phone}
                  onChange={(e) => setFormData({ ...formData, accountant_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau d'accès *
            </label>
            <select
              required
              value={formData.access_level}
              onChange={(e) => setFormData({ ...formData, access_level: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {accessLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label} - {level.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Notes internes (optionnel)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingAccess ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
