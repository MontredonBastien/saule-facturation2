import React from 'react';
import { Download } from 'lucide-react';

interface BulkActionsProps {
  selectedItems: string[];
  documents?: any[];
  type?: 'quote' | 'invoice' | 'credit';
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkValidate?: () => void;
  onBulkAction?: (action: string) => void;
  onBulkDownload?: () => void;
  actionLabel?: string;
  actionValue?: string;
}

export default function BulkActions({
  selectedItems,
  documents = [],
  type,
  onClearSelection,
  onBulkDelete,
  onBulkValidate,
  onBulkAction,
  onBulkDownload,
  actionLabel = "Action",
  actionValue = "action"
}: BulkActionsProps) {
  if (selectedItems.length === 0) return null;

  // Vérifier si tous les éléments sélectionnés peuvent être supprimés
  const canBulkDelete = () => {
    if (!type || documents.length === 0) return true;
    
    return selectedItems.every(id => {
      const doc = documents.find(d => d.id === id);
      if (!doc) return false;
      
      return doc.status === 'draft';
    });
  };
  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-800">
          {selectedItems.length} élément{selectedItems.length > 1 ? 's' : ''} sélectionné{selectedItems.length > 1 ? 's' : ''}
        </span>
        <div className="flex space-x-2">
          {onBulkValidate && (
            <button
              onClick={onBulkValidate}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Valider
            </button>
          )}
          {onBulkDownload && (
            <button
              onClick={onBulkDownload}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-1 inline" />
              Télécharger ZIP
            </button>
          )}
          {onBulkAction && (
            <button
              onClick={() => onBulkAction(actionValue)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              {actionLabel}
            </button>
          )}
          {canBulkDelete() && (
          <button
            onClick={onBulkDelete}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Supprimer
          </button>
          )}
          <button
            onClick={onClearSelection}
            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}