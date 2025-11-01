import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface QuotaAlertProps {
  companyId?: string;
}

interface QuotaStatus {
  maxUsers: number | null;
  currentUsers: number;
  remainingUsers: number | null;
  quotaReached: boolean;
  planName: string;
}

const QuotaAlert: React.FC<QuotaAlertProps> = ({ companyId }) => {
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      loadQuotaStatus();
    } else {
      setLoading(false);
    }
  }, [companyId]);

  const loadQuotaStatus = async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('company_quota_status')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) {
        console.error('Erreur chargement quota:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setQuotaStatus({
          maxUsers: data.max_users,
          currentUsers: data.current_users,
          remainingUsers: data.remaining_users,
          quotaReached: data.quota_reached,
          planName: data.plan_name || 'Aucun plan',
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement quota:', error);
      setLoading(false);
    }
  };

  // Pas de company_id = mode démo, pas d'alerte
  if (!companyId || loading) {
    return null;
  }

  // Pas de limite = illimité, pas d'alerte
  if (!quotaStatus || quotaStatus.maxUsers === null) {
    return null;
  }

  const { maxUsers, currentUsers, remainingUsers, quotaReached, planName } = quotaStatus;

  // Quota atteint
  if (quotaReached) {
    return (
      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Quota d'utilisateurs atteint
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Vous avez atteint la limite de <strong>{maxUsers} utilisateurs</strong> de votre
              plan <strong>{planName}</strong>. Pour ajouter de nouveaux utilisateurs, vous devez
              soit désactiver un utilisateur existant, soit mettre à niveau votre plan.
            </p>
            <p className="text-sm text-red-700 mt-2">
              <strong>Utilisateurs actifs :</strong> {currentUsers} / {maxUsers}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Proche de la limite (80% ou plus)
  const usagePercent = (currentUsers / maxUsers) * 100;
  if (usagePercent >= 80) {
    return (
      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Quota bientôt atteint
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Vous approchez de la limite de votre plan <strong>{planName}</strong>.
              Il vous reste <strong>{remainingUsers} place(s)</strong> disponible(s).
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              <strong>Utilisateurs actifs :</strong> {currentUsers} / {maxUsers} (
              {usagePercent.toFixed(0)}%)
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tout va bien, affichage discret
  return (
    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Info className="w-4 h-4 text-blue-600 mr-2" />
          <p className="text-sm text-blue-700">
            <strong>Quota :</strong> {currentUsers} / {maxUsers} utilisateurs utilisés
            {remainingUsers !== null && ` (${remainingUsers} restant(s))`}
          </p>
        </div>
        <span className="text-xs text-blue-600 font-medium">{planName}</span>
      </div>
    </div>
  );
};

export default QuotaAlert;
