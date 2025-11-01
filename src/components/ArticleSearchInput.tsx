import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../contexts/AppContext';
import { Article } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ArticleSearchInputProps {
  onArticleSelect: (article: Article) => void;
  placeholder?: string;
}

export default function ArticleSearchInput({ 
  onArticleSelect, 
  placeholder = "Rechercher un article..." 
}: ArticleSearchInputProps) {
  const { articles = [], settings, addArticle } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(articles || []);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Formulaire de création d'article
  const [newArticleName, setNewArticleName] = useState('');
  const [newArticleDescription, setNewArticleDescription] = useState('');
  const [newArticleCategory, setNewArticleCategory] = useState('');
  const [newArticleUnit, setNewArticleUnit] = useState('');
  const [newArticlePrice, setNewArticlePrice] = useState(0);
  const [newArticleVat, setNewArticleVat] = useState(20);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialiser les valeurs par défaut
  useEffect(() => {
    if (!settings) return;
    if (settings?.lists?.categories?.length > 0) {
      setNewArticleCategory(settings.lists.categories[0]);
    }
    if (settings?.lists?.units?.length > 0) {
      setNewArticleUnit(settings.lists.units[0]);
    }
    if (settings?.defaults?.vatRate) {
      setNewArticleVat(settings.defaults.vatRate);
    }
  }, [settings]);

  // Filtrer les articles
  useEffect(() => {
    if (!articles) return;
    if (searchTerm.trim()) {
      const filtered = articles.filter(article => {
        if (!article.active) return false;
        const search = searchTerm.toLowerCase();
        return (article.name?.toLowerCase() || '').includes(search) ||
               (article.description?.toLowerCase() || '').includes(search) ||
               (article.category?.toLowerCase() || '').includes(search);
      });
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(articles.filter(a => a.active));
    }
  }, [searchTerm, articles]);

  // Fermer dropdown sur clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCreateForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setShowCreateForm(false);
  };

  const handleArticleSelect = (article: Article) => {
    onArticleSelect(article);
    setSearchTerm('');
    setIsOpen(false);
    setShowCreateForm(false);
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
    setIsOpen(false);
    
    // Reset du formulaire
    setNewArticleName('');
    setNewArticleDescription('');
    setNewArticleCategory(settings?.lists?.categories?.[0] || '');
    setNewArticleUnit(settings?.lists?.units?.[0] || '');
    setNewArticlePrice(0);
    setNewArticleVat(settings?.defaults?.vatRate || 20);
  };

  const handleCreateArticle = async () => {
    if (!newArticleName.trim()) {
      alert('Le nom de l\'article est obligatoire');
      return;
    }

    try {
      const articleData = {
        name: newArticleName.trim(),
        description: newArticleDescription.trim(),
        category: newArticleCategory,
        unit: newArticleUnit,
        priceHT: newArticlePrice,
        vatRate: newArticleVat,
        active: true,
        allowDiscount: false
      };
      
      const createdArticle = await addArticle(articleData);
      
      if (createdArticle) {
        onArticleSelect(createdArticle);
        setShowCreateForm(false);
        setSearchTerm('');
        setIsOpen(false);
      } else {
        alert('Erreur: article créé invalide');
      }
      
    } catch (error) {
      alert('Erreur lors de la création: ' + (error?.message || 'Erreur inconnue'));
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md text-sm"
          placeholder={placeholder}
          autoComplete="off"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {(isOpen || showCreateForm) && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto">
          
          {showCreateForm ? (
            /* Formulaire de création */
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Créer un nouvel article</h4>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={newArticleName}
                  onChange={(e) => setNewArticleName(e.target.value)}
                  className="w-full text-sm rounded border-gray-300"
                  placeholder="Nom de l'article *"
                  autoFocus
                />
                
                <textarea
                  value={newArticleDescription}
                  onChange={(e) => setNewArticleDescription(e.target.value)}
                  className="w-full text-sm rounded border-gray-300"
                  placeholder="Description"
                  rows={2}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newArticleCategory}
                    onChange={(e) => setNewArticleCategory(e.target.value)}
                    className="text-sm rounded border-gray-300"
                  >
                    {settings?.lists?.categories?.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    )) || <option value="">Aucune catégorie</option>}
                  </select>
                  
                  <select
                    value={newArticleUnit}
                    onChange={(e) => setNewArticleUnit(e.target.value)}
                    className="text-sm rounded border-gray-300"
                  >
                    {settings?.lists?.units?.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    )) || <option value="">Aucune unité</option>}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={newArticlePrice}
                    onChange={(e) => setNewArticlePrice(parseFloat(e.target.value) || 0)}
                    className="text-sm rounded border-gray-300"
                    placeholder="Prix HT"
                    min="0"
                    step="0.01"
                  />
                  
                  <select
                    value={newArticleVat}
                    onChange={(e) => setNewArticleVat(parseFloat(e.target.value))}
                    className="text-sm rounded border-gray-300"
                  >
                    <option value={0}>0%</option>
                    <option value={5.5}>5,5%</option>
                    <option value={10}>10%</option>
                    <option value={20}>20%</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCancelCreate}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateArticle}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Créer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Liste des articles */
            <>
              {/* Bouton créer */}
              <div
                onClick={handleShowCreateForm}
                className="cursor-pointer py-2 pl-3 pr-9 hover:bg-green-50 border-b border-gray-100"
              >
                <div className="flex items-center">
                  <Plus className="h-4 w-4 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-700">Créer un nouvel article</p>
                    <p className="text-xs text-green-600">Ajouter à votre catalogue</p>
                  </div>
                </div>
              </div>
              
              {/* Articles existants */}
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleSelect(article)}
                    className="cursor-pointer py-2 pl-3 pr-9 hover:bg-blue-50"
                  >
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{article.name}</p>
                        <p className="text-xs text-gray-600">
                          {article.category} • {formatCurrency(article.priceHT)} • {article.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-2 pl-3 pr-9 text-gray-500">
                  <p className="text-sm">Aucun article trouvé</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}