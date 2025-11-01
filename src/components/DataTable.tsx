import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import DocumentActions from './DocumentActions';
import DocumentTraceability from './DocumentTraceability';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onDownload?: (item: T) => void;
  onDownloadPaid?: (item: T) => void;
  onStatusChange?: (item: T) => void;
  onTransform?: (item: T) => void;
  onDuplicate?: (item: T) => void;
  emptyMessage?: string;
  type?: 'quote' | 'invoice' | 'credit';
  allQuotes?: any[];
  allInvoices?: any[];
  allCredits?: any[];
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  selectedItems = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onView,
  onDownload,
  onDownloadPaid,
  onStatusChange,
  onTransform,
  onDuplicate,
  emptyMessage = "Aucune donnée disponible",
  type,
  allQuotes = [],
  allInvoices = [],
  allCredits = []
}: DataTableProps<T>) {
  const isAllSelected = data.length > 0 && selectedItems.length === data.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < data.length;

  // Fonction pour vérifier si un document peut être modifié
  const canEdit = (item: T) => {
    if (!type) return true;
    
    const doc = item as any;
    
    // Seuls les documents en brouillon peuvent être modifiés
    return doc.status === 'draft';
  };

  // Fonction pour vérifier si un document peut être supprimé
  const canDelete = (item: T) => {
    if (!type) return true;
    
    const doc = item as any;
    
    if (type === 'quote') {
      // Un devis validé ne peut plus être supprimé
      return doc.status === 'draft';
    }
    
    if (type === 'invoice') {
      // Une facture émise ne peut plus être supprimée
      return doc.status === 'draft';
    }
    
    return true;
  };

  const getValue = (item: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      const keys = key.split('.');
      let value: any = item;
      for (const k of keys) {
        value = value?.[k];
      }
      return value;
    }
    return item[key as keyof T];
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {onSelectionChange && (
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => onSelectionChange(isAllSelected ? [] : data.map(item => item.id))}
                    className="flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : isIndeterminate ? (
                      <div className="h-4 w-4 border-2 border-gray-400 rounded bg-gray-300" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.className || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {onSelectionChange && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        const newSelection = selectedItems.includes(item.id)
                          ? selectedItems.filter(id => id !== item.id)
                          : [...selectedItems, item.id];
                        onSelectionChange(newSelection);
                      }}
                      className="flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {selectedItems.includes(item.id) ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                )}
                {columns.map((column, colIndex) => {
                  const value = getValue(item, column.key);
                  return (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        column.className || ''
                      }`}
                    >
                      <div>
                        {column.render ? column.render(value, item) : value}
                        {column.key === 'status' && type && (
                          <DocumentTraceability
                            document={item}
                            type={type}
                            allQuotes={allQuotes}
                            allInvoices={allInvoices}
                            allCredits={allCredits}
                          />
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {type && onView && onDownload && onEdit && onDelete && onStatusChange ? (
                    <DocumentActions
                      document={item}
                      type={type}
                      onView={onView}
                      onDownload={onDownload}
                      onDownloadPaid={onDownloadPaid}
                      onEdit={canEdit(item) ? onEdit : undefined}
                      onDelete={canDelete(item) ? onDelete : undefined}
                      onStatusChange={onStatusChange}
                      onDuplicate={onDuplicate}
                      onTransform={onTransform}
                      canTransform={type === 'quote' ? !(item as any).transformedToInvoiceId : 
                                   type === 'invoice' ? !(item as any).transformedToCreditId : 
                                   false}
                    />
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}