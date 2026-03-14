import { motion, useMotionValue, useSpring, useTransform, animate } from 'motion/react';
import React, { useState, useEffect, useMemo } from 'react';
import { NEXT_GAME, NEWS } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, QrCode, Zap, Trophy, ArrowRight, BookOpen, Settings, X, Upload, Info, ShoppingBag, Shield, ChevronUp, ChevronsUp, Crown, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublishBadge } from '@/lib/utils';

export default function Dashboard() {
  const { profile, refreshProfile, isLoading } = useAuth();
  const x = useMotionValue(0);

  // Componente de Skeleton para a carteirinha
  const CardSkeleton = () => (
    <div className="relative w-full max-w-2xl aspect-[1.586/1] rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.3)] border border-white/5 bg-[#18181B] animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      <div className="relative p-6 md:p-8 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="h-6 w-32 bg-white/10 rounded-lg"></div>
          <div className="h-10 w-10 bg-white/10 rounded-full"></div>
        </div>
        <div className="flex gap-3 md:gap-8 items-end flex-1 mt-2 md:mt-4">
          <div className="w-20 h-28 md:w-32 md:h-[180px] bg-white/10 rounded-xl shrink-0"></div>
          <div className="flex-1 space-y-3">
            <div className="h-8 w-3/4 bg-white/10 rounded-lg"></div>
            <div className="h-2 w-16 bg-neon-green/30 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 w-12 bg-white/5 rounded"></div>
                <div className="h-4 w-16 bg-white/10 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-12 bg-white/5 rounded"></div>
                <div className="h-4 w-16 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const y = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editName, setEditName] = useState('');
  const [latestContents, setLatestContents] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLatest() {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (!error && data) {
        setLatestContents(data);
      }
    }
    fetchLatest();
  }, []);

  useEffect(() => {
    if (isSettingsOpen) {
      setEditName(profile?.full_name || '');
    }
  }, [isSettingsOpen, profile]);

  const memberData = useMemo(() => {
    if (!profile?.created_at) return { level: 'Novato', emoji: '🆕', nextLevel: 'Calouro', progress: 0, daysActive: 0, isMax: false };
    
    const startDate = new Date(profile.created_at);
    if (isNaN(startDate.getTime())) return { level: 'Novato', emoji: '🆕', nextLevel: 'Calouro', progress: 0, daysActive: 0, isMax: false };
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const daysActive = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const totalProgress = Math.min((daysActive / 365) * 100, 100);

    let level = 'Novato';
    let emoji = '🆕';
    let nextLevel = 'Calouro';
    
    if (daysActive >= 365) {
      level = 'Fanático';
      emoji = '🔥';
      nextLevel = null;
    } else if (daysActive >= 120) {
      level = 'Veterano';
      emoji = '🎖️';
      nextLevel = 'Fanático';
    } else if (daysActive >= 30) {
      level = 'Calouro';
      emoji = '🐣';
      nextLevel = 'Veterano';
    }

    return { 
      level, 
      emoji, 
      nextLevel, 
      progress: isNaN(totalProgress) ? 0 : totalProgress,
      daysActive: isNaN(daysActive) ? 0 : daysActive,
      isMax: daysActive >= 365
    };
  }, [profile?.created_at]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    const { error } = await supabase.from('profiles').update({ full_name: editName }).eq('id', profile.id);
    if (!error) {
      await refreshProfile();
      setIsSettingsOpen(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id);
      await refreshProfile();
    } catch (error) {
      alert('Erro ao subir a foto. Verifique se o bucket avatars existe.');
    } finally {
      setUploadingImage(false);
    }
  };

  const validityDate = useMemo(() => {
    const nextMonth = new Date();
    nextMonth.setDate(1); 
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return `${String(nextMonth.getMonth() + 1).padStart(2, '0')}/${nextMonth.getFullYear()}`;
  }, []);

  useEffect(() => {
    if (!isHovered) {
      const isMobile = window.innerWidth < 768;
      const rangeX = isMobile ? [0, 0.15, 0, -0.15, 0] : [0, 0.08, 0, -0.08, 0];
      const rangeY = isMobile ? [0, -0.22, 0, 0.22, 0] : [0, -0.12, 0, 0.12, 0];

      const controlsX = animate(x, rangeX, { 
        duration: 7, 
        repeat: Infinity,
        ease: "easeInOut"
      });
      const controlsY = animate(y, rangeY, { 
        duration: 5, 
        repeat: Infinity,
        ease: "easeInOut"
      });
      return () => {
        controlsX.stop();
        controlsY.stop();
      };
    }
  }, [isHovered, x, y]);

  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["35deg", "-35deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-35deg", "35deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!isHovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col items-center w-full space-y-4">
        
        {/* Carteirinha Digital 3D */}
        <div className="w-full flex justify-center py-4 relative" style={{ perspective: 1200 }}>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full max-w-xl mx-auto h-[90%] bg-[#0B3A1C] opacity-70 rounded-full blur-[80px] pointer-events-none" />
          
          {(isLoading || !profile) ? (
            <CardSkeleton />
          ) : (
            <motion.div 
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-2xl aspect-[1.586/1] rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.3)] border border-neon-green/30 group bg-white cursor-none z-10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#f2faf3] via-[#e5f5e8] to-[#d0ecdb] opacity-100 pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.4] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')]" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.28]" style={{ transform: 'translateZ(5px) scale(0.95)' }}>
                <img src="/logo-socio.png" alt="Marcad'água" className="w-[85%] max-w-md object-contain" />
              </div>
              
              <div className="relative p-6 md:p-8 h-full flex flex-col justify-between" style={{ transform: "translateZ(30px)" }}>
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                     <h3 className="text-[#0B3A1C] font-black tracking-tighter italic uppercase text-lg md:text-3xl drop-shadow-sm leading-none">Sócio Torcedor</h3>
                   </div>
                   <div className="flex items-center gap-4">
                     <button onClick={() => setIsSettingsOpen(true)} className="p-2 md:p-3 bg-[#0B3A1C]/5 rounded-xl hover:bg-[#0B3A1C]/15 text-[#0B3A1C]/80 transition-colors shadow-sm"><Settings size={20} /></button>
                     <img src="/logo-socio.png" alt="Sócio" className="h-10 md:h-14 object-contain" />
                   </div>
                </div>

                <div className="flex gap-3 md:gap-8 items-end flex-1 mt-2 md:mt-4">
                  <div className="w-20 h-28 md:w-32 md:h-[180px] bg-white border-[2px] md:border-[3px] border-[#0B3A1C]/30 rounded-lg md:rounded-xl overflow-hidden shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.1)] relative group-hover:border-neon-green/60 transition-colors duration-500">
                    <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || 'User'}`} className="w-full h-full object-cover filter contrast-110" />
                  </div>
                  
                  <div className="flex-1 w-full relative pb-2 text-[#0B3A1C]">
                    <h2 className="text-xl md:text-4xl font-black italic uppercase text-[#0B3A1C] tracking-tight mb-0 leading-none truncate max-w-[180px] md:max-w-md">
                      {profile?.full_name}
                    </h2>
                    <div className="h-0.5 md:h-1 w-12 md:w-16 bg-neon-green rounded mt-1 md:mt-2 mb-2 md:mb-4"></div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 md:gap-x-4 gap-y-2 md:gap-y-4 text-[8px] md:text-xs font-mono leading-tight">
                      <div><p className="opacity-60 mb-0.5">STATUS</p><p className="font-bold">ATIVO</p></div>
                      <div><p className="opacity-60 mb-0.5">NÍVEL</p><p className="font-bold">{memberData.level.toUpperCase()}</p></div>
                      <div><p className="opacity-60 mb-0.5">VALIDADE</p><p className="font-bold">{validityDate}</p></div>
                      <div><p className="opacity-60 mb-0.5">REGISTRO</p><p className="font-bold">{profile?.member_id?.slice(-8) || '---'}</p></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-overlay pointer-events-none" />
            </motion.div>
          )}
        </div>

        {/* Membership Performance Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-gradient-to-b from-[#111] to-[#080808] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 blur-3xl rounded-full" />
          <div className="p-6 md:p-8 relative z-10">
            <div className="grid grid-cols-[auto_1fr] gap-x-2 md:gap-x-8 gap-y-12 md:gap-y-8 w-full">
              
              <div className="col-span-1 row-span-1 md:row-span-2 flex flex-col items-center justify-start mt-1">
                <div className="relative">
                  <div className="absolute inset-0 animate-[spin_10s_linear_infinite] opacity-30">
                    <div className="w-full h-full border-2 border-dashed border-neon-green rounded-full shadow-[0_0_15px_rgba(0,255,163,0.2)]" />
                  </div>
                  <div className="w-[110px] h-[110px] md:w-40 md:h-40 bg-[#0B3A1C] p-0.5 rounded-[2.2rem] md:rounded-[2.8rem] transform rotate-3 relative shadow-2xl flex items-center justify-center">
                    <div className="w-full h-full bg-[#050505] rounded-[2.1rem] md:rounded-[2.7rem] flex flex-col items-center justify-center border border-white/10">
                      <div className="relative w-12 h-12 md:w-20 md:h-20 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-neon-green drop-shadow-[0_0_8px_rgba(0,255,163,0.5)]">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 13l4-3 4 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-[10px] md:text-[14px] font-black text-white/40 tracking-[0.2em] mt-0.5 md:mt-2 ml-1 uppercase">{memberData.level}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Header Right: Reator & Dias Ativos */}
              <div className="col-start-2 col-span-1 row-start-1 flex justify-end w-full min-w-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full h-full gap-3 md:gap-0">
                  <div className="flex items-center justify-end md:justify-start gap-2">
                    <h5 className="text-[13px] md:text-sm font-black text-white uppercase tracking-[0.1em] md:tracking-[0.2em] flex items-center gap-2 md:gap-3 leading-tight">
                      <span className="md:hidden">Reator de Lealdade</span>
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-neon-green rounded-full animate-pulse shadow-[0_0_10px_#00ffa3] shrink-0" />
                      <span className="hidden md:inline">Reator de Lealdade</span>
                    </h5>
                    <button 
                      onClick={() => setShowLevelInfo(true)}
                      className="p-1 md:p-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-white/30 hover:text-white transition-all border border-white/5"
                    >
                      <Info size={14} />
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-end bg-white/5 border border-white/10 rounded-xl py-2 px-3 md:px-4 backdrop-blur-md relative overflow-hidden self-end">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-neon-green/10 blur-xl rounded-full md:hidden" />
                      <div className="relative z-10 flex flex-col items-end">
                        <div className="flex items-baseline gap-1.5 leading-none">
                          <span className="text-4xl md:text-3xl font-black text-white italic">
                            {memberData.daysActive}
                          </span>
                          <span className="text-[11px] md:text-[10px] font-black text-neon-green uppercase italic tracking-tighter">
                            DIAS ATIVOS
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Progress Bar */}
              <div className="col-span-2 md:col-start-2 md:col-span-1 row-start-2 pt-10 md:pt-14 pb-6 md:pb-4 w-full min-w-0">
                  <div className="relative h-4 flex items-center">
                    <div className="absolute inset-0 rounded-full border border-white/5 overflow-hidden bg-[linear-gradient(90deg,rgba(255,255,255,0.15)_0%,rgba(254,240,138,0.15)_15%,rgba(250,204,21,0.15)_50%,rgba(34,197,94,0.15)_100%)] backdrop-blur-sm"></div>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${memberData.progress}%` }}
                      transition={{ duration: 2, ease: "anticipate" }}
                      className={`absolute inset-y-0.5 left-0.5 rounded-full relative overflow-hidden transition-colors duration-1000 ${
                        memberData.daysActive >= 365 ? 'bg-gradient-to-r from-green-500 to-[#15803d] shadow-[0_0_15px_#22c55e]' :
                        memberData.daysActive >= 120 ? 'bg-gradient-to-r from-yellow-500/50 to-yellow-400 shadow-[0_0_15px_#facc15]' :
                        memberData.daysActive >= 30  ? 'bg-gradient-to-r from-yellow-100/50 to-yellow-200 shadow-[0_0_15px_#fef08a]' :
                        'bg-gradient-to-r from-white/30 to-white shadow-[0_0_15px_#ffffff]'
                      }`}
                    >
                       <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] w-20 animate-[scan_3s_linear_infinite] opacity-40" />
                    </motion.div>

                    {[
                      { days: 0, label: 'NOVATO', pct: 0, icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 13l4-3 4 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, color: 'text-white', glow: 'shadow-[0_0_10px_#ffffff]' },
                      { days: 30, label: 'CALOURO', pct: 15, icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 11l4-3 4 3M8 15l4-3 4 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, color: 'text-yellow-200', glow: 'shadow-[0_0_10px_#fef08a]' },
                      { days: 120, label: 'VETERANO', pct: 50, icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 7l1.3 3.9h4.1l-3.3 2.4 1.3 3.9-3.4-2.5-3.4 2.5 1.3-3.9-3.3-2.4h4.1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, color: 'text-yellow-400', glow: 'shadow-[0_0_10px_#facc15]' },
                      { days: 365, label: 'FANÁTICO', pct: 100, icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 16h9l1-6-3 2-2.5-4-2.5 4-3-2 1 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, color: 'text-[#22c55e]', glow: 'shadow-[0_0_10px_#22c55e]' }
                    ].map((milestone) => {
                      const isReached = memberData.daysActive >= milestone.days;
                      let positionClass = "-translate-x-1/2";
                      if (milestone.days === 0) positionClass = "translate-x-0";
                      if (milestone.days === 365) positionClass = "-translate-x-full";
                      
                      return (
                        <div key={milestone.days} className={`absolute flex flex-col items-center justify-center ${positionClass}`} style={{ left: milestone.days === 365 ? 'calc(100% - 4px)' : milestone.days === 0 ? '4px' : `${milestone.pct}%` }}>
                          
                          <div className={`absolute bottom-full mb-5 flex flex-col items-center transition-all duration-500 ${milestone.color} ${isReached ? 'opacity-100 scale-110' : 'opacity-40 scale-90 hover:scale-100 hover:opacity-80'}`}>
                            <div className={`w-8 h-8 rounded-lg bg-dark-bg border border-current flex flex-col items-center justify-center relative ${isReached ? milestone.glow : ''}`}>
                              {milestone.icon}
                              <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-current" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-wider mt-2 whitespace-nowrap">
                              {milestone.label}
                            </span>
                          </div>

                          <div className={`w-2 h-2 z-10 rounded-full bg-current ${milestone.color} ${isReached ? '' : 'opacity-40'}`} />
                          
                          <span className={`absolute top-full mt-2 text-[8px] font-black tracking-widest ${milestone.color} ${isReached ? '' : 'opacity-40'}`}>
                            {milestone.days === 0 ? `${memberData.daysActive}D` : `${milestone.days}D`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/store" className="block">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-surface p-6 rounded-2xl border border-white/5 group cursor-pointer hover:border-neon-green/30 transition-colors h-full flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-neon-green/20 transition-colors">
                <ShoppingBag className="text-neon-green" />
              </div>
              <h3 className="text-xl font-bold mb-1">Loja Exclusiva</h3>
              <p className="text-sm text-gray-400 mb-4">Produtos oficiais com descontos reais para sócios.</p>
            </div>
            <div className="flex items-center text-neon-green text-sm font-bold group-hover:translate-x-1 transition-transform mt-auto">
              VER PRODUTOS <ArrowRight size={16} className="ml-1" />
            </div>
          </motion.div>
        </Link>

        <Link to="/benefits" className="block">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-surface p-6 rounded-2xl border border-white/5 group cursor-pointer hover:border-neon-green/30 transition-colors h-full flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-neon-green/20 transition-colors">
                <Trophy className="text-neon-green" />
              </div>
              <h3 className="text-xl font-bold mb-1">Benefícios</h3>
              <p className="text-sm text-gray-400 mb-4">Explore as vantagens exclusivas do seu plano.</p>
            </div>
            <div className="flex items-center text-neon-green text-sm font-bold group-hover:translate-x-1 transition-transform mt-auto">
              VER BENEFÍCIOS <ArrowRight size={16} className="ml-1" />
            </div>
          </motion.div>
        </Link>

        <Link to="/guides" className="block">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-dark-surface p-6 rounded-2xl border border-white/5 group cursor-pointer hover:border-neon-green/30 transition-colors h-full flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-neon-green/20 transition-colors">
                <BookOpen className="text-neon-green" />
              </div>
              <h3 className="text-xl font-bold mb-1">Guias</h3>
              <p className="text-sm text-gray-400 mb-4">Aprenda tudo sobre futebol americano e o clube.</p>
            </div>
            <div className="flex items-center text-neon-green text-sm font-bold group-hover:translate-x-1 transition-transform mt-auto">
              ACESSAR GUIAS <ArrowRight size={16} className="ml-1" />
            </div>
          </motion.div>
        </Link>
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold italic">Últimas Notícias</h2>
          <Link to="/content" className="text-sm text-gray-400 hover:text-white transition-colors">Ver tudo</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(latestContents.length > 0 ? latestContents : NEWS.slice(0, 2)).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (index * 0.1) }}
              className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => navigate(item.youtube_video_id ? `/content/${item.id}` : '#')}
            >
              <img 
                src={item.thumbnail_url || item.image} 
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent opacity-90" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-neon-green/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-neon-green/50">
                  <Play className="text-neon-green ml-1" fill="currentColor" size={32} />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold bg-neon-green text-dark-bg px-2 py-0.5 rounded uppercase">
                    {item.category || 'CONTEÚDO'}
                  </span>
                  <span className="text-xs text-gray-300">
                    {item.created_at ? getPublishBadge(item.created_at) : (item.date || '')}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-neon-green transition-colors line-clamp-2">
                   {item.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-bg border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/5 sticky top-0 bg-dark-bg z-10">
              <h3 className="text-xl font-bold">Configurar Perfil</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
              {/* Current Avatar Preview */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 block text-center">Foto de Perfil</label>
                <div className="flex justify-center">
                  <div className="relative">
                    <img 
                      src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || 'User'}`} 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-neon-green shadow-[0_0_15px_rgba(14,144,31,0.3)]"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-green rounded-full flex items-center justify-center">
                      <span className="text-dark-bg text-xs">✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preset Avatars Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-center">Escolha um avatar do time</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { src: '/avatars/helmet-front.png', label: 'Capacete Frontal' },
                    { src: '/avatars/helmet-side.png', label: 'Capacete Lateral' },
                    { src: '/avatars/football.png', label: 'Bola' },
                    { src: '/avatars/jersey.png', label: 'Uniforme' },
                    { src: '/avatars/shield.png', label: 'Escudo' },
                    { src: '/avatars/flags.png', label: 'Bandeiras' },
                  ].map((avatar) => {
                    const isSelected = profile?.avatar_url === avatar.src;
                    return (
                      <button
                        key={avatar.src}
                        type="button"
                        onClick={async () => {
                          if (!profile) return;
                          setUploadingImage(true);
                          await supabase.from('profiles').update({ avatar_url: avatar.src }).eq('id', profile.id);
                          await refreshProfile();
                          setUploadingImage(false);
                        }}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                          isSelected 
                            ? 'border-neon-green shadow-[0_0_15px_rgba(14,144,31,0.4)] ring-2 ring-neon-green/30' 
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img src={avatar.src} alt={avatar.label} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-neon-green/10 flex items-center justify-center">
                            <div className="w-6 h-6 bg-neon-green rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-dark-bg text-xs font-bold">✓</span>
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                          <p className="text-[9px] text-white/80 font-bold text-center truncate">{avatar.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Custom Photo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-center">Ou envie sua foto</label>
                <label className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border border-dashed border-white/15 hover:border-neon-green/50 hover:bg-white/5 transition-all cursor-pointer group">
                  <Upload size={16} className="text-gray-500 group-hover:text-neon-green transition-colors" />
                  <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    {uploadingImage ? 'Enviando...' : 'Carregar foto do dispositivo'}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingImage} />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Meu Nome</label>
                <div className="text-xs text-gray-500 mb-1">Máximo de 16 caracteres para caber na carteirinha.</div>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  maxLength={16}
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsSettingsOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold">Cancelar</button>
                <button type="submit" disabled={uploadingImage} className="px-6 py-3 rounded-xl bg-neon-green text-dark-bg hover:bg-neon-green-hover transition-colors font-bold disabled:opacity-50">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLevelInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Reator de Lealdade</h3>
                <button onClick={() => setShowLevelInfo(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] text-gray-400 leading-tight">
                  O Reator de Lealdade é o coração da sua jornada. Ele mede sua constância como sócio: quanto mais tempo você permanece ativo, maior o seu nível de prestígio.
                </p>
              </div>
              
              <div className="space-y-3">
                {[
                  { 
                    level: 'Novato', 
                    days: '0D', 
                    desc: 'Onde tudo começa. Sua jornada como torcedor oficial se inicia aqui.', 
                    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 13l4-3 4 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, 
                    color: 'text-white' 
                  },
                  { 
                    level: 'Calouro', 
                    days: '30D', 
                    desc: 'Você já faz parte da família. Sua energia começa a alimentar o clube.', 
                    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 11l4-3 4 3M8 15l4-3 4 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, 
                    color: 'text-yellow-200' 
                  },
                  { 
                    level: 'Veterano', 
                    days: '120D', 
                    desc: 'Um torcedor de respeito. Sua presença é peça fundamental no dia a dia.', 
                    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 7l1.3 3.9h4.1l-3.3 2.4 1.3 3.9-3.4-2.5-3.4 2.5 1.3-3.9-3.3-2.4h4.1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, 
                    color: 'text-yellow-400' 
                  },
                  { 
                    level: 'Fanático', 
                    days: '365D', 
                    desc: 'Lealdade inabalável. O Brasília corre nas suas veias 24 horas por dia.', 
                    icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 16h9l1-6-3 2-2.5-4-2.5 4-3-2 1 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, 
                    color: 'text-[#22c55e]' 
                  },
                ].map((m) => (
                  <div key={m.level} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 transition-colors hover:bg-white/10">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${m.color}`}>
                      {m.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <span className={`font-bold uppercase text-[10px] tracking-wider ${m.color}`}>{m.level}</span>
                        <span className="text-[9px] text-gray-600 font-mono font-bold">{m.days}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-tight mt-1">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowLevelInfo(false)}
                className="w-full bg-white/5 hover:bg-white/15 text-white font-bold py-3 rounded-xl transition-all border border-white/5"
              >
                Entendi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
