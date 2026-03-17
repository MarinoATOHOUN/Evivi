
import React from 'react';
import { HashRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './app/router';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

const AppContent: React.FC = () => {
  const location = useLocation();

  // Hide navigation on public pages
  const publicPaths = ['/login', '/register'];
  const isPublicPage = publicPaths.includes(location.pathname);

  return (
    <div className="relative bg-[#FDF8F5] min-h-screen flex flex-col lg:flex-row">
      {/* Desktop Sidebar (hidden on mobile and public pages) */}
      {!isPublicPage && <Sidebar />}

      {/* Main Content Area - Shifted for Sidebar on large screens */}
      <div className={`flex-1 ${!isPublicPage ? 'lg:ml-24 xl:ml-64' : ''} transition-all duration-300`}>
        <AppRouter />
      </div>

      {/* Mobile Bottom Navigation (hidden on desktop and public pages) */}
      {!isPublicPage && <Navbar />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
