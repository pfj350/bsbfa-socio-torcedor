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
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

function ProtectedRoute({ children, reqAdmin = false }: { children: React.ReactNode, reqAdmin?: boolean }) {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute Check:', { isAuthenticated, isLoading, profile, path: location.pathname });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6 gap-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-green/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-[120px] animate-pulse delay-700" />
        
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin shadow-[0_0_20px_rgba(34,197,94,0.2)]" />
          <div className="space-y-2">
            <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-black italic uppercase tracking-tighter text-white">
              Autenticando<span className="text-neon-green">...</span>
            </h2>
            <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">Sincronizando com Supabase</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-neon-green hover:text-dark-bg transition-all duration-300 active:scale-95"
          >
            Sincronizar Manualmente
          </button>
        </div>
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
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
