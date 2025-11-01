import React, { useState } from 'react';
import { Plus, FileText, Search } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Quote } from '../types';
import { useSearchAndSort } from '../hooks/useSearchAndSort';
import Modal from '../components/Modal';
import QuoteForm from '../components/QuoteForm';
import PDFViewer from '../components/PDFViewer';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import StatusManager from '../components/StatusManager';
import BulkActions from '../components/BulkActions';
import SearchAndSort from '../components/SearchAndSort';
import { formatCurrency, formatDate } from '../utils/calculations';
import { handleView, handleDownload } from '../services/documentActions';
import { transformQuoteToInvoice, duplicateDocument } from '../services/documentHelpers';
import { downloadMultipleDocuments } from '../utils/bulkDownload';

export default function QuotesPage() {
  const { quotes, clients, settings, invoices, credits, deleteQuote, updateQuote, validateQuote, addInvoice, addQuote, logAction } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
  const [managingQuote, setManagingQuote] = useState<Quote | null>(null);

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

  const {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    filteredAndSortedData: filteredQuotes,
    handleSortChange
  } = useSearchAndSort(
    quotes, 
    ['number', 'clientId', 'reference', 'totalTTC', 'createdAt'],
    (quote, searchTerm) => {
      const clientName = getClientName(quote.clientId).toLowerCase();
      const number = (quote.number || '').toLowerCase();
      const reference = (quote.reference || '').toLowerCase();
      const totalTTC = (quote.totalTTC || 0).toString();
      const createdAt = formatDate(quote.createdAt).toLowerCase();
      
      return clientName.includes(searchTerm) ||
             number.includes(searchTerm) ||
             reference.includes(searchTerm) ||
             totalTTC.includes(searchTerm) ||
             createdAt.includes(searchTerm);
    },
    'createdAt',
    'status'
  );

  const statusOptions = [
    { value: 'draft', label: 'Brouillon', color: 'gray' },
    { value: 'validated', label: 'Validé', color: 'purple' },
    { value: 'sent', label: 'Envoyé', color: 'blue' },
    { value: 'accepted', label: 'Accepté', color: 'green' },
    { value: 'refused', label: 'Refusé', color: 'red' }
  ];
  const columns = [
    { key: 'number', header: 'Numéro', render: (value: string) => value || 'Brouillon', sortable: true },
    { key: 'clientId', header: 'Client', render: (value: string) => getClientName(value), sortable: true },
    { key: 'createdAt', header: 'Date', render: (value: Date) => formatDate(value), sortable: true },
    { key: 'totalTTC', header: 'Montant TTC', render: (value: number) => formatCurrency(value || 0), sortable: true },
    { key: 'status', header: 'Statut', render: (value: string) => <StatusBadge status={value} type="quote" />, sortable: true }
  ];

  const handleTransform = async (quote: Quote) => {
    if (quote.transformedToInvoiceId) {
      alert('Ce devis a déjà été transformé en facture');
      return;
    }
    
    if (quote.status !== 'validated' && quote.status !== 'sent' && quote.status !== 'accepted') {
      alert('Le devis doit être au minimum validé avant transformation');
      return;
    }
    
    if (!window.confirm('Transformer ce devis en facture ?\n\nAttention : Cette action ne peut être effectuée qu\'une seule fois.')) {
      return;
    }
    
    try {
      const invoiceData = transformQuoteToInvoice(quote);
      
      const newInvoice = await addInvoice(invoiceData);
      await updateQuote(quote.id, { transformedToInvoiceId: newInvoice.id });
      logAction({
        userId: '00000000-0000-0000-0000-000000000001',
        userName: 'Admin User',
        action: 'transform',
        module: 'quotes',
        entityId: quote.id,
        entityType: 'quote',
        details: `Transformation en facture ${newInvoice.number || newInvoice.id}`
      });
      
      alert(`Devis transformé en facture ${newInvoice.number || newInvoice.id} avec succès !`);
    } catch (error) {
      console.error('Erreur transformation:', error);
      alert('Erreur lors de la transformation');
    }
  };

  const handleDuplicate = async (quote: Quote) => {
    if (window.confirm('Dupliquer ce devis ?')) {
      try {
        await addQuote(duplicateDocument(quote, 'quote'));
        logAction({
          userId: '00000000-0000-0000-0000-000000000001',
          userName: 'Admin User',
          action: 'duplicate',
          module: 'quotes',
          entityId: quote.id,
          entityType: 'quote',
          details: `Duplication du devis ${quote.number || 'brouillon'}`
        });
        alert('Devis dupliqué avec succès !');
      } catch (error) {
        console.error('Erreur duplication:', error);
        alert('Erreur lors de la duplication');
      }
    }
  };

  const handleBulkDownload = async () => {
    const selectedDocuments = filteredQuotes.filter(q => selectedQuotes.includes(q.id));
    if (selectedDocuments.length === 0) {
      alert('Aucun devis sélectionné');
      return;
    }
    
    if (window.confirm(`Télécharger ${selectedDocuments.length} devis en PDF dans un fichier ZIP ?`)) {
      await downloadMultipleDocuments(selectedDocuments, clients, settings, 'quote');
      setSelectedQuotes([]);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
          <p className="text-gray-600 mt-1">Gérez vos devis et propositions commerciales</p>
        </div>
        <button 
          onClick={() => {
            setEditingQuote(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau devis
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
        placeholder="Rechercher par numéro, client, référence, montant..."
      />

      <BulkActions
        selectedItems={selectedQuotes}
        documents={filteredQuotes}
        type="quote"
        onClearSelection={() => setSelectedQuotes([])}
        onBulkDelete={() => {
          const deletableQuotes = selectedQuotes.filter(id => {
            const quote = filteredQuotes.find(q => q.id === id);
            return quote && quote.status === 'draft';
          });
          
          if (deletableQuotes.length === 0) {
            alert('Aucun devis sélectionné ne peut être supprimé (seuls les brouillons peuvent être supprimés)');
            return;
          }
          
          if (window.confirm(`Supprimer ${deletableQuotes.length} devis en brouillon ?`)) {
            deletableQuotes.forEach(deleteQuote);
            setSelectedQuotes([]);
          }
        }}
        onBulkValidate={() => {
          if (window.confirm(`Valider ${selectedQuotes.length} devis ?`)) {
            selectedQuotes.forEach(validateQuote);
            setSelectedQuotes([]);
          }
        }}
        onBulkDownload={handleBulkDownload}
      />

      {filteredQuotes.length === 0 && quotes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Aucun devis pour le moment</p>
          <button 
            onClick={() => {
              setEditingQuote(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Créer votre premier devis
          </button>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Aucun devis ne correspond à votre recherche</p>
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
          data={filteredQuotes}
          selectedItems={selectedQuotes}
          onSelectionChange={setSelectedQuotes}
          type="quote"
          allQuotes={quotes}
          allInvoices={invoices}
          allCredits={credits}
          onEdit={(quote) => {
            setEditingQuote(quote);
            setShowForm(true);
          }}
          onDelete={(quote) => {
            if (quote.status === 'draft') {
              if (window.confirm('Supprimer ce devis ?')) deleteQuote(quote.id);
            }
          }}
          onView={(quote) => handleView(quote, setViewingQuote)}
          onDownload={(quote) => {
            const client = clients.find(c => c.id === quote.clientId);
            if (client) handleDownload(quote, client, settings, 'quote');
          }}
          onDuplicate={handleDuplicate}
          onStatusChange={setManagingQuote}
          onTransform={handleTransform}
        />
      )}

      <Modal isOpen={!!managingQuote} onClose={() => setManagingQuote(null)} title="Gestion du statut" size="md">
        {managingQuote && (
          <StatusManager
            type="quote"
            currentStatus={managingQuote.status}
            documentNumber={managingQuote.number}
            documentId={managingQuote.id}
            onStatusChange={(newStatus) => {
              if (newStatus === 'validated') {
                validateQuote(managingQuote.id);
              } else {
                updateQuote(managingQuote.id, { status: newStatus });
              }
              setManagingQuote(null);
            }}
          />
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingQuote ? 'Modifier le devis' : 'Nouveau devis'} size="xl">
        <QuoteForm quote={editingQuote} onClose={() => setShowForm(false)} />
      </Modal>

      {viewingQuote && (
        <Modal isOpen={!!viewingQuote} onClose={() => setViewingQuote(null)} title="Aperçu du devis" size="full">
          <PDFViewer
            document={viewingQuote}
            client={clients.find(c => c.id === viewingQuote.clientId)}
            settings={settings}
            type="quote"
          />
        </Modal>
      )}
    </div>
  );
}