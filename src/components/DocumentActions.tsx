import React from 'react';
import { Eye, Download, Copy, Settings, Receipt, FileText, CheckCircle, FileCode } from 'lucide-react';

interface DocumentActionsProps {
  document: any;
  type: 'quote' | 'invoice' | 'credit';
  onView: (doc: any) => void;
  onDownload: (doc: any) => void;
  onDownloadPaid?: (doc: any) => void;
  onDownloadXML?: (doc: any) => void;
  onEdit: (doc: any) => void;
  onDelete?: (doc: any) => void;
  onStatusChange: (doc: any) => void;
  onDuplicate?: (doc: any) => void;
  onTransform?: (doc: any) => void;
  canTransform?: boolean;
}

export default function DocumentActions({
  document,
  type,
  onView,
  onDownload,
  onEdit,
  onDelete,
  onStatusChange,
  onDuplicate,
  onTransform,
  canTransform = true,
  onDownloadPaid,
  onDownloadXML
}: DocumentActionsProps) {
  // Vérifier si la facture est payée (entièrement ou partiellement)
  const isInvoicePaid = type === 'invoice' && (document.status === 'paid' || document.status === 'partially_paid');

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => onView(document)}
        className="p-1 text-blue-600 hover:text-blue-900"
        title="Visualiser"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDownload(document)}
        className="p-1 text-green-600 hover:text-green-900"
        title="Télécharger PDF"
      >
        <Download className="h-4 w-4" />
      </button>
      {/* Bouton téléchargement XML Factur-X pour les factures */}
      {type === 'invoice' && onDownloadXML && (
        <button
          onClick={() => onDownloadXML(document)}
          className="p-1 text-purple-600 hover:text-purple-900"
          title="Télécharger XML Factur-X"
        >
          <FileCode className="h-4 w-4" />
        </button>
      )}
      {/* Bouton téléchargement avec notification PAYÉ pour les factures payées */}
      {isInvoicePaid && onDownloadPaid && (
        <button
          onClick={() => onDownloadPaid(document)}
          className="p-1 text-green-600 hover:text-green-900"
          title="Télécharger avec mention PAYÉ"
        >
          <div className="relative">
            <Download className="h-4 w-4" />
            <CheckCircle className="h-2 w-2 absolute -top-1 -right-1 text-green-600" />
          </div>
        </button>
      )}
      {onDuplicate && (
        <button
          onClick={() => onDuplicate(document)}
          className="p-1 text-blue-600 hover:text-blue-900"
          title="Dupliquer"
        >
          <Copy className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => onStatusChange(document)}
        className="p-1 text-purple-600 hover:text-purple-900"
        title="Gérer le statut"
      >
        <Settings className="h-4 w-4" />
      </button>
      {onTransform && type === 'quote' && canTransform && (
        <button
          onClick={() => onTransform(document)}
          className={`p-1 ${canTransform ? 'text-orange-600 hover:text-orange-900' : 'text-gray-400 cursor-not-allowed'}`}
          title="Transformer en facture"
          disabled={!canTransform}
        >
          <Receipt className="h-4 w-4" />
        </button>
      )}
      {onTransform && type === 'invoice' && canTransform && (
        <button
          onClick={() => onTransform(document)}
          className={`p-1 ${canTransform ? 'text-red-600 hover:text-red-900' : 'text-gray-400 cursor-not-allowed'}`}
          title="Transformer en avoir"
          disabled={!canTransform}
        >
          <FileText className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => onEdit(document)}
        className={`p-1 ${onEdit ? 'text-indigo-600 hover:text-indigo-900' : 'text-gray-400 cursor-not-allowed'}`}
        title="Modifier"
        disabled={!onEdit}
      >
        <span className="h-4 w-4">✏️</span>
      </button>
      {onDelete && (
      <button
        onClick={() => onDelete(document)}
        className="p-1 text-red-600 hover:text-red-900"
        title="Supprimer"
      >
        <span className="h-4 w-4">🗑️</span>
      </button>
      )}
    </div>
  );
}