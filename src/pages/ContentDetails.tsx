import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  youtube_video_id: string;
  locked?: boolean;
}

export default function ContentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      if (!id) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('id', id)
        .single();
        
      if (!error && data) {
        setVideo(data);
      }
      setIsLoading(false);
    }
    
    fetchContent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-neon-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8 text-center pt-20">
        <h2 className="text-2xl font-bold">Conteúdo não encontrado.</h2>
        <button 
          onClick={() => navigate('/content')}
          className="text-neon-green hover:underline mt-4 inline-block font-bold"
        >
          Trabalhar e voltar para conteúdos
        </button>
      </div>
    );
  }

  let videoId = video.youtube_video_id || '';
  let position = 'top';
  
  if (videoId.startsWith('bottom:')) {
    position = 'bottom';
    videoId = videoId.replace('bottom:', '');
  } else if (videoId.startsWith('top:')) {
    position = 'top';
    videoId = videoId.replace('top:', '');
  }

  const renderVideo = () => {
    if (!videoId) return null;
    return (
      <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-neon-green/5 border border-white/10 bg-black">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 md:space-y-8"
      >
        <button 
          onClick={() => navigate('/content')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para Mídia
        </button>
        
        <h1 className="text-3xl md:text-5xl font-bold italic uppercase leading-tight text-white">
          {video.title}
        </h1>
        
        {position === 'top' && renderVideo()}

        <div className="bg-dark-surface/30 border border-white/5 rounded-3xl p-6 md:p-10 text-lg text-gray-300 leading-relaxed backdrop-blur-sm shadow-xl prose prose-invert prose-neon max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {video.description}
          </ReactMarkdown>
        </div>

        {position === 'bottom' && renderVideo()}
      </motion.div>
    </div>
  );
}
