import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import { ArrowRight, Lock, Mail, User, Phone, Calendar as CalendarIcon, CreditCard, AlertCircle, Upload, Check } from 'lucide-react';

const PRESET_AVATARS = [
  { src: '/avatars/helmet-front.png', label: 'Capacete' },
  { src: '/avatars/helmet-side.png', label: 'Perfil' },
  { src: '/avatars/football.png', label: 'Bola' },
  { src: '/avatars/jersey.png', label: 'Uniforme' },
  { src: '/avatars/shield.png', label: 'Escudo' },
  { src: '/avatars/flags.png', label: 'Bandeiras' },
];

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    cpf: '',
    phone: '',
    birthDate: '',
    avatarUrl: '/avatars/helmet-front.png'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `temp_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `registration/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatarUrl: data.publicUrl }));
    } catch (error) {
      alert('Erro ao subir a foto. Tente novamente.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          cpf: formData.cpf,
          phone: formData.phone,
          birth_date: formData.birthDate,
          avatar_url: formData.avatarUrl,
          role: 'user'
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-surface/50 p-8 rounded-3xl border border-neon-green/30 text-center max-w-md"
        >
          <div className="w-16 h-16 bg-neon-green/20 text-neon-green rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Cadastro Realizado!</h2>
          <p className="text-gray-400">Verifique seu email para confirmar o cadastro e/ou faça login.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center py-12 px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-neon-green/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold italic uppercase"><span className="text-neon-green">INSCREVA-SE</span></h1>
          <p className="text-gray-400 mt-2">Preencha seus dados para criar sua conta Sócio Torcedor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-dark-surface/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold">
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </div>
          )}


          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                name="fullName"
                type="text" 
                value={formData.fullName}
                onChange={handleChange}
                maxLength={16}
                className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-green transition-colors"
                placeholder="Ex: João da Silva"
                required
              />
            </div>
            <div className="text-[10px] text-gray-500 text-right mt-1">Máximo 16 caracteres para caber no cartão digital</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">CPF</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  name="cpf"
                  type="text" 
                  value={formData.cpf}
                  onChange={handleChange}
                  className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-green transition-colors"
                  placeholder="000.000.000-00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Data de Nascimento</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  name="birthDate"
                  type="date" 
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-green transition-colors [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Telefone / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  name="phone"
                  type="tel" 
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-green transition-colors"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  name="email"
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-green transition-colors"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Senha (Min 6 caracteres)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                name="password"
                type="password" 
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-neon-green transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Profile Picture Selection - Bottom */}
          <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-neon-green/20 rounded-3xl blur-xl group-hover:bg-neon-green/30 transition-all" />
                <img 
                  src={formData.avatarUrl} 
                  alt="Preview" 
                  className="w-24 h-32 rounded-3xl border-2 border-neon-green/50 object-cover relative z-10 shadow-2xl bg-dark-bg"
                />
                <div className="absolute -bottom-2 -right-2 bg-neon-green text-dark-bg p-1.5 rounded-full z-20 shadow-lg">
                  <User size={14} strokeWidth={3} />
                </div>
              </div>
              <div className="text-center">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Escolha sua foto de perfil</label>
                <p className="text-[9px] text-gray-500 font-bold">Recomendado: 3x4 (Vertical, estilo documento)</p>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {PRESET_AVATARS.map((avatar) => {
                const isSelected = formData.avatarUrl === avatar.src;
                return (
                  <button
                    key={avatar.src}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: avatar.src })}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                      isSelected ? 'border-neon-green ring-4 ring-neon-green/10 scale-105' : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img src={avatar.src} alt={avatar.label} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-neon-green/10 flex items-center justify-center">
                        <Check size={16} className="text-neon-green" strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <label 
                className={`flex items-center justify-center gap-3 w-full p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer group ${
                  uploadingAvatar ? 'border-neon-green/20 bg-neon-green/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <Upload size={18} className={uploadingAvatar ? 'text-neon-green animate-bounce' : 'text-gray-500 group-hover:text-neon-green'} />
                <span className="text-xs font-bold text-gray-400 group-hover:text-gray-300">
                  {uploadingAvatar ? 'SUBINDO FOTO...' : 'ENVIAR FOTO PERSONALIZADA'}
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  disabled={uploadingAvatar || loading} 
                />
              </label>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-neon-green hover:bg-neon-green-hover text-dark-bg font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-6 shadow-[0_0_20px_rgba(0,255,163,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'CADASTRANDO...' : 'FINALIZAR CADASTRO'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">Já possui uma conta?</p>
          <Link to="/login" className="text-white font-bold hover:underline mt-1 inline-block">
            FAZER LOGIN
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
