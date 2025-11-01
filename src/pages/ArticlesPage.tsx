import React, { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ArticleForm from '../components/ArticleForm';
import Modal from '../components/Modal';
import { formatDate, formatCurrency } from '../utils/calculations';

export default function ArticlesPage() {
  const { articles, deleteArticle, logAction } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const columns = [
    {
      key: 'name',
      label: 'Nom'
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => {
        if (!value || typeof value !== 'string') return '-';
        return value.length > 50 ? value.substring(0, 50) + '...' : value;
      }
    },
    {
      key: 'category',
      label: 'Catégorie'
    },
    {
      key: 'unit',
      label: 'Unité'
    },
    {
      key: 'priceHT',
      label: 'Prix HT',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'vatRate',
      label: 'TVA',
      render: (value: number) => `${value}%`
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (value: Date) => formatDate(value)
    },
    {
      key: 'active',
      label: 'Statut',
      render: (value: boolean) => <StatusBadge status={value ? 'active' : 'inactive'} type="client" />
    }
  ];

  const handleEdit = (article) => {
    setEditingArticle(article);
    setShowForm(true);
    logAction({
      userId: '00000000-0000-0000-0000-000000000001',
      userName: 'Admin User',
      action: 'view',
      module: 'articles',
      entityId: article.id,
      entityType: 'article',
      details: `Consultation de l'article ${article.name}`
    });
  };

  const handleDelete = (article) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      deleteArticle(article.id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-1">Gérez votre catalogue de produits et services</p>
        </div>
        <button 
          onClick={() => {
            setEditingArticle(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Créer un article
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Aucun article pour le moment</p>
          <button 
            onClick={() => {
              setEditingArticle(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Créer votre premier article
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={articles}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingArticle?.id ? 'Modifier l\'article' : 'Nouvel article'}
        size="lg"
      >
        <ArticleForm
          article={editingArticle}
          onClose={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}