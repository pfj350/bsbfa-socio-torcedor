import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { getPublishBadge } from '@/lib/utils';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  youtube_video_id: string;
  locked?: boolean;
  created_at: string;
}

export default function Content() {
  const [videos, setVideos] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchContents() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setVideos(data);
      }
      setIsLoading(false);
    }
    
    fetchContents();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold italic uppercase mb-2">BFA <span className="text-neon-green">TV</span></h1>
        <p className="text-gray-400">Conteúdo exclusivo para quem vive o jogo.</p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-neon-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl">
          <p>Nenhum conteúdo disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => {
                if(!video.locked) {
                  navigate(`/content/${video.id}`);
                }
              }}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 border border-white/5">
                <img 
                  src={video.thumbnail_url} 
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100 bg-dark-surface"
                />
                {video.locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <Lock className="text-white" size={32} />
                  </div>
                )}
                {/* Badge Data */}
                {video.created_at && (
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-sm ${
                    getPublishBadge(video.created_at) === 'Hoje' ? 'bg-neon-green text-black shadow-neon-green/20' : 
                    getPublishBadge(video.created_at) === 'Ontem' ? 'bg-yellow-400 text-black shadow-yellow-400/20' :
                    'bg-black/80 text-white shadow-black/40 border border-white/10'
                  }`}>
                    {getPublishBadge(video.created_at)}
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-bold leading-tight group-hover:text-neon-green transition-colors line-clamp-2">
                {video.title}
              </h3>
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">{video.description}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
