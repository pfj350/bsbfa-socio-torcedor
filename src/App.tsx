/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Benefits from '@/pages/Benefits';
import Store from '@/pages/Store';
import Content from '@/pages/Content';
import ContentDetails from '@/pages/ContentDetails';
import Login from '@/pages/Login';
import Guides from '@/pages/Guides';

import Admin from '@/pages/admin/Admin';
import Register from '@/pages/Register';

function ProtectedRoute({ children, reqAdmin = false }: { children: React.ReactNode, reqAdmin?: boolean }) {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute Check:', { isAuthenticated, isLoading, profile, path: location.pathname });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6 gap-4">
        <div className="text-neon-green font-bold animate-pulse text-2xl tracking-widest">CARREGANDO...</div>
        <div className="text-gray-500 text-sm">Verificando conexão com Supabase...</div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 border border-white/10 rounded-lg text-xs hover:bg-white/5 transition-colors"
        >
          Recarregar Site
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (reqAdmin && profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/benefits" element={<ProtectedRoute><Benefits /></ProtectedRoute>} />
          <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
          <Route path="/content" element={<ProtectedRoute><Content /></ProtectedRoute>} />
          <Route path="/content/:id" element={<ProtectedRoute><ContentDetails /></ProtectedRoute>} />
          <Route path="/guides" element={<ProtectedRoute><Guides /></ProtectedRoute>} />
          
          <Route path="/admin/*" element={<ProtectedRoute reqAdmin><Admin /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
