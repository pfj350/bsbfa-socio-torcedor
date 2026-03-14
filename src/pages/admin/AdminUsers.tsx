import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/context/AuthContext';
import { Users, Search, Mail, Phone, Calendar, Shield, BadgeCheck, Ban, Trash2, Edit3, X } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data as UserProfile[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.cpf?.includes(searchTerm)
  );

  const handleToggleStatus = async (user: UserProfile) => {
    const nextStatus = user.status === 'active' ? 'blocked' : 'active';
    const { error } = await supabase
      .from('profiles')
      .update({ status: nextStatus })
      .eq('id', user.id);

    if (!error) {
      setUsers(users.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
    }
  };

  const handleUpdateRole = async (user: UserProfile) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    const { error } = await supabase
      .from('profiles')
      .update({ role: nextRole })
      .eq('id', user.id);

    if (!error) {
      setUsers(users.map(u => u.id === user.id ? { ...u, role: nextRole } : u));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-dark-surface/30 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-black italic uppercase text-white">
            GESTÃO DE <span className="text-neon-green">USUÁRIOS</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">Gerencie sócios, mude permissões e controle acessos.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome, e-mail ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-dark-bg border border-white/10 rounded-xl py-2 pl-10 pr-4 w-64 md:w-80 focus:border-neon-green transition-colors outline-none text-sm"
            />
          </div>
          <div className="bg-neon-green/10 px-4 py-2 rounded-xl border border-neon-green/20">
            <span className="text-neon-green font-bold">{filteredUsers.length}</span>
            <span className="text-gray-400 text-xs ml-2 uppercase font-black">Sócios</span>
          </div>
        </div>
      </div>

      <div className="bg-dark-surface/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase text-gray-500 tracking-[0.2em]">
              <th className="p-6 font-black">Sócio</th>
              <th className="p-6 font-black">Identidade</th>
              <th className="p-6 font-black text-center">Nível</th>
              <th className="p-6 font-black text-center">Status</th>
              <th className="p-6 font-black text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-neon-green border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Carregando Base de Dados...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-500 font-bold uppercase italic tracking-widest">
                  Nenhum sócio encontrado na busca
                </td>
              </tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <img 
                        src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`} 
                        alt={user.full_name} 
                        className="w-12 h-12 rounded-full object-cover border border-white/10"
                      />
                      {user.role === 'admin' && (
                        <div className="absolute -top-1 -right-1 bg-neon-green text-dark-bg p-0.5 rounded-full shadow-lg">
                          <Shield size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white uppercase tracking-tight line-clamp-1">{user.full_name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} /> {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-gray-400">ID: {user.member_id}</div>
                    <div className="text-xs font-mono text-gray-500">CPF: {user.cpf}</div>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 uppercase italic">
                    {user.level || 'NOVATO'}
                  </span>
                </td>
                <td className="p-6 text-center">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    user.status === 'active' 
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-neon-green animate-pulse' : 'bg-red-500'}`} />
                    {user.status === 'active' ? 'ATIVO' : 'BLOQUEADO'}
                  </div>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleUpdateRole(user)}
                      className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-neon-green/20 hover:text-neon-green transition-all"
                      title={user.role === 'admin' ? "Remover Admin" : "Tornar Admin"}
                    >
                      <Shield size={18} />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={`p-2 rounded-lg transition-all ${
                        user.status === 'active' 
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                        : 'bg-neon-green/10 text-neon-green hover:bg-neon-green/20'
                      }`}
                      title={user.status === 'active' ? "Bloquear Sócio" : "Ativar Sócio"}
                    >
                      {user.status === 'active' ? <Ban size={18} /> : <BadgeCheck size={18} />}
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setIsModalOpen(true);
                      }}
                      className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                      title="Ver Perfil Detalhado"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detalhes do Usuário */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-bg border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)]"
           >
             <div className="h-32 bg-gradient-to-r from-[#0B3A1C] to-dark-bg relative">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
             </div>
             
             <div className="px-10 pb-10">
                <div className="relative -mt-16 flex items-end justify-between mb-8">
                  <div className="relative">
                    <img 
                      src={selectedUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.full_name}`}
                      alt={selectedUser.full_name}
                      className="w-32 h-32 rounded-[2rem] border-4 border-dark-bg bg-dark-surface object-cover shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-neon-green text-dark-bg px-3 py-1 rounded-full text-xs font-black uppercase italic shadow-lg">
                      MVP
                    </div>
                  </div>
                  <div className="flex gap-3 mb-2">
                    <button className="px-6 py-2.5 bg-neon-green text-dark-bg font-black rounded-xl text-xs uppercase hover:scale-105 active:scale-95 transition-all">SALVAR ALTERAÇÕES</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Nome Completo</label>
                      <div className="text-xl font-bold text-white uppercase italic">{selectedUser.full_name}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">CPF</label>
                      <div className="text-sm font-mono text-gray-300">{selectedUser.cpf}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Sócio desde</label>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar size={14} className="text-neon-green" />
                        {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">E-mail de Acesso</label>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail size={14} className="text-neon-green" />
                        {selectedUser.email}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Telefone / WhatsApp</label>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Phone size={14} className="text-neon-green" />
                        {selectedUser.phone || 'NÃO INFORMADO'}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Pontuação Acumulada</label>
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-neon-green" />
                        <span className="text-xl font-black text-white italic">{selectedUser.points} <span className="text-xs text-gray-500 not-italic ml-1 uppercase">pontos</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t border-white/5 flex justify-between items-center text-xs">
                  <div className="flex gap-4">
                    <span className="text-gray-500 uppercase font-black">UID: <span className="text-gray-400 font-mono lower">{selectedUser.id}</span></span>
                  </div>
                  <button className="text-red-500 hover:text-red-400 font-black uppercase flex items-center gap-2 tracking-widest">
                    <Trash2 size={14} /> EXCLUIR CONTA DEFINITIVAMENTE
                  </button>
                </div>
             </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
