import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, ShoppingBag, Trophy, BookOpen, PlayCircle, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


import AdminStore from './AdminStore';
import AdminBenefits from './AdminBenefits';
import AdminGuides from './AdminGuides';
import AdminContent from './AdminContent';
import AdminUsers from './AdminUsers';
import AdminOverview from './AdminOverview';

// Placeholders for parts not yet implemented

const ADMIN_NAV = [
  { label: 'Visão Geral', path: '/admin', icon: Settings },
  { label: 'Usuários', path: '/admin/users', icon: Users },
  { label: 'Loja', path: '/admin/store', icon: ShoppingBag },
  { label: 'Benefícios', path: '/admin/benefits', icon: Trophy },
  { label: 'Guias', path: '/admin/guides', icon: BookOpen },
  { label: 'Conteúdo', path: '/admin/content', icon: PlayCircle },
];

export default function Admin() {
  const location = useLocation();
  const { logout } = useAuth();


  return (
    <div className="flex h-screen bg-dark-bg text-white font-sans overflow-hidden">
      {/* Sidebar do Admin */}
      <aside className="w-64 border-r border-white/5 bg-dark-surface/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <Link to="/" className="text-xl font-bold italic tracking-wider text-neon-green">
            BFA<span className="text-white">.ADMIN</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                  ? 'bg-neon-green/10 text-neon-green font-bold' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-neon-green' : 'text-gray-500'} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-bold">SAIR</span>
          </button>
        </div>
      </aside>


      {/* Conteúdo Principal do Admin */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 bg-dark-bg/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold">Painel de Administração</h1>
        </header>
        
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Routes>
              <Route path="/" element={<AdminOverview />} />
              <Route path="/users" element={<AdminUsers />} />
              <Route path="/store" element={<AdminStore />} />
              <Route path="/benefits" element={<AdminBenefits />} />
              <Route path="/guides" element={<AdminGuides />} />
              <Route path="/content" element={<AdminContent />} />
            </Routes>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
