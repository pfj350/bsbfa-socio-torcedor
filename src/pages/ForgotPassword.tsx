import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao enviar o email de recuperação');
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
          <h1 className="text-2xl font-black italic uppercase text-white tracking-widest">Recuperar Acesso</h1>
          <p className="text-gray-400 mt-2">Enviaremos as instruções para seu email</p>
        </div>

        <div className="bg-dark-surface/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Email de Cadastro</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-green transition-colors font-medium"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neon-green hover:bg-neon-green-hover text-dark-bg font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,163,0.15)] disabled:opacity-50"
                >
                  {loading ? 'ENVIANDO...' : 'ENVIAR INSTRUÇÕES'}
                  <ArrowRight size={20} />
                </button>

                <div className="text-center">
                  <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft size={16} />
                    Voltar para o login
                  </Link>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-6"
              >
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-neon-green/10 rounded-full flex items-center justify-center text-neon-green animate-bounce">
                    <CheckCircle2 size={48} />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Email Enviado!</h2>
                  <p className="text-gray-400 text-sm">
                    Confira sua caixa de entrada (e a pasta de spam) para as instruções de recuperação.
                  </p>
                </div>
                <Link 
                  to="/login" 
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all inline-block border border-white/10"
                >
                  VOLTAR PARA O LOGIN
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            Brasília Futebol Americano © 2024
          </p>
        </div>
      </motion.div>
    </div>
  );
}
