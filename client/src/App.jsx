/**
 * App.jsx — root router and auth context for TrustUpdate.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import VerifyUpdate from './pages/VerifyUpdate';
import VerificationResult from './pages/VerificationResult';
import VerificationHistory from './pages/VerificationHistory';
import TrustedSoftware from './pages/TrustedSoftware';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import CyberBackground from './components/CyberBackground';

// ─── Auth Context ─────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const login = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Layout Wrapper ───────────────────────────────────────────────────────────
const AppLayout = ({ children }) => (
  <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
    {/* High-tech animated cybersecurity background with 3D grid and floating plasma orbs */}
    <CyberBackground />
    <Sidebar />
    <main style={{ flex: 1, overflowY: 'auto', padding: '2.25rem 2.5rem', position: 'relative', zIndex: 1 }}>
      {children}
    </main>
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/verify" element={<VerifyUpdate />} />
                    <Route path="/result" element={<VerificationResult />} />
                    <Route path="/history" element={<VerificationHistory />} />
                    <Route path="/trusted-software" element={<TrustedSoftware />} />
                  </Routes>
                </AppLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
