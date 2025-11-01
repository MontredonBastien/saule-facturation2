import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  target?: string;
  action?: string;
}

const steps: OnboardingStep[] = [
  {
    title: 'Bienvenue sur FacturePro !',
    description: 'Nous allons vous guider à travers les fonctionnalités essentielles pour que vous puissiez commencer rapidement.'
  },
  {
    title: 'Configurez votre entreprise',
    description: 'Commencez par renseigner les informations de votre entreprise dans les paramètres. C\'est essentiel pour la conformité de vos documents.',
    action: 'Aller aux paramètres'
  },
  {
    title: 'Créez vos premiers clients',
    description: 'Ajoutez vos clients pour pouvoir leur envoyer des devis et factures. Vous pouvez ajouter plusieurs contacts par client.',
    action: 'Aller aux clients'
  },
  {
    title: 'Préparez votre catalogue',
    description: 'Créez vos articles et services avec leurs prix pour les réutiliser facilement dans vos documents.',
    action: 'Aller aux articles'
  },
  {
    title: 'Créez votre premier devis',
    description: 'Vous êtes prêt à créer votre premier devis ! Sélectionnez un client, ajoutez des articles et envoyez-le par email.',
    action: 'Créer un devis'
  },
  {
    title: 'Tableau de bord',
    description: 'Suivez votre activité en temps réel : CA, factures en attente, statistiques et bien plus encore.'
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  const step = steps[currentStep];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 transform transition-all">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <span className="text-sm font-semibold text-blue-600">
                Étape {currentStep + 1} sur {steps.length}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step.title}
            </h2>
            <p className="text-gray-600 text-lg">
              {step.description}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-8">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-all ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Passer le guide
          </button>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Terminer
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

        {step.action && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button className="w-full py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition">
              {step.action}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasSeenOnboarding) {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding
  };
}
