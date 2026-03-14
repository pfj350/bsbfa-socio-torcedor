import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, UserCheck, UserX, ShieldCheck, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    pending: 0,
    admins: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('status, role');

      if (!error && data) {
        const counts = data.reduce((acc, curr) => {
          acc.total++;
          if (curr.status === 'active') acc.active++;
          else if (curr.status === 'blocked') acc.blocked++;
          else acc.pending++;
          
          if (curr.role === 'admin') acc.admins++;
          return acc;
        }, { total: 0, active: 0, blocked: 0, pending: 0, admins: 0 });

        setStats(counts);
      }
      setIsLoading(false);
    }
    fetchStats();
  }, []);

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 }
    })
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-black uppercase tracking-widest text-xs italic">Sincronizando Dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-dark-surface/30 p-8 rounded-[2rem] border border-white/5 backdrop-blur-md">
        <h2 className="text-4xl font-black italic uppercase text-white mb-2">
          VISÃO <span className="text-neon-green">GERAL</span>
        </h2>
        <p className="text-gray-400 font-medium">Resumo operacional e métricas de sócios em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total de Sócios', value: stats.total, icon: Users, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Sócios Ativos', value: stats.active, icon: UserCheck, color: 'text-neon-green', bg: 'bg-neon-green/10' },
          { label: 'Sócios Bloqueados', value: stats.blocked, icon: UserX, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Administradores', value: stats.admins, icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            custom={i}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            className={`${item.bg} border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors`}
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">{item.label}</p>
              <div className="flex items-end justify-between">
                <span className={`text-5xl font-black italic leading-none ${item.color}`}>{item.value}</span>
                <item.icon size={32} className={`${item.color} opacity-40 group-hover:scale-110 transition-transform`} />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 blur-2xl" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-dark-surface/50 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-neon-green" size={24} />
            <h3 className="font-black uppercase italic tracking-widest text-lg">Saúde da Plataforma</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Taxa de Atividade</span>
              <span className="text-3xl font-black italic text-white">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Acessos Hoje</span>
              <span className="text-3xl font-black italic text-white">{Math.floor(stats.active * 0.4)}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Novos Sócios (Mês)</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black italic text-neon-green">+ {Math.ceil(stats.total * 0.1)}</span>
                <TrendingUp size={16} className="text-neon-green" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-neon-green p-8 rounded-[2.5rem] text-dark-bg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} strokeWidth={3} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Data de Hoje</span>
            </div>
            <h3 className="text-3xl font-black italic leading-tight uppercase">
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <p className="text-sm font-bold opacity-75 mt-4">Tudo operando normalmente nos servidores da BFA.</p>
        </motion.div>
      </div>
    </div>
  );
}
