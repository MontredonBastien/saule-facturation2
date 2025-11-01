import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Building, Plus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Client } from '../types';

interface ClientSearchInputProps {
  selectedClientId: string;
  onClientSelect: (clientId: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function ClientSearchInput({
  selectedClientId,
  onClientSelect,
  placeholder = "Rechercher un client...",
  required = false
}: ClientSearchInputProps) {
  const { clients, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredClients, setFilteredClients] = useState<Client[]>(clients || []);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log('🔍 ClientSearchInput - Clients disponibles:', clients?.length || 0);
  console.log('🔍 ClientSearchInput - Clients:', clients);

  const selectedClient = clients?.find(c => c.id === selectedClientId);

  // Filtrer les clients selon le terme de recherche
  useEffect(() => {
    if (!clients) return;
    if (searchTerm.trim()) {
      const filtered = clients.filter(client => {
        const companyName = client.companyName?.toLowerCase() || '';
        const firstName = client.firstName?.toLowerCase() || '';
        const lastName = client.lastName?.toLowerCase() || '';
        const email = client.email?.toLowerCase() || '';
        const clientCode = client.clientCode?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();

        return companyName.includes(search) ||
               firstName.includes(search) ||
               lastName.includes(search) ||
               email.includes(search) ||
               clientCode.includes(search) ||
               `${firstName} ${lastName}`.includes(search);
      });
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    setIsOpen(true);
    if (!searchTerm && !selectedClientId) {
      setFilteredClients(clients);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    
    // Si on efface et qu'un client était sélectionné, on le désélectionne
    if (!value && selectedClientId) {
      onClientSelect('');
    }
  };

  const handleClientSelect = (client: Client) => {
    onClientSelect(client.id);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClearSelection = () => {
    onClientSelect('');
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };


  const getClientDisplayName = (client: Client) => {
    if (client.type === 'pro') {
      const legalForm = client.legalForm ? `${client.legalForm} ` : '';
      return `${legalForm}${client.companyName || 'Sans nom'}`;
    }
    const civility = client.civility ? `${client.civility} ` : '';
    return `${civility}${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Sans nom';
  };

  const getClientSubInfo = (client: Client) => {
    const parts = [];
    if (client.email) parts.push(client.email);
    if (client.clientCode) parts.push(client.clientCode);
    return parts.join(' • ');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Client sélectionné */}
      {selectedClient && !isOpen ? (
        <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-blue-50">
          <div className="flex items-center flex-1">
            {selectedClient.type === 'pro' ? (
              <Building className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
            ) : (
              <User className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getClientDisplayName(selectedClient)}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {getClientSubInfo(selectedClient)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Champ de recherche */
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
            required={required && !selectedClientId}
            autoComplete="off"
          />
        </div>
      )}

      {/* Dropdown des résultats */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {/* Clients existants */}
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleClientSelect(client)}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
              >
                <div className="flex items-center">
                  {client.type === 'pro' ? (
                    <Building className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  ) : (
                    <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getClientDisplayName(client)}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {getClientSubInfo(client)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
              <p className="text-sm">{searchTerm ? 'Aucun client trouvé' : 'Aucun client disponible'}</p>
              <p className="text-xs text-gray-400 mt-1">Les clients sont gérés via l'application principale</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}