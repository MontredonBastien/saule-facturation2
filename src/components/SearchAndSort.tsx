import React, { useState } from 'react';
import { Search, Import as SortAsc, Dessert as SortDesc, Filter, Calendar, X } from 'lucide-react';

interface SearchAndSortProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  columns: Array<{ key: string; header: string; sortable?: boolean }>;
  placeholder?: string;
  dateFilter?: { startDate?: string; endDate?: string; singleDate?: string };
  onDateFilterChange?: (dateFilter: { startDate?: string; endDate?: string; singleDate?: string }) => void;
  showDateFilter?: boolean;
  statusFilter?: { selectedStatuses: string[] };
  onStatusFilterChange?: (statusFilter: { selectedStatuses: string[] }) => void;
  statusOptions?: Array<{ value: string; label: string; color?: string }>;
  showStatusFilter?: boolean;
}

export default function SearchAndSort({
  searchTerm,
  onSearchChange,
  sortField,
  sortDirection,
  onSortChange,
  columns,
  placeholder = "Rechercher...",
  dateFilter,
  onDateFilterChange,
  showDateFilter = false,
  statusFilter,
  onStatusFilterChange,
  statusOptions = [],
  showStatusFilter = false
}: SearchAndSortProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');

  const sortableColumns = columns.filter(col => col.sortable !== false);

  const clearDateFilter = () => {
    if (onDateFilterChange) {
      onDateFilterChange({});
    }
    setShowDatePicker(false);
  };

  const clearStatusFilter = () => {
    if (onStatusFilterChange) {
      onStatusFilterChange({ selectedStatuses: [] });
    }
    setShowStatusPicker(false);
  };

  const applyDateFilter = () => {
    setShowDatePicker(false);
  };

  const toggleStatus = (statusValue: string) => {
    if (!onStatusFilterChange || !statusFilter) return;
    
    const currentStatuses = statusFilter.selectedStatuses;
    const newStatuses = currentStatuses.includes(statusValue)
      ? currentStatuses.filter(s => s !== statusValue)
      : [...currentStatuses, statusValue];
    
    onStatusFilterChange({ selectedStatuses: newStatuses });
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4">
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Barre de recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={placeholder}
              />
            </div>
          </div>

          {/* Options de tri et filtres */}
          <div className="flex items-center space-x-3">
            {/* Filtre par statut */}
            {showStatusFilter && onStatusFilterChange && (
              <button
                onClick={() => setShowStatusPicker(!showStatusPicker)}
                className={`flex items-center px-3 py-2 border rounded-md text-sm transition-colors ${
                  statusFilter?.selectedStatuses.length
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Statut
                {statusFilter?.selectedStatuses.length ? ` (${statusFilter.selectedStatuses.length})` : ''}
              </button>
            )}

            {/* Filtre par date */}
            {showDateFilter && onDateFilterChange && (
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`flex items-center px-3 py-2 border rounded-md text-sm transition-colors ${
                  dateFilter?.singleDate || (dateFilter?.startDate && dateFilter?.endDate)
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Filtrer par date
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Trier par :</span>
            </div>
            
            <select
              value={sortField}
              onChange={(e) => onSortChange(e.target.value, sortDirection)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {sortableColumns.map(column => (
                <option key={column.key} value={column.key}>
                  {column.header}
                </option>
              ))}
            </select>

            <button
              onClick={() => onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50"
              title={`Tri ${sortDirection === 'asc' ? 'croissant' : 'décroissant'}`}
            >
              {sortDirection === 'asc' ? (
                <SortAsc className="h-4 w-4 text-gray-600" />
              ) : (
                <SortDesc className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Status picker */}
      {showStatusPicker && onStatusFilterChange && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Filtrer par statut</h4>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={statusFilter?.selectedStatuses.includes(option.value) || false}
                  onChange={() => toggleStatus(option.value)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className={`ml-2 text-sm px-2 py-1 rounded-full ${
                  option.color === 'gray' ? 'bg-gray-100 text-gray-800' :
                  option.color === 'purple' ? 'bg-teal-100 text-teal-800' :
                  option.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  option.color === 'green' ? 'bg-green-100 text-green-800' :
                  option.color === 'red' ? 'bg-red-100 text-red-800' :
                  option.color === 'amber' ? 'bg-amber-100 text-amber-800' :
                  option.color === 'indigo' ? 'bg-sky-100 text-sky-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => setShowStatusPicker(false)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Appliquer
            </button>
            <button
              onClick={clearStatusFilter}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Effacer
            </button>
          </div>
        </div>
      )}

      {/* Date picker */}
      {showDatePicker && onDateFilterChange && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Filtrer par date</h4>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={dateMode === 'single'}
                  onChange={() => setDateMode('single')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Date unique</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={dateMode === 'range'}
                  onChange={() => setDateMode('range')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Période</span>
              </label>
            </div>
            
            {dateMode === 'single' ? (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={dateFilter?.singleDate || ''}
                  onChange={(e) => onDateFilterChange({ singleDate: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={dateFilter?.startDate || ''}
                    onChange={(e) => onDateFilterChange({ 
                      ...dateFilter, 
                      startDate: e.target.value,
                      singleDate: undefined 
                    })}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={dateFilter?.endDate || ''}
                    onChange={(e) => onDateFilterChange({ 
                      ...dateFilter, 
                      endDate: e.target.value,
                      singleDate: undefined 
                    })}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <button
                onClick={applyDateFilter}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Appliquer
              </button>
              <button
                onClick={clearDateFilter}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
              >
                Effacer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Indicateurs de filtres actifs */}
      <div className="px-4 pb-4 space-y-2">
        {searchTerm && (
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
            <span>Recherche: "{searchTerm}"</span>
            <button
              onClick={() => onSearchChange('')}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        
        {statusFilter?.selectedStatuses.length > 0 && (
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mr-2">
            <Filter className="h-3 w-3 mr-1" />
            <span>Statuts: {statusFilter.selectedStatuses.length}</span>
            <button
              onClick={clearStatusFilter}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        
        {showDateFilter && (dateFilter?.singleDate || (dateFilter?.startDate && dateFilter?.endDate)) && (
          <div className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
            <Calendar className="h-3 w-3 mr-1" />
            <span>
              {dateFilter.singleDate 
                ? `Date: ${new Date(dateFilter.singleDate).toLocaleDateString('fr-FR')}`
                : `Du ${dateFilter.startDate ? new Date(dateFilter.startDate).toLocaleDateString('fr-FR') : '?'} au ${dateFilter.endDate ? new Date(dateFilter.endDate).toLocaleDateString('fr-FR') : '?'}`
              }
            </span>
            <button
              onClick={clearDateFilter}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}