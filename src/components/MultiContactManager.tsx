import React, { useState } from 'react';
import { Plus, Trash2, Star } from 'lucide-react';
import { ClientEmail, ClientPhone } from '../types';

interface MultiContactManagerProps {
  type: 'email' | 'phone';
  contacts: (ClientEmail | ClientPhone)[];
  categories: string[];
  onChange: (contacts: (ClientEmail | ClientPhone)[]) => void;
  label: string;
  placeholder: string;
}

export default function MultiContactManager({
  type,
  contacts,
  categories,
  onChange,
  label,
  placeholder
}: MultiContactManagerProps) {
  const [newContact, setNewContact] = useState({ value: '', category: categories[0] || '' });

  const handleAdd = () => {
    if (!newContact.value.trim()) return;

    const contact: Partial<ClientEmail | ClientPhone> = {
      id: `temp-${Date.now()}`,
      [type]: newContact.value.trim(),
      category: newContact.category,
      isPrimary: contacts.length === 0,
      createdAt: new Date()
    };

    onChange([...contacts, contact as any]);
    setNewContact({ value: '', category: categories[0] || '' });
  };

  const handleRemove = (index: number) => {
    const updated = contacts.filter((_, i) => i !== index);

    if (updated.length > 0 && contacts[index] && (contacts[index] as any).isPrimary) {
      updated[0] = { ...updated[0], isPrimary: true } as any;
    }

    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = contacts.map((contact, i) => ({
      ...contact,
      isPrimary: i === index
    }));
    onChange(updated);
  };

  const handleUpdateCategory = (index: number, category: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], category };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {contacts.map((contact, index) => (
        <div key={contact.id || index} className="flex items-center gap-2">
          <input
            type={type === 'email' ? 'email' : 'tel'}
            value={(contact as any)[type]}
            readOnly
            className="flex-1 rounded-md border-gray-300 bg-gray-50"
          />

          <select
            value={contact.category}
            onChange={(e) => handleUpdateCategory(index, e.target.value)}
            className="rounded-md border-gray-300"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => handleSetPrimary(index)}
            className={`p-2 rounded ${
              contact.isPrimary
                ? 'text-yellow-500 bg-yellow-50'
                : 'text-gray-400 hover:text-yellow-500'
            }`}
            title="Principal"
          >
            <Star className={`h-4 w-4 ${contact.isPrimary ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="p-2 text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-2 pt-2 border-t">
        <input
          type={type === 'email' ? 'email' : 'tel'}
          value={newContact.value}
          onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
          className="flex-1 rounded-md border-gray-300"
          placeholder={placeholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />

        <select
          value={newContact.category}
          onChange={(e) => setNewContact({ ...newContact, category: e.target.value })}
          className="rounded-md border-gray-300"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </button>
      </div>

      {contacts.length === 0 && (
        <p className="text-sm text-gray-500 italic">Aucun {type === 'email' ? 'email' : 'téléphone'} ajouté</p>
      )}
    </div>
  );
}
