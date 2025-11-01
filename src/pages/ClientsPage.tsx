import React, { useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, Archive, ArchiveRestore, Users, Building2, User, Search } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import ClientForm from '../components/ClientForm';
import DataTable from '../components/DataTable';
import { Client } from '../types';
import { formatDate } from '../utils/calculations';

export default function ClientsPage() {
  const { clients = [], addClient, updateClient, deleteClient } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Client>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('active');

  const handleSave = async (clientData: Partial<Client>) => {
    if (editingClient) {
      await updateClient(editingClient.id, clientData);
    } else {
      await addClient(clientData as Omit<Client, 'id' | 'createdAt'>);
    }
    setShowForm(false);
    setEditingClient(undefined);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = async (client: Client) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le client "${getClientDisplayName(client)}" ?`)) {
      await deleteClient(client.id);
    }
  };

  const handleToggleArchive = async (client: Client) => {
    await updateClient(client.id, {
      status: client.status === 'active' ? 'archived' : 'active'
    });
  };

  const getClientDisplayName = (client: Client) => {
    if (client.type === 'pro') {
      const legalForm = client.legalForm ? `${client.legalForm} ` : '';
      return `${legalForm}${client.companyName || 'Sans nom'}`;
    }
    const civility = client.civility ? `${client.civility} ` : '';
    return `${civility}${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Sans nom';
  };

  const filteredClients = clients
    .filter(client => {
      if (filterStatus !== 'all' && client.status !== filterStatus) return false;

      const searchLower = searchTerm.toLowerCase();
      const name = getClientDisplayName(client).toLowerCase();
      const email = client.email?.toLowerCase() || '';
      const phone = client.phone?.toLowerCase() || '';
      const city = client.city?.toLowerCase() || '';
      const clientCode = client.clientCode?.toLowerCase() || '';

      return name.includes(searchLower) ||
             email.includes(searchLower) ||
             phone.includes(searchLower) ||
             city.includes(searchLower) ||
             clientCode.includes(searchLower);
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === undefined || bValue === undefined) return 0;

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const activeCount = clients.filter(c => c.status === 'active').length;
  const archivedCount = clients.filter(c => c.status === 'archived').length;

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (value: any, client: Client) => (
        <div className="flex items-center">
          {client.type === 'pro' ? (
            <Building2 className="h-4 w-4 text-blue-600" />
          ) : (
            <User className="h-4 w-4 text-green-600" />
          )}
          <span className="ml-2 text-xs text-gray-600">
            {client.type === 'pro' ? 'Pro' : 'Part.'}
          </span>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Nom / Raison sociale',
      render: (value: any, client: Client) => (
        <div>
          <div className="font-medium text-gray-900">{getClientDisplayName(client)}</div>
          {client.clientCode && (
            <div className="text-xs text-gray-500">{client.clientCode}</div>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (value: any, client: Client) => (
        <div className="text-sm">
          <div className="text-gray-900">{client.email}</div>
          <div className="text-gray-500">{client.phone}</div>
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Ville',
      render: (value: any, client: Client) => (
        <div className="text-sm text-gray-900">
          {client.postalCode && <span>{client.postalCode} </span>}
          {client.city}
        </div>
      ),
    },
    {
      key: 'legal',
      label: 'Infos légales',
      render: (value: any, client: Client) => (
        <div className="text-xs text-gray-600">
          {client.siret && <div>SIRET: {client.siret}</div>}
          {client.tvaIntracommunautaire && <div>TVA: {client.tvaIntracommunautaire}</div>}
          {!client.siret && !client.tvaIntracommunautaire && <span className="text-gray-400">-</span>}
        </div>
      ),
    },
    {
      key: 'payment',
      label: 'Paiement',
      render: (value: any, client: Client) => (
        <div className="text-sm">
          <div className="text-gray-900">{client.paymentMethod}</div>
          <div className="text-xs text-gray-500">{client.paymentDelay} jours</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value: any, client: Client) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          client.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {client.status === 'active' ? 'Actif' : 'Archivé'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, client: Client) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(client)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleArchive(client)}
            className="p-1 text-gray-600 hover:text-gray-800"
            title={client.status === 'active' ? 'Archiver' : 'Désarchiver'}
          >
            {client.status === 'active' ? (
              <Archive className="h-4 w-4" />
            ) : (
              <ArchiveRestore className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => handleDelete(client)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos clients professionnels et particuliers
          </p>
        </div>
        <button
          onClick={() => {
            setEditingClient(undefined);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total clients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{clients.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clients actifs</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clients archivés</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{archivedCount}</p>
            </div>
            <Archive className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as keyof Client)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="createdAt">Date de création</option>
              <option value="companyName">Nom</option>
              <option value="city">Ville</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-md ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({clients.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-md ${
                filterStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Actifs ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('archived')}
              className={`px-4 py-2 rounded-md ${
                filterStatus === 'archived'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Archivés ({archivedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          columns={columns}
          data={filteredClients}
          emptyMessage="Aucun client trouvé"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <ClientForm
          client={editingClient}
          onClose={() => {
            setShowForm(false);
            setEditingClient(undefined);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
