import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TimeTracker } from './components/TimeTracker';
import { AdminDashboard } from './components/AdminDashboard';
import { useAuth } from './hooks/useAuth';
import { Building2, LogOut, Globe2 } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function AppContent() {
  const { user, signIn, signOut } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="flex items-center justify-center mb-8">
            <Building2 className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">ContaSync:Payroll</h1>
          <p className="text-center text-gray-600 mb-6">{t('loginSubtitle')}</p>
          <button
            onClick={() => signIn('employee@example.com')}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors mb-2"
          >
            {t('signInAsEmployee')}
          </button>
          <button
            onClick={() => signIn('admin@example.com')}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            {t('signInAsAdmin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-blue-500" />
                <span className="ml-2 text-xl font-semibold">ContaSync:Payroll</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <Globe2 className="w-5 h-5 mr-2" />
                  {language === 'en' ? 'ES' : 'EN'}
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  {t('signOut')}
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route 
              path="/" 
              element={
                user.role === 'admin' 
                  ? <Navigate to="/admin" replace /> 
                  : <TimeTracker />
              } 
            />
            <Route 
              path="/admin" 
              element={
                user.role === 'admin' 
                  ? <AdminDashboard /> 
                  : <Navigate to="/" replace />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;