import React, { useState } from 'react';
import { Eye, EyeOff, Building, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mode démo - bypass Supabase
    if (email === 'demo@saulefacturation.fr' && password === 'demo123') {
      setLoading(false);
      setDemoMode(true);
      localStorage.setItem('demoSession', 'true');
      window.location.reload();
      return;
    }

    // Validation pour l'inscription
    if (isSignUp && (!email || !password || !fullName || !companyName)) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    if (isSignUp && password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      const { supabase } = await import('../lib/supabase');

      if (isSignUp) {
        // Inscription avec Supabase
        // La company et le profile sont créés automatiquement par un trigger SQL
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              company_name: companyName
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Vérifier si l'email doit être confirmé
          if (data.user.identities && data.user.identities.length === 0) {
            alert('Compte créé avec succès ! Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte mail et cliquer sur le lien de confirmation pour activer votre compte.');
          } else {
            alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
          }
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setFullName('');
          setCompanyName('');
        }
      } else {
        // Connexion avec Supabase
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
      }
    } catch (error: any) {
      console.error('Auth error:', error);

      if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
        setError('Connexion à la base de données impossible. Vérifiez votre connexion internet ou utilisez le mode démo : demo@saulefacturation.fr / demo123');
      } else if (error.message?.includes('already registered')) {
        setError('Un compte avec cet email existe déjà');
      } else if (error.message?.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect');
      } else {
        setError(error.message || 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Building className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Saule Facturationn</h2>
          <p className="mt-2 text-gray-600">
            {isSignUp ? 'Créer votre compte' : 'Connectez-vous à votre compte'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mon Entreprise SARL"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="votre@email.fr"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              isSignUp ? 'Créer le compte' : 'Se connecter'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
            </button>
          </div>
        </form>

        {/* Demo credentials info */}
        {!isSignUp && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">🎯 Compte de démonstration</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Email:</strong> demo@saulefacturation.fr</p>
              <p><strong>Mot de passe:</strong> demo123</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('demo@saulefacturation.fr');
                setPassword('demo123');
              }}
              className="mt-2 w-full text-xs bg-blue-100 text-blue-700 py-1 px-2 rounded hover:bg-blue-200"
            >
              Utiliser les codes de démo
            </button>
            <div className="mt-2 text-xs text-blue-600">
              💡 Mode démo : données stockées localement
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
