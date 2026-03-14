import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import { Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a session (the user clicked the recovery link)
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      setSuccess(true);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao atualizar sua senha');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-black italic uppercase text-white tracking-widest">Nova Senha</h1>
          <p className="text-gray-400 mt-2">Defina sua nova senha de acesso</p>
        </div>

        <div className="bg-dark-surface/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Nova Senha</label>
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

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-green transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-neon-green hover:bg-neon-green-hover text-dark-bg font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,163,0.2)] disabled:opacity-50"
              >
                {loading ? 'ATUALIZANDO...' : 'ATUALIZAR SENHA'}
                <ArrowRight size={20} />
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-neon-green/10 rounded-full flex items-center justify-center text-neon-green">
                  <CheckCircle2 size={48} />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Senha Alterada!</h2>
                <p className="text-gray-400 text-sm">
                  Sua senha foi atualizada com sucesso. Você será redirecionado para o login em instantes.
                </p>
              </div>
              <Link 
                to="/login" 
                className="w-full bg-neon-green text-dark-bg font-bold py-4 rounded-xl transition-all inline-block"
              >
                IR PARA LOGIN AGORA
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs italic uppercase tracking-widest font-bold">
            Brasília Futebol Americano
          </p>
        </div>
      </motion.div>
    </div>
  );
}
