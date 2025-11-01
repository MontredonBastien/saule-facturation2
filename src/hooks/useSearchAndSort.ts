import { useState, useMemo } from 'react';

interface DateFilter {
  startDate?: string;
  endDate?: string;
  singleDate?: string;
}

interface StatusFilter {
  selectedStatuses: string[];
}

export function useSearchAndSort<T>(
  data: T[], 
  searchFields: (keyof T)[], 
  customSearchFunction?: (item: T, searchTerm: string) => boolean,
  dateField?: keyof T,
  statusField?: keyof T
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState<DateFilter>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>({ selectedStatuses: [] });

  const getValue = (item: T, key: string): any => {
    if (key.includes('.')) {
      const keys = key.split('.');
      let value: any = item;
      for (const k of keys) {
        value = value?.[k];
      }
      return value;
    }
    return item[key as keyof T];
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Filtrage par recherche
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = data.filter(item => {
        // Utiliser la fonction de recherche personnalisée si fournie
        if (customSearchFunction) {
          return customSearchFunction(item, search);
        }
        
        return searchFields.some(field => {
          const value = item[field];
          if (value == null) return false;
          
          // Gestion spéciale pour les nombres
          if (typeof value === 'number') {
            return value.toString().includes(search);
          }
          
          // Gestion pour les dates
          if (value instanceof Date) {
            return value.toLocaleDateString('fr-FR').includes(search);
          }
          
          // Gestion pour les objets (ex: client)
          if (typeof value === 'object') {
            return JSON.stringify(value).toLowerCase().includes(search);
          }
          
          return value.toString().toLowerCase().includes(search);
        });
      });
    }

    // Filtrage par statut
    if (statusField && statusFilter.selectedStatuses.length > 0) {
      filtered = filtered.filter(item => {
        const itemStatus = item[statusField] as string;
        return statusFilter.selectedStatuses.includes(itemStatus);
      });
    }
    // Filtrage par date
    if (dateField && (dateFilter.singleDate || (dateFilter.startDate && dateFilter.endDate))) {
      filtered = filtered.filter(item => {
        const itemDate = item[dateField] as Date;
        if (!itemDate) return false;
        
        const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        
        if (dateFilter.singleDate) {
          const filterDate = new Date(dateFilter.singleDate);
          const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
          return itemDateOnly.getTime() === filterDateOnly.getTime();
        }
        
        if (dateFilter.startDate && dateFilter.endDate) {
          const startDate = new Date(dateFilter.startDate);
          const endDate = new Date(dateFilter.endDate);
          const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
          
          return itemDateOnly >= startDateOnly && itemDateOnly <= endDateOnly;
        }
        
        return true;
      });
    }

    // Tri
    filtered.sort((a, b) => {
      const aValue = getValue(a, sortField);
      const bValue = getValue(b, sortField);
      
      // Gestion des valeurs nulles/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;
      
      // Tri pour les nombres
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Tri pour les dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      // Tri pour les strings
      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr, 'fr');
      } else {
        return bStr.localeCompare(aStr, 'fr');
      }
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection, searchFields, customSearchFunction, dateFilter, dateField, statusFilter, statusField]);

  return {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    setSortField,
    setSortDirection,
    filteredAndSortedData,
    handleSortChange: (field: string, direction: 'asc' | 'desc') => {
      setSortField(field);
      setSortDirection(direction);
    }
  };
}