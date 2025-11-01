import React, { useState, useEffect } from 'react';
import { Building2, Users, Package, Settings, Plus, CreditCard as Edit2, Trash2, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Company, CompanySubscription, SubscriptionPlan, ModuleName, CompanyModule, CompanyUsage } from '../types';
import Modal from '../components/Modal';
import { useSuperAdmin } from '../hooks/useSuperAdmin';

interface CompanyWithDetails extends Company {
  subscription?: CompanySubscription;
  modules?: CompanyModule[];
  usage?: CompanyUsage;
}

const SuperAdminPage: React.FC = () => {
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin();
  const [companies, setCompanies] = useState<CompanyWithDetails[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithDetails | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const allModules: { name: ModuleName; displayName: string }[] = [
    { name: 'dashboard', displayName: 'Tableau de bord' },
    { name: 'quotes', displayName: 'Devis' },
    { name: 'invoices', displayName: 'Factures' },
    { name: 'credits', displayName: 'Avoirs' },
    { name: 'articles', displayName: 'Articles' },
    { name: 'clients', displayName: 'Clients' },
    { name: 'settings', displayName: 'Paramètres' },
    { name: 'emails', displayName: 'Emails' },
    { name: 'users', displayName: 'Utilisateurs' },
  ];

  useEffect(() => {
    if (!superAdminLoading && isSuperAdmin) {
      loadData();
    }
  }, [isSuperAdmin, superAdminLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [companiesResult, plansResult] = await Promise.all([
        supabase.from('companies').select('*').order('name'),
        supabase.from('subscription_plans').select('*').order('display_name'),
      ]);

      if (companiesResult.data) {
        const companiesWithDetails = await Promise.all(
          companiesResult.data.map(async (company) => {
            const [subscriptionResult, modulesResult, usageResult] = await Promise.all([
              supabase
                .from('company_subscriptions')
                .select('*, plan:subscription_plans(*)')
                .eq('company_id', company.id)
                .maybeSingle(),
              supabase
                .from('company_modules')
                .select('*')
                .eq('company_id', company.id),
              supabase
                .from('company_usage')
                .select('*')
                .eq('company_id', company.id)
                .maybeSingle(),
            ]);

            return {
              ...company,
              subscription: subscriptionResult.data || undefined,
              modules: modulesResult.data || [],
              usage: usageResult.data || undefined,
            };
          })
        );
        setCompanies(companiesWithDetails);
      }

      if (plansResult.data) {
        setPlans(plansResult.data.map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features : []
        })));
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const openConfigModal = (company: CompanyWithDetails) => {
    setSelectedCompany(company);
    setShowConfigModal(true);
  };

  const closeConfigModal = () => {
    setShowConfigModal(false);
    setSelectedCompany(null);
  };

  const handleSaveConfig = async (config: {
    planId: string;
    maxUsers?: number;
    modules: ModuleName[];
  }) => {
    if (!selectedCompany) return;

    try {
      const { data: subscriptionData } = await supabase
        .from('company_subscriptions')
        .select('id')
        .eq('company_id', selectedCompany.id)
        .maybeSingle();

      if (subscriptionData) {
        await supabase
          .from('company_subscriptions')
          .update({
            plan_id: config.planId,
            custom_max_users: config.maxUsers,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscriptionData.id);
      } else {
        await supabase.from('company_subscriptions').insert({
          company_id: selectedCompany.id,
          plan_id: config.planId,
          custom_max_users: config.maxUsers,
          is_active: true,
        });
      }

      await supabase
        .from('company_modules')
        .delete()
        .eq('company_id', selectedCompany.id);

      if (config.modules.length > 0) {
        await supabase.from('company_modules').insert(
          config.modules.map((moduleName) => ({
            company_id: selectedCompany.id,
            module_name: moduleName,
            is_enabled: true,
          }))
        );
      }

      await loadData();
      closeConfigModal();
    } catch (error) {
      console.error('Erreur sauvegarde configuration:', error);
      alert('Erreur lors de la sauvegarde de la configuration');
    }
  };

  // Afficher le chargement
  if (superAdminLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  // Si pas super-admin, afficher message d'accès refusé
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Accès refusé
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            Seuls les super-administrateurs peuvent gérer les entreprises clientes.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note :</strong> Si vous pensez que c'est une erreur, contactez votre administrateur système.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateCompany = async (companyData: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (error) throw error;

      await loadData();
      setShowCreateModal(false);
      alert('Entreprise créée avec succès !');
    } catch (error) {
      console.error('Erreur création entreprise:', error);
      alert('Erreur lors de la création de l\'entreprise');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super-Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion des entreprises clientes et leurs abonnements
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle entreprise
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Entreprises actives</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Utilisateurs total</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.reduce((sum, c) => sum + (c.usage?.currentUsersCount || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Documents ce mois</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.reduce((sum, c) => sum + (c.usage?.documentsThisMonth || 0), 0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Entreprises clientes</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Utilisateurs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Modules actifs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Documents/mois
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => {
                const maxUsers = company.subscription?.customMaxUsers ||
                               company.subscription?.plan?.maxUsers ||
                               1;
                const currentUsers = company.usage?.currentUsersCount || 0;

                return (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {company.subscription?.plan ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {company.subscription.plan.displayName}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Aucun</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className={currentUsers > maxUsers ? 'text-red-600 font-medium' : 'text-gray-900'}>
                          {currentUsers}
                        </span>
                        <span className="text-gray-400"> / {maxUsers}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {company.modules?.length || 0} modules
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {company.usage?.documentsThisMonth || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openConfigModal(company)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Configurer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showConfigModal && selectedCompany && (
        <CompanyConfigModal
          company={selectedCompany}
          plans={plans}
          allModules={allModules}
          onClose={closeConfigModal}
          onSave={handleSaveConfig}
        />
      )}

      {showCreateModal && (
        <CreateCompanyModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateCompany}
        />
      )}
    </div>
  );
};

interface CreateCompanyModalProps {
  onClose: () => void;
  onSave: (data: { name: string; email: string; phone: string; address: string }) => void;
}

const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Nouvelle entreprise" size="medium">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="SARL Dupont"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="contact@entreprise.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="01 23 45 67 89"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse *
          </label>
          <textarea
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            rows={3}
            placeholder="123 rue de la République, 75001 Paris"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-700">
            Après la création, n'oubliez pas de configurer le plan d'abonnement et les modules pour cette entreprise.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Créer l'entreprise
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface CompanyConfigModalProps {
  company: CompanyWithDetails;
  plans: SubscriptionPlan[];
  allModules: { name: ModuleName; displayName: string }[];
  onClose: () => void;
  onSave: (config: { planId: string; maxUsers?: number; modules: ModuleName[] }) => void;
}

const CompanyConfigModal: React.FC<CompanyConfigModalProps> = ({
  company,
  plans,
  allModules,
  onClose,
  onSave,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState(
    company.subscription?.planId || plans[0]?.id || ''
  );
  const [customMaxUsers, setCustomMaxUsers] = useState(
    company.subscription?.customMaxUsers?.toString() || ''
  );
  const [selectedModules, setSelectedModules] = useState<Set<ModuleName>>(
    new Set(company.modules?.map((m) => m.moduleName) || [])
  );

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const toggleModule = (moduleName: ModuleName) => {
    const newModules = new Set(selectedModules);
    if (newModules.has(moduleName)) {
      newModules.delete(moduleName);
    } else {
      newModules.add(moduleName);
    }
    setSelectedModules(newModules);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      planId: selectedPlanId,
      maxUsers: customMaxUsers ? parseInt(customMaxUsers) : undefined,
      modules: Array.from(selectedModules),
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Configuration - ${company.name}`}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan d'abonnement
          </label>
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.displayName} - {plan.maxUsers} utilisateurs
                {plan.priceMonthly && ` - ${plan.priceMonthly}€/mois`}
              </option>
            ))}
          </select>
          {selectedPlan?.description && (
            <p className="mt-1 text-sm text-gray-500">{selectedPlan.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre d'utilisateurs maximum (personnalisé)
          </label>
          <input
            type="number"
            value={customMaxUsers}
            onChange={(e) => setCustomMaxUsers(e.target.value)}
            placeholder={`Par défaut: ${selectedPlan?.maxUsers || 1}`}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min="1"
          />
          <p className="mt-1 text-sm text-gray-500">
            Laisser vide pour utiliser la limite du plan ({selectedPlan?.maxUsers || 1} utilisateurs)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Modules activés
          </label>
          <div className="grid grid-cols-2 gap-3">
            {allModules.map((module) => (
              <label
                key={module.name}
                className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedModules.has(module.name)}
                  onChange={() => toggleModule(module.name)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {module.displayName}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {selectedModules.size} module(s) sélectionné(s)
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SuperAdminPage;
