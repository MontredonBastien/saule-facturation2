import React, { useState } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Credit } from '../types';
import { useSearchAndSort } from '../hooks/useSearchAndSort';
import Modal from '../components/Modal';
import CreditForm from '../components/CreditForm';
import PDFViewer from '../components/PDFViewer';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import StatusManager from '../components/StatusManager';
import BulkActions from '../components/BulkActions';
import SearchAndSort from '../components/SearchAndSort';
import { formatCurrency, formatDate } from '../utils/calculations';
import { handleView, handleDownload } from '../services/documentActions';
import { downloadMultipleDocuments } from '../utils/bulkDownload';

export default function CreditsPage() {
  const { credits, clients, settings, deleteCredit, updateCredit, validateCredit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState<string[]>([]);
  const [editingCredit, setEditingCredit] = useState<Credit | null>(null);
  const [viewingCredit, setViewingCredit] = useState<Credit | null>(null);
  const [managingCredit, setManagingCredit] = useState<Credit | null>(null);

  const {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    filteredAndSortedData: filteredCredits,
    handleSortChange
  } = useSearchAndSort(
    credits, 
    ['number', 'clientId', 'reason', 'totalTTC', 'createdAt'],
    (credit, searchTerm) => {
      const clientName = getClientName(credit.clientId).toLowerCase();
      const number = (credit.number || '').toLowerCase();
      const reason = (credit.reason || '').toLowerCase();
      const totalTTC = Math.abs(credit.totalTTC || 0).toString();
      const createdAt = formatDate(credit.createdAt).toLowerCase();
      
      return clientName.includes(searchTerm) ||
             number.includes(searchTerm) ||
             reason.includes(searchTerm) ||
             totalTTC.includes(searchTerm) ||
             createdAt.includes(searchTerm);
    },
    'createdAt',
    'status'
  );

  const statusOptions = [
    { value: 'draft', label: 'Brouillon', color: 'gray' },
    { value: 'validated', label: 'Validé', color: 'blue' },
    { value: 'sent', label: 'Envoyé', color: 'indigo' },
    { value: 'applied', label: 'Affecté', color: 'green' }
  ];
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return 'Client inconnu';

    if (client.type === 'pro') {
      const legalForm = client.legalForm ? `${client.legalForm} ` : '';
      return `${legalForm}${client.companyName || 'Sans nom'}`;
    }
    const civility = client.civility ? `${client.civility} ` : '';
    return `${civility}${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Sans nom';
  };

  const handleBulkDownload = async () => {
    const selectedDocuments = filteredCredits.filter(c => selectedCredits.includes(c.id));
    if (selectedDocuments.length === 0) {
      alert('Aucun avoir sélectionné');
      return;
    }
    
    if (window.confirm(`Télécharger ${selectedDocuments.length} avoirs en PDF dans un fichier ZIP ?`)) {
      await downloadMultipleDocuments(selectedDocuments, clients, settings, 'credit');
      setSelectedCredits([]);
    }
  };

  const columns = [
    { key: 'number', header: 'Numéro', render: (value: string) => value || 'Brouillon', sortable: true },
    { key: 'clientId', header: 'Client', render: (value: string) => getClientName(value), sortable: true },
    { key: 'reason', header: 'Motif', sortable: true },
    { key: 'createdAt', header: 'Date', render: (value: Date) => formatDate(value), sortable: true },
    { key: 'totalTTC', header: 'Montant TTC', render: (value: number) => formatCurrency(Math.abs(value || 0)), sortable: true },
    { key: 'status', header: 'Statut', render: (value: string) => <StatusBadge status={value} type="credit" />, sortable: true }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avoirs</h1>
          <p className="text-gray-600 mt-1">Gérez vos notes de crédit et remboursements</p>
        </div>
        <button 
          onClick={() => {
            setEditingCredit(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvel avoir
        </button>
      </div>

      <SearchAndSort
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        columns={columns}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        showDateFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        showStatusFilter={true}
        placeholder="Rechercher par numéro, client, motif, montant..."
      />

      <BulkActions
        selectedItems={selectedCredits}
        documents={filteredCredits}
        type="credit"
        onClearSelection={() => setSelectedCredits([])}
        onBulkDelete={() => {
          const deletableCredits = selectedCredits.filter(id => {
            const credit = filteredCredits.find(c => c.id === id);
            return credit && credit.status === 'draft';
          });
          
          if (deletableCredits.length === 0) {
            alert('Aucun avoir sélectionné ne peut être supprimé (seuls les brouillons peuvent être supprimés)');
            return;
          }
          
          if (window.confirm(`Supprimer ${deletableCredits.length} avoirs en brouillon ?`)) {
            deletableCredits.forEach(deleteCredit);
            setSelectedCredits([]);
          }
        }}
        onBulkValidate={() => {
          if (window.confirm(`Valider ${selectedCredits.length} avoirs ?`)) {
            selectedCredits.forEach(validateCredit);
            setSelectedCredits([]);
          }
        }}
        onBulkDownload={handleBulkDownload}
      />

      {filteredCredits.length === 0 && credits.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Aucun avoir pour le moment</p>
          <button 
            onClick={() => {
              setEditingCredit(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Créer votre premier avoir
          </button>
        </div>
      ) : filteredCredits.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Aucun avoir ne correspond à votre recherche</p>
          <button 
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Effacer la recherche
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredCredits}
          selectedItems={selectedCredits}
          onSelectionChange={setSelectedCredits}
          type="credit"
          allQuotes={quotes}
          allInvoices={invoices}
          allCredits={credits}
          onEdit={(credit) => {
            setEditingCredit(credit);
            setShowForm(true);
          }}
          onDelete={(credit) => {
            if (credit.status === 'draft') {
              if (window.confirm('Supprimer cet avoir ?')) deleteCredit(credit.id);
            }
          }}
          onView={(credit) => handleView(credit, setViewingCredit)}
          onDownload={(credit) => {
            const client = clients.find(c => c.id === credit.clientId);
            if (client) handleDownload(credit, client, settings, 'credit');
          }}
          onStatusChange={setManagingCredit}
        />
      )}

      <Modal isOpen={!!managingCredit} onClose={() => setManagingCredit(null)} title="Gestion du statut" size="md">
        {managingCredit && (
          <StatusManager
            type="credit"
            currentStatus={managingCredit.status}
            documentNumber={managingCredit.number}
            documentId={managingCredit.id}
            onStatusChange={(newStatus) => {
              if (newStatus === 'validated') {
                validateCredit(managingCredit.id);
              } else {
                updateCredit(managingCredit.id, { status: newStatus });
              }
              setManagingCredit(null);
            }}
          />
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingCredit ? 'Modifier l\'avoir' : 'Nouvel avoir'} size="xl">
        <CreditForm credit={editingCredit} onClose={() => setShowForm(false)} />
      </Modal>

      {viewingCredit && (
        <Modal isOpen={!!viewingCredit} onClose={() => setViewingCredit(null)} title="Aperçu de l'avoir" size="full">
          <PDFViewer
            document={viewingCredit}
            client={clients.find(c => c.id === viewingCredit.clientId)}
            settings={settings}
            type="credit"
          />
        </Modal>
      )}
    </div>
  );
}