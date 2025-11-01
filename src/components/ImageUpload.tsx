import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (base64Image: string) => void;
  label?: string;
  className?: string;
  maxSize?: number; // en MB
  logoSize?: number;
  onLogoSizeChange?: (size: number) => void;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  label = "Image", 
  className = "",
  maxSize = 5,
  logoSize = 24,
  onLogoSizeChange
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      setError(`L'image est trop volumineuse (max ${maxSize}MB)`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onChange(base64);
        setUploading(false);
      };

      reader.onerror = () => {
        setError('Erreur lors de la lecture du fichier');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setError('Erreur lors du traitement de l\'image');
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {value ? (
        // Preview de l'image
        <div className="relative">
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={value}
                  alt="Logo"
                  className="object-contain border border-gray-200 rounded bg-white"
                  style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Image chargée</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {value.startsWith('data:') ? 'Image intégrée' : 'Image externe'}
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Supprimer l'image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {onLogoSizeChange && (
                  <div className="mt-4">
                    <label className="block text-xs text-gray-600 mb-1">
                      Taille du logo : {logoSize}px (max 40px - hauteur bannière)
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="40"
                      value={logoSize}
                      onChange={(e) => onLogoSizeChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>15px</span>
                      <span>27px</span>
                      <span>40px</span>
                    </div>
                    
                    {/* Aperçu en temps réel de la taille */}
                    <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Aperçu de la taille :</h4>
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Dans l'en-tête PDF :</p>
                          <div 
                            className="border border-gray-300 bg-gradient-to-r from-green-500 to-green-600 p-2 rounded flex items-center justify-start"
                            style={{ width: '200px', height: '42px' }}
                          >
                            <img
                              src={value}
                              alt="Aperçu logo"
                              className="object-contain bg-white/10 rounded"
                              style={{ width: `${logoSize * 1.5}px`, height: `${logoSize}px` }}
                            />
                            <span className="text-white text-sm font-bold ml-3">DEVIS</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Taille réelle :</p>
                          <div className="border border-gray-200 bg-gray-50 p-2 rounded flex items-center justify-center">
                            <img
                              src={value}
                              alt="Aperçu taille réelle"
                              className="object-contain border border-gray-300 bg-white rounded"
                              style={{ width: `${logoSize * 1.5}px`, height: `${logoSize}px` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1 text-center">{logoSize * 1.5}px × {logoSize}px</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Changer l'image
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Zone d'upload
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            ) : (
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
            )}
            
            <p className="text-sm font-medium text-gray-900 mb-1">
              {uploading ? 'Chargement...' : 'Cliquez ou glissez une image'}
            </p>
            
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF jusqu'à {maxSize}MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <p className="mt-2 text-xs text-gray-500">
        L'image sera automatiquement intégrée au PDF (pas de lien externe nécessaire)
      </p>
    </div>
  );
}