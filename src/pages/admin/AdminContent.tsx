import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { PlayCircle, Plus, Pencil, Trash2, X, Upload, Bold, Italic, Heading1, Heading2, List, Link as LinkIcon } from 'lucide-react';

interface Content {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  youtube_video_id: string;
}

export default function AdminContent() {
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    thumbnail_url: '',
    youtube_url: '', // For input, we will extract ID after
    video_position: 'top'
  });

  const fetchContents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setContents(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `thumb_${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('content-thumbnails')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('content-thumbnails')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, thumbnail_url: data.publicUrl }));
    } catch (error) {
      alert('Erro ao subir a miniatura (thumbnail) do vídeo.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Extract YouTube ID from variations of links
  const extractYoutubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalVideoId = '';
    // If user provided a URL, extract it
    if (formData.youtube_url) {
      if (formData.youtube_url.includes('youtu')) {
        finalVideoId = extractYoutubeId(formData.youtube_url);
      } else {
        // maybe they already provided the clean ID
        finalVideoId = formData.youtube_url;
      }
      
      if (finalVideoId) {
        finalVideoId = `${formData.video_position}:${finalVideoId}`;
      }
    }

    if (!formData.thumbnail_url) {
      alert('A Thumbnail do vídeo é obrigatória.');
      return;
    }

    const isEditing = !!formData.id;
    
    const payload = {
      title: formData.title,
      description: formData.description,
      thumbnail_url: formData.thumbnail_url,
      youtube_video_id: finalVideoId
    };

    if (isEditing) {
      await supabase.from('contents').update(payload).eq('id', formData.id);
    } else {
      await supabase.from('contents').insert([payload]);
    }
    
    setIsModalOpen(false);
    fetchContents();
  };

  const handleEdit = (content: Content) => {
    let rawId = content.youtube_video_id || '';
    let pos = 'top';
    
    if (rawId.startsWith('bottom:')) {
      pos = 'bottom';
      rawId = rawId.replace('bottom:', '');
    } else if (rawId.startsWith('top:')) {
      pos = 'top';
      rawId = rawId.replace('top:', '');
    } else if (rawId) {
      pos = 'top'; // Legacy compat
    }

    setFormData({
      id: content.id,
      title: content.title,
      description: content.description,
      thumbnail_url: content.thumbnail_url || '',
      youtube_url: rawId ? `https://youtube.com/watch?v=${rawId}` : '',
      video_position: pos
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este vídeo?')) {
      await supabase.from('contents').delete().eq('id', id);
      fetchContents();
    }
  };

  const openNewModal = () => {
    setFormData({ id: '', title: '', description: '', thumbnail_url: '', youtube_url: '', video_position: 'top' });
    setIsModalOpen(true);
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!descriptionRef.current) return;
    
    const textarea = descriptionRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.description;
    
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    
    const newText = `${before}${prefix}${selected}${suffix}${after}`;
    setFormData(prev => ({ ...prev, description: newText }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Conteúdos</h2>
          <p className="text-gray-400">Vídeos do YouTube encapsulados na plataforma com thumbnails personalizadas.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-neon-green text-dark-bg px-4 py-2 font-bold rounded-lg flex items-center gap-2 hover:bg-neon-green-hover transition-colors"
        >
          <Plus size={20} />
          Novo Vídeo
        </button>
      </div>

      <div className="bg-dark-surface/50 border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Carregando conteúdos...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-sm uppercase text-gray-500">
                <th className="p-4 font-bold w-32">Thumbnail</th>
                <th className="p-4 font-bold">Conteúdo</th>
                <th className="p-4 font-bold">ID YouTube</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contents.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Nenhum vídeo cadastrado.
                  </td>
                </tr>
              )}
              {contents.map((content) => (
                <tr key={content.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <img src={content.thumbnail_url} alt={content.title} className="w-full h-16 object-cover rounded-lg bg-dark-bg border border-white/10" />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white">{content.title}</div>
                    <div className="text-sm text-gray-400 truncate max-w-[200px]">{content.description}</div>
                  </td>
                  <td className="p-4 font-mono text-sm text-neon-green">
                    {content.youtube_video_id}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(content)}
                        className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(content.id)}
                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
          <div className="bg-dark-bg border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative my-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/5 sticky top-0 bg-dark-bg z-10">
              <h3 className="text-xl font-bold">{formData.id ? 'Editar Vídeo' : 'Novo Vídeo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-300 block">Thumbnail (Miniatura Local)</label>
                {formData.thumbnail_url ? (
                  <div className="relative w-full aspect-video mx-auto group">
                    <img src={formData.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover rounded-xl border border-white/10" />
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, thumbnail_url: ''})}
                      className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-32 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center relative hover:border-neon-green/50 transition-colors bg-white/5 cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingImage}
                    />
                    <Upload className="text-gray-400 mb-2" />
                    <span className="text-sm font-bold text-gray-400">
                      {uploadingImage ? 'Enviando miniatura...' : 'Subir imagem Thumbnail (16:9, Horizontal)'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4 p-4 border border-white/5 rounded-2xl bg-dark-bg/50">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300">Vídeo de Apoio (Opcional)</label>
                  <p className="text-xs text-gray-500">Se quiser colocar um vídeo, insira o link abaixo.</p>
                  <div className="relative">
                    <PlayCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
                    <input 
                      type="text" 
                      value={formData.youtube_url}
                      onChange={e => setFormData({...formData, youtube_url: e.target.value})}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 pl-12 focus:border-neon-green transition-colors outline-none font-mono text-sm"
                    />
                  </div>
                </div>

                {formData.youtube_url && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-300">Posição do Vídeo</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="video_position"
                          value="top"
                          checked={formData.video_position === 'top'}
                          onChange={() => setFormData({...formData, video_position: 'top'})}
                          className="accent-neon-green"
                        />
                        <span className="text-sm text-gray-300">Em cima (Antes do texto)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="video_position"
                          value="bottom"
                          checked={formData.video_position === 'bottom'}
                          onChange={() => setFormData({...formData, video_position: 'bottom'})}
                          className="accent-neon-green"
                        />
                        <span className="text-sm text-gray-300">Embaixo (Depois do texto)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Título do Vídeo</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Resumo da Descrição (Aceita Markdown)</label>
                
                <div className="flex flex-wrap gap-2 p-1.5 bg-dark-bg border border-white/10 rounded-xl mb-2 w-fit">
                  <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-2 focus:outline-none hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Negrito"><Bold size={16} /></button>
                  <button type="button" onClick={() => insertMarkdown('*', '*')} className="p-2 focus:outline-none hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Itálico"><Italic size={16} /></button>
                  <div className="w-px h-6 bg-white/10 my-auto mx-1"></div>
                  <button type="button" onClick={() => insertMarkdown('# ', '')} className="p-2 focus:outline-none hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Título Principal"><Heading1 size={16} /></button>
                  <button type="button" onClick={() => insertMarkdown('## ', '')} className="p-2 focus:outline-none hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Subtítulo"><Heading2 size={16} /></button>
                  <div className="w-px h-6 bg-white/10 my-auto mx-1"></div>
                  <button type="button" onClick={() => insertMarkdown('- ', '')} className="p-2 focus:outline-none hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Lista de Pontos"><List size={16} /></button>
                  <button type="button" onClick={() => insertMarkdown('[', '](https://...)')} className="p-2 focus:outline-none hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Link"><LinkIcon size={16} /></button>
                </div>

                <textarea 
                  ref={descriptionRef}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-4 focus:border-neon-green transition-colors outline-none min-h-[300px] font-sans leading-relaxed"
                  placeholder="Escreva sua postagem aqui... Utilize a barra de ferramentas acima para estilizar o texto."
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-dark-bg border-t border-white/5 py-4 -mb-6 -mx-6 px-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={uploadingImage}
                  className="px-6 py-3 rounded-xl bg-neon-green text-dark-bg hover:bg-neon-green-hover transition-colors font-bold disabled:opacity-50"
                >
                  Salvar Vídeo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
