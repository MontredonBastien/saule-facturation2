import React, { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function ListsSettings() {
  const { settings, updateSettings } = useApp();
  const [listsData, setListsData] = useState(settings.lists);
  const [loading, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ lists: listsData });
      alert('Paramètres des listes sauvegardés !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = (listName: keyof typeof listsData, value: string) => {
    if (!value.trim()) return;
    
    setListsData(prev => ({
      ...prev,
      [listName]: [...(prev[listName] || []), value.trim()]
    }));
  };

  const handleRemoveItem = (listName: keyof typeof listsData, index: number) => {
    setListsData(prev => ({
      ...prev,
      [listName]: prev[listName]?.filter((_, i) => i !== index) || []
    }));
  };

  const ListEditor = ({ title, listName, placeholder }: { 
    title: string; 
    listName: keyof typeof listsData; 
    placeholder: string; 
  }) => {
    const [newItem, setNewItem] = useState('');
    const items = listsData[listName] || [];

    return (
      <div>
        <h4 className="font-medium text-gray-900 mb-3">{title}</h4>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">{item}</span>
              <button
                onClick={() => handleRemoveItem(listName, index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="flex-1 text-sm rounded-md border-gray-300"
              placeholder={placeholder}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddItem(listName, newItem);
                  setNewItem('');
                }
              }}
            />
            <button
              onClick={() => {
                handleAddItem(listName, newItem);
                setNewItem('');
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Gestion des listes</h3>
        <p className="text-gray-600 mb-6">Personnalisez les listes déroulantes utilisées dans l'application</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListEditor
          title="Unités"
          listName="units"
          placeholder="Ex: heure, jour, m²..."
        />
        
        <ListEditor
          title="Modes de paiement"
          listName="paymentMethods"
          placeholder="Ex: virement, chèque..."
        />
        
        <ListEditor
          title="Catégories d'articles"
          listName="categories"
          placeholder="Ex: Services, Matériaux..."
        />
        
        <ListEditor
          title="Civilités"
          listName="civilities"
          placeholder="Ex: M., Mme, Dr..."
        />

        <ListEditor
          title="Formes juridiques"
          listName="legalForms"
          placeholder="Ex: SARL, SAS, EURL..."
        />

        <ListEditor
          title="Conditions de règlement"
          listName="paymentConditions"
          placeholder="Ex: Règlement fin de travaux..."
        />

        <ListEditor
          title="Catégories d'emails"
          listName="emailCategories"
          placeholder="Ex: Comptabilité, Direction..."
        />

        <ListEditor
          title="Catégories de téléphones"
          listName="phoneCategories"
          placeholder="Ex: Bureau, Mobile, Fax..."
        />
      </div>

      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}