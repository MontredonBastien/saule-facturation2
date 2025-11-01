import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Article } from '../types';

interface ArticleFormProps {
  article?: Article | null;
  onClose: () => void;
}

export default function ArticleForm({ article, onClose }: ArticleFormProps) {
  const { addArticle, updateArticle, settings } = useApp();
  const [formData, setFormData] = useState<Partial<Article>>({
    name: '',
    unit: 'unité',
    priceHT: 0,
    vatRate: 20,
    active: true
  });

  // Mettre à jour la TVA par défaut quand les settings changent
  useEffect(() => {
    if (article) {
      setFormData(article);
    } else {
      setFormData(prev => ({
        ...prev,
        vatRate: settings?.defaults?.vatRate || 20
      }));
    }
  }, [article, settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.name) {
      alert('Le nom de l\'article est obligatoire');
      return;
    }

    if (formData.priceHT !== undefined && formData.priceHT < 0) {
      alert('Le prix ne peut pas être négatif');
      return;
    }

    const handleAsync = async () => {
      try {
        if (article?.id) {
          await updateArticle(article.id, formData);
        } else {
          await addArticle(formData as Omit<Article, 'id' | 'createdAt'>);
        }
        onClose();
      } catch (error) {
        alert('Erreur lors de la sauvegarde : ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      }
    };
    
    handleAsync();
    }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'article *
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder="Ex: Abattage chêne"
            maxLength={80}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            {(settings?.lists?.categories || []).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unité
          </label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            {(settings?.lists?.units || []).map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description longue
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          rows={4}
          placeholder="Description détaillée de l'article ou du service"
        />
      </div>

      {/* Pricing */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Prix & TVA</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix unitaire HT
            </label>
            <input
              type="number"
              value={formData.priceHT || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, priceHT: parseFloat(e.target.value) || 0 }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
            <p className="text-sm text-gray-500 mt-1">
              Laissez vide ou 0 si le prix sera défini lors de l'utilisation
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TVA applicable
            </label>
            <select
              value={formData.vatRate}
              onChange={(e) => setFormData(prev => ({ ...prev, vatRate: parseFloat(e.target.value) }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              {[0, 5.5, 10, 20, settings?.defaults?.vatRate || 20].filter((rate, index, arr) => arr.indexOf(rate) === index).sort((a, b) => a - b).map(rate => (
                <option key={rate} value={rate}>{rate}%</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix TTC
            </label>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
              {((formData.priceHT || 0) * (1 + (formData.vatRate || 0) / 100)).toFixed(2)} €
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Options</h3>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Article actif (visible dans les recherches)</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.allowDiscount}
              onChange={(e) => setFormData(prev => ({ ...prev, allowDiscount: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Remise possible sur cet article</span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {article?.id ? 'Modifier' : 'Créer'} l'article
        </button>
      </div>
    </form>
  );
}