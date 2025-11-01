import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Client, ClientEmail, ClientPhone } from '../types';
import { useApp } from '../contexts/AppContext';
import MultiContactManager from './MultiContactManager';

interface ClientFormProps {
  client?: Client;
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
}

export default function ClientForm({ client, onClose, onSave }: ClientFormProps) {
  const { settings } = useApp();
  const [formData, setFormData] = useState<Partial<Client>>({
    type: 'pro',
    civility: '',
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    emails: [],
    phones: [],
    address: '',
    city: '',
    postalCode: '',
    country: 'FR',
    siret: '',
    tvaIntracommunautaire: '',
    clientCode: '',
    paymentDelay: settings.defaults.paymentDelay || 30,
    paymentMethod: settings.lists.paymentMethods[0] || 'Virement',
    status: 'active',
    notes: '',
    ...client,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === 'pro' && !formData.companyName) {
      alert('Veuillez saisir une raison sociale pour un client professionnel');
      return;
    }

    if (formData.type === 'individual' && (!formData.firstName || !formData.lastName)) {
      alert('Veuillez saisir le prénom et le nom pour un particulier');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {client ? 'Modifier le client' : 'Nouveau client'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type de client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de client *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pro"
                  checked={formData.type === 'pro'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'pro' | 'individual' })}
                  className="mr-2"
                />
                Professionnel
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="individual"
                  checked={formData.type === 'individual'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'pro' | 'individual' })}
                  className="mr-2"
                />
                Particulier
              </label>
            </div>
          </div>

          {/* Informations client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.type === 'individual' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Civilité
                  </label>
                  <select
                    value={formData.civility || ''}
                    onChange={(e) => setFormData({ ...formData, civility: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Sélectionner...</option>
                    {settings.lists.civilities?.map((civ) => (
                      <option key={civ} value={civ}>{civ}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2" />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                    required={formData.type === 'individual'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                    required={formData.type === 'individual'}
                  />
                </div>
              </>
            )}

            {formData.type === 'pro' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison sociale *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                    required={formData.type === 'pro'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forme juridique
                  </label>
                  <select
                    value={formData.legalForm || ''}
                    onChange={(e) => setFormData({ ...formData, legalForm: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Sélectionner...</option>
                    {settings.lists.legalForms?.map((form) => (
                      <option key={form} value={form}>{form}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email principal *
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone principal *
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
          </div>

          {/* Contacts multiples */}
          <div className="space-y-6 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contacts supplémentaires</h3>

            <MultiContactManager
              type="email"
              contacts={formData.emails || []}
              categories={settings.lists.emailCategories || ['Principal', 'Comptabilité', 'Direction']}
              onChange={(emails) => setFormData({ ...formData, emails: emails as ClientEmail[] })}
              label="Emails supplémentaires"
              placeholder="email@example.com"
            />

            <MultiContactManager
              type="phone"
              contacts={formData.phones || []}
              categories={settings.lists.phoneCategories || ['Bureau', 'Mobile', 'Fax']}
              onChange={(phones) => setFormData({ ...formData, phones: phones as ClientPhone[] })}
              label="Téléphones supplémentaires"
              placeholder="06 12 34 56 78"
            />
          </div>

          {/* Adresse */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Adresse</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal *
                </label>
                <input
                  type="text"
                  value={formData.postalCode || ''}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.country || 'FR'}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Informations légales (pro uniquement) */}
          {formData.type === 'pro' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations légales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={formData.siret || ''}
                    onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                    placeholder="123 456 789 00012"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    N° TVA intracommunautaire
                  </label>
                  <input
                    type="text"
                    value={formData.tvaIntracommunautaire || ''}
                    onChange={(e) => setFormData({ ...formData, tvaIntracommunautaire: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                    placeholder="FR12345678901"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Informations commerciales */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations commerciales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code client
                </label>
                <input
                  type="text"
                  value={formData.clientCode || ''}
                  onChange={(e) => setFormData({ ...formData, clientCode: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Auto-généré si vide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Délai de paiement (jours) *
                </label>
                <input
                  type="number"
                  value={formData.paymentDelay || 30}
                  onChange={(e) => setFormData({ ...formData, paymentDelay: parseInt(e.target.value) })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement par défaut *
                </label>
                <select
                  value={formData.paymentMethod || ''}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  {settings.lists.paymentMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut *
                </label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'archived' })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  <option value="active">Actif</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes internes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  rows={3}
                  placeholder="Notes privées sur ce client..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
