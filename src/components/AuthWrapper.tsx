import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import { Loader2 } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for demo session first
        const demoSession = localStorage.getItem('demoSession');
        if (demoSession === 'true') {
          setSession({ user: { email: 'demo@saulefacturation.fr' } });
          setLoading(false);
          return;
        }

        // Check Supabase auth
        const { supabase } = await import('../lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setSession(session);
        } else {
          setSession(null);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });

        setLoading(false);

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth check failed:', error);
        setSession(null);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  return <>{children}</>;
}