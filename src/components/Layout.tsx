import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/lib/data';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Menu, LogOut, Settings, X, ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';


export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { logout, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo-socio.png" alt="Brasília FA Sócio Torcedor" className="h-8 object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-white/5 rounded-xl text-neon-green hover:bg-neon-green/10 transition-all active:scale-90"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-dark-surface border-l border-white/10 z-[70] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <img src="/logo-socio.png" alt="Logo" className="h-10 object-contain" />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex items-center gap-4 bg-neon-green/5 border-b border-white/5">
                <div className="w-12 h-12 rounded-xl border-2 border-neon-green/30 overflow-hidden">
                  <img src={profile?.avatar_url || "/avatars/helmet-front.png"} alt={`${profile?.full_name || 'Usuário'} avatar`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 truncate">
                  <p className="text-sm font-black text-white truncate uppercase italic">{profile?.full_name}</p>
                  <p className="text-[10px] text-neon-green font-bold tracking-widest uppercase">{profile?.role === 'admin' ? 'Administrador' : 'Sócio Torcedor'}</p>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Navegação</div>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl transition-all",
                        isActive ? "bg-neon-green text-dark-bg font-bold shadow-lg shadow-neon-green/20" : "text-gray-400 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <span className="text-sm uppercase tracking-wider">{item.label}</span>
                      </div>
                      <ChevronRight size={16} className={isActive ? "text-dark-bg" : "text-gray-600"} />
                    </Link>
                  );
                })}

                {profile?.role === 'admin' && (
                  <>
                    <div className="px-4 py-2 pt-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Administração</div>
                    <Link
                      to="/admin"
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-neon-green/20 text-neon-green"
                    >
                      <div className="flex items-center gap-3">
                        <Settings size={20} />
                        <span className="text-sm uppercase tracking-wider font-bold">Painel Admin</span>
                      </div>
                      <ChevronRight size={16} />
                    </Link>
                  </>
                )}
              </nav>

              <div className="p-6 border-t border-white/5">
                <button 
                  onClick={logout}
                  className="flex items-center gap-3 w-full p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold justify-center"
                >
                  <LogOut size={20} />
                  <span>SAIR DA CONTA</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-surface border-r border-white/5 h-screen sticky top-0 p-6">
        <div className="flex justify-center mb-10">
          <img src="/logo-socio.png" alt="Brasília FA Sócio Torcedor" className="h-16 object-contain" />
        </div>

        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "text-dark-bg font-bold" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-neon-green"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={20} className="relative z-10" />
                <span className="relative z-10 font-medium">{item.label}</span>
              </Link>
            );
          })}

          {profile?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden text-neon-green hover:bg-neon-green/10"
            >
              <span className="font-bold tracking-widest text-sm uppercase">Painel Admin</span>
            </Link>
          )}
        </nav>



        <div className="pt-6 border-t border-white/5 mt-auto">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-bold">SAIR DA CONTA</span>
          </button>
        </div>
      </aside>


      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-8 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-surface/90 backdrop-blur-lg border-t border-white/10 px-6 py-4 z-50 pb-safe">
        <div className="flex justify-between items-center">
          {NAV_ITEMS.slice(0, 6).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors relative",
                  isActive ? "text-neon-green" : "text-gray-500"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full transition-all",
                  isActive && "bg-neon-green/10"
                )}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {isActive && (
                  <motion.span 
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-4 w-1 h-1 bg-neon-green rounded-full"
                  />
                )}
              </Link>
            );
          })}

        </div>
      </nav>
    </div>
  );
}
