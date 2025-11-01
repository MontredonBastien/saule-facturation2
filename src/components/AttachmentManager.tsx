import React, { useState, useRef } from 'react';
import { Upload, File, Image, Trash2, Download, Eye } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Attachment } from '../types';

interface AttachmentManagerProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  documentType: 'quote' | 'invoice' | 'credit' | 'payment';
  documentId: string;
}

export default function AttachmentManager({ 
  attachments, 
  onAttachmentsChange, 
  documentType, 
  documentId 
}: AttachmentManagerProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    const newAttachments: Attachment[] = [];

    for (const file of Array.from(files)) {
      // Validation
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
        continue;
      }

      try {
        // Créer un objet URL pour le fichier local
        const fileUrl = URL.createObjectURL(file);
        
        const attachment: Attachment = {
          id: uuidv4(),
          name: file.name,
          url: fileUrl,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          size: file.size,
          uploadedAt: new Date()
        };

        newAttachments.push(attachment);
      } catch (error) {
        console.error('Erreur upload:', error);
        alert(`Erreur lors de l'upload de ${file.name}`);
      }
    }

    onAttachmentsChange([...attachments, ...newAttachments]);
    setUploading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    const attachment = attachments.find(a => a.id === attachmentId);
    if (attachment && attachment.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
    onAttachmentsChange(attachments.filter(a => a.id !== attachmentId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleViewAttachment = (attachment: Attachment) => {
    window.open(attachment.url, '_blank');
  };

  const handleDownloadAttachment = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {documentType === 'payment' ? 'Justificatifs de paiement' : 'Photos et pièces jointes'}
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Upload...' : 'Ajouter fichiers'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {attachments.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Aucune pièce jointe</p>
          <p className="text-xs text-gray-500 mt-1">
            {documentType === 'payment' 
              ? 'Photos de chèques, preuves de virement, récépissés...' 
              : 'Photos du chantier, factures fournisseurs, documents techniques...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {attachments.map(attachment => (
            <div key={attachment.id} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  {attachment.type === 'image' ? (
                    <Image className="h-4 w-4 text-blue-600 mr-2" />
                  ) : (
                    <File className="h-4 w-4 text-gray-600 mr-2" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {attachment.type === 'image' && (
                <div className="mb-2">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-20 object-cover rounded border"
                  />
                </div>
              )}

              <div className="flex space-x-1">
                <button
                  onClick={() => handleViewAttachment(attachment)}
                  className="flex-1 flex items-center justify-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Voir
                </button>
                <button
                  onClick={() => handleDownloadAttachment(attachment)}
                  className="flex-1 flex items-center justify-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Télécharger
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>• Formats acceptés : Images (JPG, PNG, GIF), Documents (PDF, DOC, TXT)</p>
        <p>• Taille maximum : 10 MB par fichier</p>
        <p>• Les fichiers sont stockés localement dans cette session</p>
      </div>
    </div>
  );
}