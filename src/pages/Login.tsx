import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'motion/react';
import { ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (email && password) {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message === 'Invalid login credentials' 
          ? 'Email ou senha inválidos' 
          : 'Ocorreu um erro ao fazer login');
        setLoading(false);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-neon-green/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img src="/logo-socio.png" alt="Brasília FA Sócio Torcedor" className="h-28 object-contain filter drop-shadow-[0_0_30px_rgba(14,144,31,0.3)]" />
          </div>
          <p className="text-gray-400 mt-2">Área exclusiva do Sócio Premium</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-dark-surface/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-green transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-green transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-neon-green hover:bg-neon-green-hover text-dark-bg font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,163,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
            <ArrowRight size={20} />
          </button>

          <div className="text-center">
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Esqueceu sua senha?
            </a>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">Ainda não tem conta?</p>
          <Link to="/register" className="text-neon-green font-bold hover:underline mt-1 inline-block">
            CRIE SUA CONTA!
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
