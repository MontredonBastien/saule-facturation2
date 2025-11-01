import { QuoteLine } from '../types';

export function calculateLineTotal(line: QuoteLine): number {
  if (line.type === 'subtotal' || line.type === 'comment') {
    return 0;
  }
  
  let baseTotal = Math.round((line.quantity || 0) * (line.priceHT || 0) * 100) / 100;
  
  // Appliquer la remise si elle existe
  if (line.discount && line.discount > 0) {
    if (line.discountType === 'percentage') {
      baseTotal = baseTotal * (1 - (line.discount / 100));
    } else if (line.discountType === 'amount') {
      baseTotal = Math.max(0, baseTotal - line.discount);
    }
  }
  
  return Math.round(baseTotal * 100) / 100;
}

export function calculateTotalHT(lines: QuoteLine[]): number {
  return Math.round(lines.filter(line => !line.type || line.type === 'item')
    .reduce((total, line) => total + calculateLineTotal(line), 0) * 100) / 100;
}

export function calculateTotalVAT(lines: QuoteLine[]): number {
  const total = lines.filter(line => !line.type || line.type === 'item').reduce((total, line) => {
    const lineTotal = calculateLineTotal(line);
    return total + Math.round(lineTotal * (line.vatRate || 0)) / 100;
  }, 0);
  return Math.round(total * 100) / 100;
}

export function calculateTotalTTC(lines: QuoteLine[]): number {
  return Math.round((calculateTotalHT(lines) + calculateTotalVAT(lines)) * 100) / 100;
}

export function applyGlobalDiscount(total: number, discount?: number, discountType?: 'percentage' | 'amount'): number {
  if (!discount || discount <= 0) return total;
  
  if (discountType === 'percentage') {
    return Math.round(total * (1 - discount / 100) * 100) / 100;
  } else {
    return Math.max(0, Math.round((total - discount) * 100) / 100);
  }
}

export function calculateGlobalDiscountAmount(total: number, discount?: number, discountType?: 'percentage' | 'amount'): number {
  if (!discount || discount <= 0) return 0;
  
  if (discountType === 'percentage') {
    return Math.round(total * (discount / 100) * 100) / 100;
  } else {
    return Math.min(total, discount);
  }
}

export function formatCurrency(amount: number, currency = '€'): string {
  const fixed = Math.abs(amount).toFixed(2);
  const parts = fixed.split('.');
  const formattedInteger = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${amount < 0 ? '-' : ''}${formattedInteger},${parts[1]} ${currency}`;
}

export function formatDate(date: Date | string | undefined | any): string {
  if (!date) return '-';

  let d: Date;
  if (typeof date === 'string') {
    d = new Date(date);
  } else if (date instanceof Date) {
    d = date;
  } else if (typeof date === 'object' && date !== null) {
    // Si c'est un objet, essayer de le convertir
    d = new Date(date);
  } else {
    return '-';
  }

  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('fr-FR').format(d);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getVATBreakdown(lines: QuoteLine[]) {
  const vatGroups = new Map();
  
  lines.filter(line => !line.type || line.type === 'item').forEach(line => {
    const rate = line.vatRate || 0;
    const lineTotal = calculateLineTotal(line);
    const vatAmount = Math.round(lineTotal * rate) / 100;
    
    if (vatGroups.has(rate)) {
      const existing = vatGroups.get(rate);
      existing.baseHT += lineTotal;
      existing.vatAmount += vatAmount;
    } else {
      vatGroups.set(rate, {
        rate,
        baseHT: lineTotal,
        vatAmount
      });
    }
  });
  
  return Array.from(vatGroups.values()).map(group => ({
    rate: group.rate,
    baseHT: Math.round(group.baseHT * 100) / 100,
    vatAmount: Math.round(group.vatAmount * 100) / 100
  }));
}