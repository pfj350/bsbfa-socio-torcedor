import { MOCK_USER } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'motion/react';
import { Settings, CreditCard, Ticket, LogOut, Shield } from 'lucide-react';

export default function Profile() {
  const { logout } = useAuth();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-surface border border-white/5 rounded-3xl p-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-neon-green/20 to-transparent" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto bg-dark-bg rounded-full p-1 border-2 border-neon-green mb-4">
            <img 
              src={MOCK_USER.avatar} 
              alt={MOCK_USER.name} 
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          
          <h1 className="text-2xl font-bold mb-1">{MOCK_USER.name}</h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="bg-neon-green text-dark-bg text-xs font-bold px-3 py-1 rounded-full uppercase">
              {MOCK_USER.type}
            </span>
            <span className="text-gray-400 text-sm">Membro desde 2023</span>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
            <div>
              <p className="text-2xl font-bold text-white">{MOCK_USER.points}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Pontos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{MOCK_USER.level}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Nível</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Jogos</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold italic px-2">Configurações</h2>
        
        <div className="bg-dark-surface border border-white/5 rounded-2xl overflow-hidden">
          <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 text-left">
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-neon-green">
              <Ticket size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Meus Ingressos</h3>
              <p className="text-xs text-gray-400">Histórico e ingressos ativos</p>
            </div>
          </button>
          
          <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 text-left">
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-neon-green">
              <CreditCard size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Assinatura e Pagamentos</h3>
              <p className="text-xs text-gray-400">Gerenciar plano premium</p>
            </div>
          </button>
          
          <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 text-left">
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-neon-green">
              <Shield size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Segurança</h3>
              <p className="text-xs text-gray-400">Senha e autenticação</p>
            </div>
          </button>
          
          <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left">
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400">
              <Settings size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-300">Preferências do App</h3>
              <p className="text-xs text-gray-500">Notificações e tema</p>
            </div>
          </button>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors font-bold"
        >
          <LogOut size={20} />
          Sair da conta
        </button>
      </div>
    </div>
  );
}
