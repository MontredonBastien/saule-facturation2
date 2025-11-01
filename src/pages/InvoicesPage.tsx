import React, { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Invoice } from '../types';
import { useSearchAndSort } from '../hooks/useSearchAndSort';
import Modal from '../components/Modal';
import InvoiceForm from '../components/InvoiceForm';
import PDFViewer from '../components/PDFViewer';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import StatusManager from '../components/StatusManager';
import BulkActions from '../components/BulkActions';
import SearchAndSort from '../components/SearchAndSort';
import { formatCurrency, formatDate } from '../utils/calculations';
import { handleView, handleDownload, handleDownloadFacturXXML } from '../services/documentActions';
import { transformInvoiceToCredit, duplicateDocument } from '../services/documentHelpers';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { downloadMultipleDocuments } from '../utils/bulkDownload';

export default function InvoicesPage() {
  const { invoices, clients, settings, deleteInvoice, updateInvoice, addCredit, addInvoice, validateInvoice, logAction, quotes, credits } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [managingInvoice, setManagingInvoice] = useState<Invoice | null>(null);

  const {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    filteredAndSortedData: filteredInvoices,
    handleSortChange
  } = useSearchAndSort(
    invoices, 
    ['number', 'clientId', 'reference', 'totalTTC', 'issuedAt'],
    (invoice, searchTerm) => {
      const clientName = getClientName(invoice.clientId).toLowerCase();
      const number = (invoice.number || '').toLowerCase();
      const reference = (invoice.reference || '').toLowerCase();
      const totalTTC = (invoice.totalTTC || 0).toString();
      const issuedAt = formatDate(invoice.issuedAt).toLowerCase();
      
      return clientName.includes(searchTerm) ||
             number.includes(searchTerm) ||
             reference.includes(searchTerm) ||
             totalTTC.includes(searchTerm) ||
             issuedAt.includes(searchTerm);
    },
    'issuedAt',
    'status'
  );

  const statusOptions = [
    { value: 'draft', label: 'Brouillon', color: 'gray' },
    { value: 'issued', label: 'Émise', color: 'blue' },
    { value: 'sent', label: 'Envoyée', color: 'indigo' },
    { value: 'partially_paid', label: 'Payée partiellement', color: 'amber' },
    { value: 'paid', label: 'Payée', color: 'green' },
    { value: 'overdue', label: 'En retard', color: 'red' },
    { value: 'cancelled', label: 'Annulée', color: 'red' }
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

  const columns = [
    { key: 'number', header: 'Numéro', render: (value: string) => value || 'Brouillon', sortable: true },
    { key: 'clientId', header: 'Client', render: (value: string) => getClientName(value), sortable: true },
    { key: 'issuedAt', header: 'Date', render: (value: Date) => formatDate(value), sortable: true },
    { key: 'totalTTC', header: 'Montant TTC', render: (value: number, invoice: Invoice) => {
      const totalTTC = formatCurrency(value || 0);
      if (invoice.status === 'partially_paid' && invoice.remainingAmount && invoice.remainingAmount > 0.01) {
        return (
          <div>
            <div className="font-medium">{totalTTC}</div>
            <div className="text-xs text-orange-600">
              Solde: {formatCurrency(invoice.remainingAmount)}
            </div>
          </div>
        );
      }
      return totalTTC;
    }, sortable: true },
    { key: 'status', header: 'Statut', render: (value: string) => <StatusBadge status={value} type="invoice" />, sortable: true }
  ];

  const handleTransform = async (invoice: Invoice) => {
    if (invoice.transformedToCreditId) {
      alert('Cette facture a déjà été transformée en avoir');
      return;
    }
    
    if (invoice.status === 'draft') {
      alert('La facture doit être émise avant transformation');
      return;
    }
    
    if (window.confirm('Transformer cette facture en avoir ?\n\nAttention : Cette action ne peut être effectuée qu\'une seule fois.')) {
      try {
        const newCredit = await addCredit(transformInvoiceToCredit(invoice));
        await updateInvoice(invoice.id, { transformedToCreditId: newCredit.id, status: 'cancelled' });
        logAction({
          userId: '00000000-0000-0000-0000-000000000001',
          userName: 'Admin User',
          action: 'transform',
          module: 'invoices',
          entityId: invoice.id,
          entityType: 'invoice',
          details: `Transformation en avoir ${newCredit.number || newCredit.id}`
        });
        alert(`Facture transformée en avoir ${newCredit.number || newCredit.id} avec succès !`);
      } catch (error) {
        console.error('Erreur transformation:', error);
        alert('Erreur lors de la transformation');
      }
    }
  };

  const handleDuplicate = async (invoice: Invoice) => {
    if (window.confirm('Dupliquer cette facture ?')) {
      try {
        await addInvoice(duplicateDocument(invoice, 'invoice'));
        logAction({
          userId: '00000000-0000-0000-0000-000000000001',
          userName: 'Admin User',
          action: 'duplicate',
          module: 'invoices',
          entityId: invoice.id,
          entityType: 'invoice',
          details: `Duplication de la facture ${invoice.number || 'brouillon'}`
        });
        alert('Facture dupliquée avec succès !');
      } catch (error) {
        console.error('Erreur duplication:', error);
        alert('Erreur lors de la duplication');
      }
    }
  };

  const handleDownloadPaid = async (invoice: Invoice) => {
    try {
      const client = clients.find(c => c.id === invoice.clientId);
      if (!client) {
        alert('Client introuvable');
        return;
      }
      
      // Générer le PDF avec la mention PAYÉ
      const pdfUrl = await generateInvoicePDF(invoice, client, settings, true); // true = afficher PAYÉ
      
      const clientName = client.companyName || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client_inconnu';
      const sanitizedClientName = clientName.replace(/[^a-zA-Z0-9\-_]/g, '_');
      const filename = `${sanitizedClientName}_facture_${invoice.number || 'brouillon'}_PAYEE.pdf`;
      
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename;
      link.click();
    } catch (error) {
      console.error('Erreur téléchargement facture payée:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const handleBulkDownload = async () => {
    const selectedDocuments = filteredInvoices.filter(i => selectedInvoices.includes(i.id));
    if (selectedDocuments.length === 0) {
      alert('Aucune facture sélectionnée');
      return;
    }
    
    if (window.confirm(`Télécharger ${selectedDocuments.length} factures en PDF dans un fichier ZIP ?`)) {
      await downloadMultipleDocuments(selectedDocuments, clients, settings, 'invoice');
      setSelectedInvoices([]);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-600 mt-1">Gérez vos factures et le suivi des paiements</p>
        </div>
        <button 
          onClick={() => {
            setEditingInvoice(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle facture
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
        selectedItems={selectedInvoices}
        documents={filteredInvoices}
        type="invoice"
        onClearSelection={() => setSelectedInvoices([])}
        onBulkDelete={() => {
          const deletableInvoices = selectedInvoices.filter(id => {
            const invoice = filteredInvoices.find(i => i.id === id);
            return invoice && invoice.status === 'draft';
          });
          
          if (deletableInvoices.length === 0) {
            alert('Aucune facture sélectionnée ne peut être supprimée (seuls les brouillons peuvent être supprimés)');
            return;
          }
          
          if (window.confirm(`Supprimer ${deletableInvoices.length} factures en brouillon ?`)) {
            deletableInvoices.forEach(deleteInvoice);
            setSelectedInvoices([]);
          }
        }}
        onBulkDownload={handleBulkDownload}
        onBulkAction={(action) => {
          if (window.confirm(`${action} ${selectedInvoices.length} factures ?`)) {
            selectedInvoices.forEach(id => updateInvoice(id, { status: action }));
            setSelectedInvoices([]);
          }
        }}
        actionLabel="Marquer envoyées"
        actionValue="sent"
      />

      {filteredInvoices.length === 0 && invoices.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Aucune facture pour le moment</p>
          <button 
            onClick={() => {
              setEditingInvoice(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Créer votre première facture
          </button>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Aucune facture ne correspond à votre recherche</p>
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
          data={filteredInvoices}
          selectedItems={selectedInvoices}
          onSelectionChange={setSelectedInvoices}
          type="invoice"
          allQuotes={quotes}
          allInvoices={invoices}
          allCredits={credits}
          onEdit={(invoice) => {
            setEditingInvoice(invoice);
            setShowForm(true);
          }}
          onDelete={(invoice) => {
            if (invoice.status === 'draft') {
              if (window.confirm('Supprimer cette facture ?')) deleteInvoice(invoice.id);
            }
          }}
          onView={(invoice) => handleView(invoice, setViewingInvoice)}
          onDownload={(invoice) => {
            const client = clients.find(c => c.id === invoice.clientId);
            if (client) handleDownload(invoice, client, settings, 'invoice');
          }}
          onDownloadPaid={handleDownloadPaid}
          onDownloadXML={(invoice) => {
            const client = clients.find(c => c.id === invoice.clientId);
            if (client) handleDownloadFacturXXML(invoice, client, settings);
          }}
          onDuplicate={handleDuplicate}
          onStatusChange={setManagingInvoice}
          onTransform={handleTransform}
        />
      )}

      <Modal isOpen={!!managingInvoice} onClose={() => setManagingInvoice(null)} title="Gestion du statut et paiements" size="md">
        {managingInvoice && (
          <StatusManager
            type="invoice"
            currentStatus={managingInvoice.status}
            documentNumber={managingInvoice.number}
            documentId={managingInvoice.id}
            totalAmount={managingInvoice.totalTTC}
            payments={managingInvoice.payments || []}
            onStatusChange={async (newStatus, paymentInfo) => {
              if (newStatus === 'issued') {
                try {
                  await validateInvoice(managingInvoice.id);
                  setManagingInvoice(null);
                } catch (error: any) {
                  alert(error.message || 'Erreur lors de la validation de la facture');
                  return;
                }
              } else {
                const updateData = { status: newStatus };
                if (paymentInfo) Object.assign(updateData, paymentInfo);

                // Calculer automatiquement le statut basé sur les paiements
                if (paymentInfo?.payments) {
                  const totalPaid = paymentInfo.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
                  const remaining = managingInvoice.totalTTC - totalPaid;

                  if (totalPaid <= 0.01) {
                    updateData.status = managingInvoice.status === 'draft' ? 'draft' : 'issued';
                  } else if (remaining <= 0.01) {
                    updateData.status = 'paid';
                  } else {
                    updateData.status = 'partially_paid';
                  }

                  updateData.paidAmount = totalPaid;
                  updateData.remainingAmount = Math.max(0, remaining);
                }

                updateInvoice(managingInvoice.id, updateData);
                setManagingInvoice(null);
              }
            }}
            onPaymentsChange={(newPayments) => {
              const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
              const remaining = managingInvoice.totalTTC - totalPaid;
              
              let newStatus = managingInvoice.status;
              if (totalPaid <= 0.01) {
                newStatus = managingInvoice.status === 'draft' ? 'draft' : 'issued';
              } else if (remaining <= 0.01) {
                newStatus = 'paid';
              } else {
                newStatus = 'partially_paid';
              }
              
              const updateData = {
                payments: newPayments,
                paidAmount: totalPaid,
                remainingAmount: Math.max(0, remaining),
                status: newStatus
              };
              
              updateInvoice(managingInvoice.id, updateData);
              setManagingInvoice(prev => prev ? { ...prev, payments: newPayments } : null);
            }}
          />
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingInvoice ? 'Modifier la facture' : 'Nouvelle facture'} size="xl">
        <InvoiceForm invoice={editingInvoice} onClose={() => setShowForm(false)} />
      </Modal>

      {viewingInvoice && (
        <Modal isOpen={!!viewingInvoice} onClose={() => setViewingInvoice(null)} title="Aperçu de la facture" size="full">
          <PDFViewer
            document={viewingInvoice}
            client={clients.find(c => c.id === viewingInvoice.clientId)}
            settings={settings}
            type="invoice"
          />
        </Modal>
      )}
    </div>
  );
}