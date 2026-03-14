import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, File } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Guide {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  file_url: string;
}

export default function Guides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGuides() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setGuides(data);
      }
      setIsLoading(false);
    }
    
    fetchGuides();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold italic uppercase mb-2">Guias <span className="text-neon-green">BFA</span></h1>
        <p className="text-gray-400">Aprenda, treine e evolua com o time.</p>
      </motion.div>

      {/* Content Grid - Showing all guides */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-neon-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : guides.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl">
          <p>Nenhum guia disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide, index) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => window.open(guide.file_url, '_blank')}
              className="group cursor-pointer bg-dark-surface border border-white/5 rounded-2xl overflow-hidden hover:border-neon-green/30 transition-all flex flex-col h-full"
            >
              <div className="relative aspect-video overflow-hidden shrink-0">
                <img 
                  src={guide.cover_image_url} 
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-dark-bg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-surface to-transparent opacity-80" />
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur px-2 py-1 flex items-center gap-1 rounded text-xs font-mono text-neon-green border border-neon-green/20">
                  <File size={12} />
                  MATERIAL PDF
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2 group-hover:text-neon-green transition-colors leading-tight">
                  {guide.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                  {guide.description}
                </p>
                
                <div className="flex items-center text-neon-green text-sm font-bold group-hover:translate-x-1 transition-transform mt-auto pt-2 border-t border-white/5">
                  ACESSAR GUIA <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
