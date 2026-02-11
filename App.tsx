import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import ClientPage from './pages/ClientPage';
import TechnicianPage from './pages/TechnicianPage';
import AdminPage from './pages/AdminPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import { Role } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { showToast } from './utils/toast';

// --- Components ---

const RequireAuth: React.FC<{ children: React.ReactElement; allowedRoles: Role[] }> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <div className="p-8 text-center text-red-600">Access Denied</div>;
  }

  return children;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Check if we are on the client "domain"
  const isClientPage = location.pathname.startsWith('/client');

  const getLinkClass = (path: string) => {
    const base = "px-3 py-2 rounded-md text-sm font-medium transition-colors ";
    return location.pathname === path 
      ? base + "bg-blue-600 text-white" 
      : base + "text-gray-600 hover:bg-gray-100";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* If on client page, clicking title just reloads client page or stays there. */}
              {isClientPage ? (
                <span className="text-xl font-bold text-blue-600 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Gestion Contrats
                </span>
              ) : (
                <Link to="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Gestion Contrats <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded ml-2 hidden sm:inline-block">Internal Staff</span>
                </Link>
              )}
            </div>

            {/* If isClientPage is true, we hide all staff links to simulate separate domain */}
            {!isClientPage && (
              <div className="flex items-center space-x-2">
                <Link to="/client" className={`hidden md:block ${getLinkClass('/client')}`}>Client View</Link>
                
                {user && (
                    <>
                      {user.role === Role.TECHNICIAN && <Link to="/technician" className={getLinkClass('/technician')}>Technician</Link>}
                      {user.role === Role.ADMIN && <Link to="/admin" className={getLinkClass('/admin')}>Admin</Link>}
                      <div className="ml-4 flex items-center gap-3 pl-4 border-l">
                          <span className="text-xs text-gray-500 font-semibold hidden sm:inline-block">{user.name}</span>
                          <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">Logout</button>
                      </div>
                    </>
                )}
                
                {!user && (
                    <Link to="/login" className={getLinkClass('/login')}>Staff Login</Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-grow w-full mx-auto">
        {children}
      </main>
      <footer className="bg-white border-t mt-auto no-print">
        <div className="max-w-7xl mx-auto py-6 px-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Gestion Contrats Services. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/client" element={<ClientPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            <Route 
                path="/technician" 
                element={
                    <RequireAuth allowedRoles={[Role.TECHNICIAN, Role.ADMIN]}>
                        <TechnicianPage />
                    </RequireAuth>
                } 
            />
            
            <Route 
                path="/admin" 
                element={
                    <RequireAuth allowedRoles={[Role.ADMIN]}>
                        <AdminPage />
                    </RequireAuth>
                } 
            />
          </Routes>
        </Layout>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
};

// Simple Toast Implementation
const ToastContainer = () => {
  const [toasts, setToasts] = React.useState<{id: number, msg: string, type: 'success'|'error'}[]>([]);

  React.useEffect(() => {
    // Listen for custom events
    const handleToast = (e: CustomEvent) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, msg: e.detail.msg, type: e.detail.type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };
    window.addEventListener('app-toast' as any, handleToast as any);
    return () => window.removeEventListener('app-toast' as any, handleToast as any);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-[60]">
      {toasts.map(t => (
        <div key={t.id} className={`p-4 rounded-lg shadow-xl text-white text-sm font-medium max-w-sm animate-fade-in ${t.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
};

export default App;