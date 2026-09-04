import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { AccessibilityModal } from './components/layout/AccessibilityModal';

// Pages
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { HealthcarePage } from './pages/HealthcarePage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { ProfilePage } from './pages/ProfilePage';
import { TimelinePage } from './pages/TimelinePage';
import { ShareViewPage } from './pages/ShareViewPage';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [healthcareFilter, setHealthcareFilter] = useState<string | undefined>(undefined);

  // Handle public QR share URLs and legacy hash URLs.
  // Preferred format: /share/<token> so mobile QR scanners open a normal page route.
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
      const shareMatch = pathname.match(/^\/share\/([^/]+)$/);

      if (shareMatch?.[1]) {
        setShareToken(decodeURIComponent(shareMatch[1]));
        setCurrentPage('share-view');
        return;
      }

      const hash = window.location.hash;
      if (hash.startsWith('#share-')) {
        const token = hash.replace('#share-', '');
        setShareToken(token);
        setCurrentPage('share-view');
      } else if (hash.startsWith('#/share/')) {
        const token = hash.replace('#/share/', '');
        setShareToken(token);
        setCurrentPage('share-view');
      } else if (hash.startsWith('#')) {
        const page = hash.replace('#', '');
        if (page) setCurrentPage(page);
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Protected route redirects
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'emergency' && currentPage !== 'share-view') {
          setCurrentPage('login');
        }
      } else {
        if (currentPage === 'login' || currentPage === 'register') {
          setCurrentPage('dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, currentPage]);

  const navigateTo = (page: string, params?: any) => {
    if (page === 'healthcare' && params?.filter) {
      setHealthcareFilter(params.filter);
    } else {
      setHealthcareFilter(undefined);
    }

    if (page !== 'share-view') {
      setShareToken(null);
      window.location.hash = page;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070a13', color: '#10b981' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <div style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.01em' }}>
            Accessible Healthcare Support
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            Initializing Command Center...
          </div>
        </div>
      </div>
    );
  }

  // Standalone Public Share View (e.g. Scanned QR Code from phone)
  if (currentPage === 'share-view' && shareToken) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
        <Header onNavigate={navigateTo} currentPage={currentPage} />
        <ShareViewPage token={shareToken} onNavigateHome={() => navigateTo('dashboard')} />
        <AccessibilityModal />
      </div>
    );
  }

  // Auth pages (Login / Register) without full sidebar
  if (!isAuthenticated && (currentPage === 'login' || currentPage === 'register')) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
        <Header onNavigate={navigateTo} currentPage={currentPage} />
        {currentPage === 'register' ? (
          <RegisterPage onNavigate={navigateTo} />
        ) : (
          <LoginPage onNavigate={navigateTo} />
        )}
        <AccessibilityModal />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={navigateTo} />

      {/* Main Content Area */}
      <div className="main-content-area">
        <Header onNavigate={navigateTo} currentPage={currentPage} />

        <main style={{ flex: 1 }}>
          {currentPage === 'dashboard' && <DashboardPage onNavigate={navigateTo} />}
          {currentPage === 'healthcare' && (
            <HealthcarePage initialFilter={healthcareFilter} onNavigate={navigateTo} />
          )}
          {currentPage === 'appointments' && <AppointmentsPage onNavigate={navigateTo} />}
          {currentPage === 'documents' && <DocumentsPage onNavigate={navigateTo} />}
          {currentPage === 'ai-assistant' && <AiAssistantPage onNavigate={navigateTo} />}
          {currentPage === 'emergency' && <EmergencyPage onNavigate={navigateTo} />}
          {currentPage === 'profile' && <ProfilePage onNavigate={navigateTo} />}
          {currentPage === 'timeline' && <TimelinePage onNavigate={navigateTo} />}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav currentPage={currentPage} onNavigate={navigateTo} />
      </div>

      {/* Global Accessibility Modal */}
      <AccessibilityModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <AppContent />
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
