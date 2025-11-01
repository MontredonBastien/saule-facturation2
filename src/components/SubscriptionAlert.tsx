import React from 'react';
import { AlertTriangle, CreditCard, X } from 'lucide-react';

interface SubscriptionAlertProps {
  warnings: string[];
  planName?: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

export default function SubscriptionAlert({
  warnings,
  planName,
  onUpgrade,
  onDismiss
}: SubscriptionAlertProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Limite{warnings.length > 1 ? 's' : ''} de quota atteinte{warnings.length > 1 ? 's' : ''}
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="list-disc pl-5 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
          {onUpgrade && (
            <div className="mt-4">
              <button
                onClick={onUpgrade}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Passer au plan supérieur
              </button>
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex text-yellow-400 hover:text-yellow-600 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function TrialAlert({
  daysRemaining,
  onUpgrade
}: {
  daysRemaining: number;
  onUpgrade?: () => void;
}) {
  if (daysRemaining <= 0) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Période d'essai
          </h3>
          <div className="mt-1 text-sm text-blue-700">
            <p>
              Il vous reste <strong>{daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</strong> d'essai gratuit.
            </p>
          </div>
          {onUpgrade && (
            <div className="mt-4">
              <button
                onClick={onUpgrade}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Souscrire maintenant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InactiveSubscriptionAlert({
  status,
  onReactivate
}: {
  status: string;
  onReactivate?: () => void;
}) {
  const getMessage = () => {
    switch (status) {
      case 'past_due':
        return 'Votre paiement a échoué. Veuillez mettre à jour vos informations de paiement.';
      case 'canceled':
        return 'Votre abonnement a été annulé. Réactivez-le pour continuer à utiliser toutes les fonctionnalités.';
      case 'unpaid':
        return 'Votre abonnement est en attente de paiement. Régularisez votre situation pour éviter la suspension.';
      default:
        return 'Votre abonnement n\'est pas actif.';
    }
  };

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Abonnement inactif
          </h3>
          <div className="mt-1 text-sm text-red-700">
            <p>{getMessage()}</p>
          </div>
          {onReactivate && (
            <div className="mt-4">
              <button
                onClick={onReactivate}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Réactiver l'abonnement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
