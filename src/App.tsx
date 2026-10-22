import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { FindTeammatesPage } from './pages/FindTeammatesPage';
import { TeammateDetailsPage } from './pages/TeammateDetailsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { InvitationsPage } from './pages/InvitationsPage';
import { MyTeamPage } from './pages/MyTeamPage';
import { TasksPage } from './pages/TasksPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MyProfilePage } from './pages/MyProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

function MainApp() {
  const { user, isLoading } = useAuth();
  
  // Navigation state management
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash) {
        setCurrentPath(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = `#/${path}`;
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Extract base route and URL query params
  const [baseRoute, queryString] = currentPath.split('?');
  const queryParams = new URLSearchParams(queryString || '');

  if (isLoading) {
    return <LoadingSpinner message="Starting ProjectMate..." fullHeight />;
  }

  // Unauthenticated user attempting to access private routes
  const publicRoutes = ['landing', 'login', 'register'];
  if (!user && !publicRoutes.includes(baseRoute)) {
    return <LoginPage onNavigate={navigate} />;
  }

  // Authenticated user on landing or auth pages can view them or go to dashboard
  if (!user) {
    if (baseRoute === 'login') return <LoginPage onNavigate={navigate} />;
    if (baseRoute === 'register') return <RegisterPage onNavigate={navigate} />;
    return <LandingPage onNavigate={navigate} />;
  }

  // Profile setup onboarding
  if (baseRoute === 'profile-setup') {
    return <ProfileSetupPage onNavigate={navigate} />;
  }

  // Authenticated application views wrapped in AppLayout
  const renderContent = () => {
    switch (baseRoute) {
      case 'dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case 'find-teammates':
        return (
          <FindTeammatesPage
            onNavigate={navigate}
            initialSearch={queryParams.get('search') || ''}
          />
        );
      case 'teammate-details': {
        const studentId = queryParams.get('id') || '';
        const projectId = queryParams.get('projectId') || undefined;
        return (
          <TeammateDetailsPage
            studentId={studentId}
            projectId={projectId}
            onNavigate={navigate}
          />
        );
      }
      case 'projects':
        return <ProjectsPage onNavigate={navigate} />;
      case 'create-project':
        return <CreateProjectPage onNavigate={navigate} />;
      case 'project-details': {
        const projectId = queryParams.get('id') || '';
        return <ProjectDetailsPage projectId={projectId} onNavigate={navigate} />;
      }
      case 'invitations':
        return <InvitationsPage onNavigate={navigate} />;
      case 'my-team': {
        const teamId = queryParams.get('teamId') || undefined;
        return <MyTeamPage initialTeamId={teamId} onNavigate={navigate} />;
      }
      case 'tasks':
        return <TasksPage onNavigate={navigate} />;
      case 'notifications':
        return <NotificationsPage onNavigate={navigate} />;
      case 'profile':
        return <MyProfilePage onNavigate={navigate} />;
      case 'settings':
        return <SettingsPage onNavigate={navigate} />;
      case 'landing':
      case 'login':
      case 'register':
      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <AppLayout activePage={baseRoute} onNavigate={navigate}>
      {renderContent()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
