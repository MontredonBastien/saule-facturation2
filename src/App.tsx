import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import QuotesPage from './pages/QuotesPage';
import InvoicesPage from './pages/InvoicesPage';
import CreditsPage from './pages/CreditsPage';
import ArticlesPage from './pages/ArticlesPage';
import ClientsPage from './pages/ClientsPage';
import EmailsPage from './pages/EmailsPage';
import SharedDocumentPage from './pages/SharedDocumentPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import SuperAdminPage from './pages/SuperAdminPage';
import AccountantClientsPage from './pages/AccountantClientsPage';
import LandingPage from './pages/LandingPage';
import DocumentationPage from './pages/DocumentationPage';
import LicensePage from './pages/LicensePage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import { AppProvider } from './contexts/AppContext';
import AuthWrapper from './components/AuthWrapper';
import OnboardingTour, { useOnboarding } from './components/OnboardingTour';

export default function App() {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [isSharedView, setIsSharedView] = useState(false);
  const [showPublicPage, setShowPublicPage] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;

    if (path.startsWith('/share/')) {
      setIsSharedView(true);
    } else if (path === '/' || path === '') {
      setShowPublicPage('landing');
    } else if (path === '/docs') {
      setShowPublicPage('docs');
    } else if (path === '/license') {
      setShowPublicPage('license');
    } else if (path === '/legal/terms') {
      setShowPublicPage('terms');
    } else if (path === '/legal/privacy') {
      setShowPublicPage('privacy');
    }
  }, []);

  if (isSharedView) {
    return <SharedDocumentPage />;
  }

  if (showPublicPage === 'landing') {
    return <LandingPage />;
  }

  if (showPublicPage === 'docs') {
    return <DocumentationPage />;
  }

  if (showPublicPage === 'license') {
    return <LicensePage />;
  }

  if (showPublicPage === 'terms') {
    return <TermsPage />;
  }

  if (showPublicPage === 'privacy') {
    return <PrivacyPage />;
  }

  const renderCurrentPage = () => {
    switch (currentModule) {
      case 'dashboard':
        return <DashboardPage />;
      case 'quotes':
        return <QuotesPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'credits':
        return <CreditsPage />;
      case 'articles':
        return <ArticlesPage />;
      case 'clients':
        return <ClientsPage />;
      case 'emails':
        return <EmailsPage />;
      case 'users':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage />;
      case 'superadmin':
        return <SuperAdminPage />;
      case 'accountant-clients':
        return <AccountantClientsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AuthWrapper>
      <AppProvider>
        <div className="min-h-screen bg-gray-50">
          <Layout
            currentModule={currentModule}
            onModuleChange={setCurrentModule}
          >
            {renderCurrentPage()}
          </Layout>
        </div>
      </AppProvider>
    </AuthWrapper>
  );
}