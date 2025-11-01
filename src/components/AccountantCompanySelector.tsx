import React, { useState, useEffect } from 'react';
import { Building, ChevronDown, Check, Briefcase, Lock, Edit, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Company {
  access_id: string;
  company_id: string;
  company_name: string;
  company_siret: string;
  company_email: string;
  access_level: 'readonly' | 'editor' | 'admin' | 'full_admin';
  last_access: string;
}

interface AccountantCompanySelectorProps {
  currentCompanyId?: string;
  onCompanyChange: (companyId: string) => void;
}

const accessLevelLabels = {
  readonly: { label: 'Lecture seule', icon: Eye, color: 'text-gray-600' },
  editor: { label: 'Édition', icon: Edit, color: 'text-blue-600' },
  admin: { label: 'Administrateur', icon: Briefcase, color: 'text-purple-600' },
  full_admin: { label: 'Admin complet', icon: Lock, color: 'text-red-600' }
};

export default function AccountantCompanySelector({ currentCompanyId, onCompanyChange }: AccountantCompanySelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAccountantCompanies();
  }, []);

  const loadAccountantCompanies = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('accountant_companies')
        .select('*')
        .order('company_name');

      if (error) throw error;

      setCompanies(data || []);

      // Si aucune entreprise n'est sélectionnée, sélectionner la première
      if (!currentCompanyId && data && data.length > 0) {
        onCompanyChange(data[0].company_id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = async (companyId: string) => {
    onCompanyChange(companyId);
    setIsOpen(false);

    // Mettre à jour la date du dernier accès
    try {
      const company = companies.find(c => c.company_id === companyId);
      if (company) {
        await supabase
          .from('accountant_company_access')
          .update({ last_access: new Date().toISOString() })
          .eq('id', company.access_id);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du dernier accès:', error);
    }
  };

  const currentCompany = companies.find(c => c.company_id === currentCompanyId);

  const filteredCompanies = companies.filter(company =>
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.company_siret?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
        <Building className="h-5 w-5 text-blue-600 animate-pulse" />
        <span className="text-sm text-blue-700">Chargement...</span>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 rounded-lg">
        <Building className="h-5 w-5 text-yellow-600" />
        <span className="text-sm text-yellow-700">Aucune entreprise assignée</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <div className="flex items-center space-x-3">
          <Building className="h-5 w-5 text-gray-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">
              {currentCompany?.company_name || 'Sélectionner une entreprise'}
            </div>
            {currentCompany && (
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  {currentCompany.company_siret || 'N/A'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {accessLevelLabels[currentCompany.access_level].label}
                </span>
              </div>
            )}
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-96 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Rechercher une entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {filteredCompanies.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Aucune entreprise trouvée
                </div>
              ) : (
                filteredCompanies.map((company) => {
                  const AccessIcon = accessLevelLabels[company.access_level].icon;
                  const isSelected = company.company_id === currentCompanyId;

                  return (
                    <button
                      key={company.company_id}
                      onClick={() => handleCompanySelect(company.company_id)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center justify-between ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <Building className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{company.company_name}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {company.company_siret || 'N/A'}
                            </span>
                            <span className={`text-xs flex items-center space-x-1 ${accessLevelLabels[company.access_level].color}`}>
                              <AccessIcon className="h-3 w-3" />
                              <span>{accessLevelLabels[company.access_level].label}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600">
                <div className="font-medium mb-1">Légende des accès :</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(accessLevelLabels).map(([key, { label, icon: Icon, color }]) => (
                    <div key={key} className="flex items-center space-x-1">
                      <Icon className={`h-3 w-3 ${color}`} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
