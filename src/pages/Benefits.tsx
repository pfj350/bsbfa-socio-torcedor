import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Trophy } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  category: string;
  action_link: string | null;
  is_banner?: boolean;
  image_url?: string | null;
}

export default function Benefits() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBenefits() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setBenefits(data);
      }
      setIsLoading(false);
    }
    
    fetchBenefits();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold italic uppercase mb-2">Benefícios <span className="text-neon-green">Exclusivos</span></h1>
        <p className="text-gray-400">Aproveite as vantagens de ser um sócio premium.</p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-neon-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : benefits.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl">
          <p>Nenhum benefício disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const IconName = benefit.icon || 'Trophy';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const IconComponent = (LucideIcons as any)[IconName] || Trophy;

            return (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => benefit.action_link ? window.open(benefit.action_link, '_blank') : null}
                className={`bg-dark-surface border border-white/5 rounded-3xl transition-all group relative overflow-hidden flex flex-col ${benefit.action_link ? 'hover:border-neon-green/50 cursor-pointer shadow-2xl' : ''} ${benefit.is_banner ? 'col-span-1 md:col-span-2 lg:col-span-3' : 'h-full'}`}
              >
                {/* Header Section with Image Background (Top 1/3) */}
                <div className={`relative w-full overflow-hidden ${benefit.is_banner ? 'aspect-[2.4/1]' : 'aspect-video'}`}>
                  {/* Image Background Layer */}
                  {benefit.image_url ? (
                    <img 
                      src={benefit.image_url} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover opacity-30 transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : benefit.is_banner && (
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 via-transparent to-neon-green/5" />
                  )}
                  
                  {/* Content Overlaid on Image */}
                  <div className="absolute inset-0 z-20 p-6 md:p-8 flex items-center gap-4">
                    <div className={`bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-neon-green/20 transition-colors shrink-0 shadow-lg ${benefit.is_banner ? 'w-14 h-14 md:w-16 md:h-16' : 'w-12 h-12'}`}>
                      <IconComponent className="text-neon-green" size={benefit.is_banner ? 32 : 24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] mb-1 block">
                        {benefit.category}
                      </span>
                      <h3 className={`font-bold group-hover:text-neon-green transition-colors leading-tight drop-shadow-md ${benefit.is_banner ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                        {benefit.title}
                      </h3>
                    </div>

                    {benefit.action_link && (
                      <div className="ml-auto p-2 bg-dark-bg/20 backdrop-blur-sm rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <ArrowUpRight className="text-neon-green" size={20} />
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-transparent z-10" />
                </div>

                {/* Body Content Section (Below Header) */}
                <div className="p-6 md:p-8 pt-2 md:pt-4 flex flex-col flex-grow relative">
                  <p className={`text-gray-400 mb-8 flex-grow leading-relaxed ${benefit.is_banner ? 'text-base md:text-lg max-w-4xl' : 'text-sm'}`}>
                    {benefit.description}
                  </p>
                  
                  <div className={`flex ${benefit.is_banner ? 'justify-start' : 'mt-auto'}`}>
                    <button 
                      disabled={!benefit.action_link}
                      className={`py-3.5 rounded-2xl border font-bold text-xs transition-all tracking-wider ${
                        benefit.action_link 
                        ? 'border-white/10 bg-white/5 hover:bg-neon-green hover:text-dark-bg hover:border-neon-green cursor-pointer' 
                        : 'border-white/5 text-gray-500 bg-white/5 cursor-not-allowed'
                      } ${benefit.is_banner ? 'w-full md:w-auto md:px-14' : 'w-full'}`}
                    >
                      {benefit.action_link ? 'ACESSAR BENEFÍCIO AGORA' : 'INDISPONÍVEL'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
