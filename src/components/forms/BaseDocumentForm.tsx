import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, MessageSquare, Package, ChevronUp, ChevronDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../../contexts/AppContext';
import ClientSearchInput from '../ClientSearchInput';
import ArticleSearchInput from '../ArticleSearchInput';
import { QuoteLine } from '../../types';
import { calculateLineTotal, formatCurrency } from '../../utils/calculations';

interface BaseDocumentFormProps {
  lines: QuoteLine[];
  onLinesChange: (lines: QuoteLine[]) => void;
  showDeposit?: boolean;
  depositPercentage?: number;
  onDepositChange?: (percentage: number) => void;
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  depositAmount?: number;
  depositReceived?: boolean;
  globalDiscount?: number;
  globalDiscountType?: 'percentage' | 'amount';
  onGlobalDiscountChange?: (discount: number, discountType: 'percentage' | 'amount') => void;
}

export default function BaseDocumentForm({
  lines,
  onLinesChange,
  showDeposit = false,
  depositPercentage = 0,
  onDepositChange,
  totalHT,
  totalVAT,
  totalTTC,
  depositAmount = 0,
  depositReceived = false,
  globalDiscount = 0,
  globalDiscountType = 'percentage',
  onGlobalDiscountChange
}: BaseDocumentFormProps) {
  const { articles = [], settings } = useApp();
  
  // Protection robuste contre settings undefined
  const defaultVatRate = settings?.defaults?.vatRate || 20;
  const availableUnits = settings?.lists?.units || ['unité', 'heure', 'jour'];

  const calculateSubtotalAtPosition = (index: number, linesArray?: QuoteLine[]) => {
    const currentLines = linesArray || lines;
    let sum = 0;
    let startIndex = 0;
    
    for (let i = index - 1; i >= 0; i--) {
      if (currentLines[i].type === 'subtotal') {
        startIndex = i + 1;
        break;
      }
    }
    
    for (let i = startIndex; i < index; i++) {
      const line = currentLines[i];
      if (!line.type || line.type === 'item') {
        sum += calculateLineTotal(line);
      }
    }
    
    return sum;
  };

  const handleAddLine = () => {
    const newLine: QuoteLine = {
      id: uuidv4(),
      type: 'item',
      designation: '',
      description: '',
      quantity: 1,
      unit: 'unité',
      priceHT: 0,
      vatRate: defaultVatRate,
      totalHT: 0,
      discount: 0,
      discountType: 'percentage'
    };
    onLinesChange([...lines, newLine]);
  };

  const handleAddSubtotal = () => {
    const newSubtotal: QuoteLine = {
      id: uuidv4(),
      type: 'subtotal',
      designation: 'Sous-total',
      description: '',
      quantity: 0,
      unit: '',
      priceHT: 0,
      vatRate: 0,
      totalHT: 0,
      subtotalAmount: 0
    };
    onLinesChange([...lines, newSubtotal]);
  };

  const handleAddComment = () => {
    const newComment: QuoteLine = {
      id: uuidv4(),
      type: 'comment',
      designation: 'Commentaire',
      description: '',
      quantity: 0,
      unit: '',
      priceHT: 0,
      vatRate: 0,
      totalHT: 0,
      discount: 0,
      discountType: 'percentage',
      textColor: '#000000',
      fontSize: 10,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      fontFamily: 'helvetica',
      isMultiline: false
    };
    onLinesChange([...lines, newComment]);
  };

  const handleUpdateLine = (index: number, field: keyof QuoteLine, value: any) => {
    const updatedLines = [...lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };

    // Recalculer le total pour toute modification qui affecte le prix
    if ((field === 'quantity' || field === 'priceHT' || field === 'vatRate' || field === 'discount' || field === 'discountType') && 
        (!updatedLines[index].type || updatedLines[index].type === 'item')) {
      updatedLines[index].totalHT = calculateLineTotal(updatedLines[index]);
    }
    
    // S'assurer que les propriétés de remise sont toujours définies
    if (!updatedLines[index].hasOwnProperty('discount')) {
      updatedLines[index].discount = 0;
    }
    if (!updatedLines[index].hasOwnProperty('discountType')) {
      updatedLines[index].discountType = 'percentage';
    }
    
    // Recalculer tous les sous-totaux
    for (let i = 0; i < updatedLines.length; i++) {
      if (updatedLines[i].type === 'subtotal') {
        updatedLines[i].subtotalAmount = calculateSubtotalAtPosition(i, updatedLines);
      }
    }

    onLinesChange(updatedLines);
  };

  const handleMoveLineUp = (index: number) => {
    if (index === 0) return;
    const updatedLines = [...lines];
    [updatedLines[index - 1], updatedLines[index]] = [updatedLines[index], updatedLines[index - 1]];
    
    for (let i = 0; i < updatedLines.length; i++) {
      if (updatedLines[i].type === 'subtotal') {
        updatedLines[i].subtotalAmount = calculateSubtotalAtPosition(i, updatedLines);
      }
    }
    
    onLinesChange(updatedLines);
  };

  const handleMoveLineDown = (index: number) => {
    if (index === lines.length - 1) return;
    const updatedLines = [...lines];
    [updatedLines[index], updatedLines[index + 1]] = [updatedLines[index + 1], updatedLines[index]];
    
    for (let i = 0; i < updatedLines.length; i++) {
      if (updatedLines[i].type === 'subtotal') {
        updatedLines[i].subtotalAmount = calculateSubtotalAtPosition(i, updatedLines);
      }
    }
    
    onLinesChange(updatedLines);
  };

  const handleRemoveLine = (index: number) => {
    onLinesChange(lines.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Lignes du document</h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleAddLine}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 font-medium"
            >
              <Package className="h-4 w-4 mr-2" />
              Article
            </button>
            <button
              type="button"
              onClick={handleAddSubtotal}
              className="flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 font-medium"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Sous-total
            </button>
            <button
              type="button"
              onClick={handleAddComment}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 font-medium"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Commentaire
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="space-y-4">
            {lines.map((line, index) => (
              <div key={line.id} className={`p-4 border border-gray-200 rounded-lg ${
                line.type === 'subtotal' ? 'bg-green-50' :
                line.type === 'comment' ? 'bg-yellow-50' : ''
              }`}>
                {/* Désignation en grand */}
                <div className="mb-4">
                  {line.type === 'subtotal' ? (
                    <div className="flex items-center">
                      <Calculator className="h-4 w-4 mr-2 text-green-600" />
                      <input
                        type="text"
                        value={line.designation}
                        onChange={(e) => handleUpdateLine(index, 'designation', e.target.value)}
                        className="w-full text-base font-bold rounded border-gray-300 bg-green-50"
                        placeholder="Libellé du sous-total"
                      />
                      <div className="ml-2 text-xs text-green-600 font-medium">
                        Auto: {formatCurrency(calculateSubtotalAtPosition(index))}
                      </div>
                    </div>
                  ) : line.type === 'comment' ? (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-yellow-600" />
                        {line.isMultiline ? (
                          <textarea
                            value={line.designation}
                            onChange={(e) => handleUpdateLine(index, 'designation', e.target.value)}
                            className="flex-1 text-base rounded border-gray-300 bg-yellow-50"
                            placeholder="Texte du commentaire (multi-lignes)"
                            rows={3}
                            style={{
                              color: line.textColor,
                              fontSize: `${line.fontSize}px`,
                              fontWeight: line.fontWeight,
                              fontStyle: line.fontStyle,
                              textDecoration: line.textDecoration,
                              fontFamily: line.fontFamily
                            }}
                          />
                        ) : (
                          <input
                            type="text"
                            value={line.designation}
                            onChange={(e) => handleUpdateLine(index, 'designation', e.target.value)}
                            className="flex-1 text-base rounded border-gray-300 bg-yellow-50"
                            placeholder="Texte du commentaire"
                            style={{
                              color: line.textColor,
                              fontSize: `${line.fontSize}px`,
                              fontWeight: line.fontWeight,
                              fontStyle: line.fontStyle,
                              textDecoration: line.textDecoration,
                              fontFamily: line.fontFamily
                            }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleUpdateLine(index, 'isMultiline', !line.isMultiline)}
                          className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          title={line.isMultiline ? 'Passer en une ligne' : 'Passer en multi-lignes'}
                        >
                          {line.isMultiline ? '═' : '≡'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <input
                            type="color"
                            value={line.textColor || '#000000'}
                            onChange={(e) => handleUpdateLine(index, 'textColor', e.target.value)}
                            className="w-6 h-6 border border-gray-300 rounded"
                            title="Couleur"
                          />
                          <input
                            type="number"
                            value={line.fontSize || 10}
                            onChange={(e) => handleUpdateLine(index, 'fontSize', parseInt(e.target.value) || 10)}
                            className="w-12 text-xs rounded border-gray-300"
                            min="8"
                            max="20"
                            title="Taille"
                          />
                        </div>
                        
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateLine(index, 'fontWeight', 
                              line.fontWeight === 'bold' ? 'normal' : 'bold')}
                            className={`px-2 py-1 text-xs border rounded ${
                              line.fontWeight === 'bold' ? 'bg-gray-200' : 'bg-white'
                            }`}
                            title="Gras"
                          >
                            <strong>B</strong>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateLine(index, 'fontStyle', 
                              line.fontStyle === 'italic' ? 'normal' : 'italic')}
                            className={`px-2 py-1 text-xs border rounded ${
                              line.fontStyle === 'italic' ? 'bg-gray-200' : 'bg-white'
                            }`}
                            title="Italique"
                          >
                            <em>I</em>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateLine(index, 'textDecoration', 
                              line.textDecoration === 'underline' ? 'none' : 'underline')}
                            className={`px-2 py-1 text-xs border rounded ${
                              line.textDecoration === 'underline' ? 'bg-gray-200' : 'bg-white'
                            }`}
                            title="Souligné"
                          >
                            <u>U</u>
                          </button>
                        </div>
                        
                        <select
                          value={line.fontFamily || 'helvetica'}
                          onChange={(e) => handleUpdateLine(index, 'fontFamily', e.target.value)}
                          className="text-xs rounded border-gray-300"
                          title="Police"
                        >
                          <option value="helvetica">Helvetica</option>
                          <option value="times">Times</option>
                          <option value="courier">Courier</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={line.designation}
                        onChange={(e) => handleUpdateLine(index, 'designation', e.target.value)}
                        className="w-full text-base font-medium rounded border-gray-300"
                        placeholder="Désignation"
                      />
                      
                      <ArticleSearchInput
                        onArticleSelect={(article) => {
                          const updatedLines = [...lines];
                          updatedLines[index] = {
                            ...updatedLines[index],
                            designation: article.name,
                            description: article.description || '',
                            priceHT: article.priceHT || 0,
                            unit: article.unit,
                            vatRate: article.vatRate,
                            totalHT: (updatedLines[index].quantity || 1) * (article.priceHT || 0)
                          };
                          onLinesChange(updatedLines);
                        }}
                        placeholder="Rechercher un article..."
                      />
                      
                      <textarea
                        value={line.description || ''}
                        onChange={(e) => handleUpdateLine(index, 'description', e.target.value)}
                        className="w-full text-sm rounded border-gray-300"
                        placeholder="Description détaillée"
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-7 gap-4 items-center">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Qté</label>
                    {line.type === 'subtotal' || line.type === 'comment' ? (
                      <span className="text-xs text-gray-500">-</span>
                    ) : (
                      <input
                        type="number"
                        value={line.quantity}
                        onChange={(e) => handleUpdateLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full text-sm rounded border-gray-300"
                        min="0"
                        step="0.01"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Unité</label>
                    {line.type === 'subtotal' || line.type === 'comment' ? (
                      <span className="text-xs text-gray-500">-</span>
                    ) : (
                      <select
                        value={line.unit}
                        onChange={(e) => handleUpdateLine(index, 'unit', e.target.value)}
                        className="w-full text-sm rounded border-gray-300"
                      >
                        {availableUnits.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">PU HT</label>
                    {line.type === 'subtotal' || line.type === 'comment' ? (
                      <span className="text-xs text-gray-500">-</span>
                    ) : (
                      <input
                        type="number"
                        value={line.priceHT}
                        onChange={(e) => handleUpdateLine(index, 'priceHT', parseFloat(e.target.value) || 0)}
                        className="w-full text-sm rounded border-gray-300"
                        step="0.01"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Remise</label>
                    {line.type === 'subtotal' || line.type === 'comment' ? (
                      <span className="text-xs text-gray-500">-</span>
                    ) : (
                      <div className="flex space-x-1">
                        <input
                          type="number"
                          value={line.discount || 0}
                          onChange={(e) => handleUpdateLine(index, 'discount', parseFloat(e.target.value) || 0)}
                          className="flex-1 text-sm rounded border-gray-300"
                          step="0.01"
                          min="0"
                          placeholder="0"
                        />
                        <select
                          value={line.discountType || 'percentage'}
                          onChange={(e) => handleUpdateLine(index, 'discountType', e.target.value)}
                          className="w-12 text-xs rounded border-gray-300"
                        >
                          <option value="percentage">%</option>
                          <option value="amount">€</option>
                        </select>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">TVA</label>
                    {line.type === 'subtotal' || line.type === 'comment' ? (
                      <span className="text-xs text-gray-500">-</span>
                    ) : (
                      <select
                        value={line.vatRate}
                        onChange={(e) => handleUpdateLine(index, 'vatRate', parseFloat(e.target.value))}
                        className="w-full text-sm rounded border-gray-300"
                      >
                        {[0, 5.5, 10, 20].map(rate => (
                          <option key={rate} value={rate}>{rate}%</option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Total HT</label>
                    {line.type === 'subtotal' ? (
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(line.subtotalAmount || calculateSubtotalAtPosition(index))}
                      </span>
                    ) : line.type === 'comment' ? (
                      <span className="text-xs text-gray-500">-</span>
                    ) : (
                      <span className="text-sm font-medium">
                        {formatCurrency(calculateLineTotal(line))}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Actions</label>
                    <div className="flex space-x-1">
                      <div className="flex flex-col space-y-1">
                        <button
                          type="button"
                          onClick={() => handleMoveLineUp(index)}
                          disabled={index === 0}
                          className={`p-1 rounded ${
                            index === 0 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                          }`}
                          title="Monter"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveLineDown(index)}
                          disabled={index === lines.length - 1}
                          className={`p-1 rounded ${
                            index === lines.length - 1
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                          }`}
                          title="Descendre"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(index)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Totaux</h3>
          {showDeposit && onDepositChange && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Acompte :</label>
              <input
                type="number"
                value={depositPercentage || 0}
                onChange={(e) => onDepositChange(parseFloat(e.target.value) || 0)}
                className="w-16 text-sm rounded border-gray-300"
                min="0"
                max="100"
                step="1"
              />
              <span className="text-sm text-gray-600">%</span>
            </div>
          )}
        </div>
        
        {/* Section remise globale */}
        {onGlobalDiscountChange && (
          <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Remise globale</h4>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={globalDiscount || 0}
                onChange={(e) => onGlobalDiscountChange(parseFloat(e.target.value) || 0, globalDiscountType)}
                className="w-20 text-sm rounded border-gray-300"
                min="0"
                step="0.01"
                placeholder="0"
              />
              <select
                value={globalDiscountType}
                onChange={(e) => onGlobalDiscountChange(globalDiscount || 0, e.target.value as 'percentage' | 'amount')}
                className="text-sm rounded border-gray-300"
              >
                <option value="percentage">%</option>
                <option value="amount">€</option>
              </select>
              <span className="text-sm text-gray-600">
                = {formatCurrency(
                  globalDiscountType === 'percentage' 
                    ? Math.round(totalTTC * (globalDiscount || 0) / 100 * 100) / 100
                    : Math.min(totalTTC, globalDiscount || 0)
                )}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total HT:</span>
              <span className="text-sm font-medium">{formatCurrency(totalHT)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total TVA:</span>
              <span className="text-sm font-medium">{formatCurrency(totalVAT)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Total TTC:</span>
              <span className="font-bold text-lg">{formatCurrency(totalTTC)}</span>
            </div>
            {/* Acompte reçu - à déduire */}
            {depositReceived && depositAmount && depositAmount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-green-600">Acompte reçu:</span>
                  <span className="text-sm font-medium text-green-600">
                    -{formatCurrency(depositAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 border-blue-600">
                  <span className="font-bold text-blue-600">Net à facturer:</span>
                  <span className="font-bold text-lg text-blue-600">
                    {formatCurrency(Math.max(0, totalTTC - depositAmount))}
                  </span>
                </div>
              </>
            )}
            {onGlobalDiscountChange && globalDiscount && globalDiscount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-red-600">
                    Remise globale ({globalDiscount}{globalDiscountType === 'percentage' ? '%' : '€'}):
                  </span>
                  <span className="text-sm font-medium text-red-600">
                    -{formatCurrency(
                      globalDiscountType === 'percentage' 
                        ? Math.round(totalTTC * globalDiscount / 100 * 100) / 100
                        : Math.min(totalTTC, globalDiscount)
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 border-blue-600">
                  <span className="font-bold text-blue-600">Net à payer:</span>
                  <span className="font-bold text-lg text-blue-600">
                    {formatCurrency(
                      globalDiscountType === 'percentage' 
                        ? Math.round(totalTTC * (1 - globalDiscount / 100) * 100) / 100
                        : Math.max(0, totalTTC - globalDiscount)
                    )}
                  </span>
                </div>
              </>
            )}
            {showDeposit && depositPercentage && depositPercentage > 0 && (
              <>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium text-blue-600">
                    Acompte ({depositPercentage}%):
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {formatCurrency(depositAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reste à payer:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(totalTTC - depositAmount)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}