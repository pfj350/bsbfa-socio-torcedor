import { motion, Reorder } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { PlayCircle, Plus, Pencil, Trash2, X, Upload, Clock, GripVertical, Check, ListOrdered, Bold, Italic, Heading1, Heading2, List, Link as LinkIcon, Play } from 'lucide-react';

interface Content {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  youtube_video_id: string;
  category: string;
  priority?: number;
}

export default function AdminContent() {
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    thumbnail_url: '',
    youtube_url: '',
    category: '',
    priority: '0'
  });

  const fetchContents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setContents(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleReorder = async (newOrder: Content[]) => {
    setContents(newOrder);
  };

  const saveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const updates = contents.map((item, index) => ({
        id: item.id,
        priority: contents.length - index
      }));

      for (const update of updates) {
        await supabase
          .from('contents')
          .update({ priority: update.priority })
          .eq('id', update.id);
      }
      
      setIsReordering(false);
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
      alert('Falha ao salvar a nova ordem.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `content/thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, thumbnail_url: data.publicUrl }));
    } catch (error) {
      alert('Erro ao subir imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!formData.id;
    
    // Extract YouTube ID
    let finalVideoId = formData.youtube_url;
    if (finalVideoId.includes('v=')) {
      finalVideoId = finalVideoId.split('v=')[1].split('&')[0];
    } else if (finalVideoId.includes('youtu.be/')) {
      finalVideoId = finalVideoId.split('youtu.be/')[1].split('?')[0];
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      thumbnail_url: formData.thumbnail_url,
      youtube_video_id: finalVideoId,
      category: formData.category,
      priority: parseInt(formData.priority) || 0
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
    setFormData({
      id: content.id,
      title: content.title,
      description: content.description,
      thumbnail_url: content.thumbnail_url || '',
      youtube_url: content.youtube_video_id ? `https://youtube.com/watch?v=${content.youtube_video_id}` : '',
      category: content.category || '',
      priority: (content.priority || 0).toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remover este conteúdo?')) {
      await supabase.from('contents').delete().eq('id', id);
      fetchContents();
    }
  };

  const openNewModal = () => {
    setFormData({ id: '', title: '', description: '', thumbnail_url: '', youtube_url: '', category: '', priority: '0' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Conteúdos</h2>
          <p className="text-gray-400">Vídeos, artigos e materiais de estudo.</p>
        </div>
        <div className="flex gap-2">
          {contents.length > 1 && (
            <button 
              onClick={isReordering ? saveOrder : () => setIsReordering(true)}
              disabled={isSavingOrder}
              className={`px-4 py-2 font-bold rounded-lg flex items-center gap-2 transition-all ${
                isReordering 
                  ? 'bg-neon-green text-dark-bg hover:bg-neon-green-hover' 
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {isSavingOrder ? (
                <div className="w-5 h-5 border-2 border-dark-bg border-t-transparent rounded-full animate-spin"></div>
              ) : isReordering ? (
                <>
                  <Check size={20} />
                  Salvar Ordem
                </>
              ) : (
                <>
                  <ListOrdered size={20} />
                  Reordenar
                </>
              )}
            </button>
          )}
          <button 
            onClick={openNewModal}
            className="bg-neon-green text-dark-bg px-4 py-2 font-bold rounded-lg flex items-center gap-2 hover:bg-neon-green-hover transition-colors"
          >
            <Plus size={20} />
            Novo Conteúdo
          </button>
        </div>
      </div>

      <div className="bg-dark-surface/50 border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Carregando conteúdos...</div>
        ) : (
          <div className="w-full">
            <div className="flex border-b border-white/5 text-sm uppercase text-gray-500 font-bold">
              {isReordering && <div className="p-4 w-12 shrink-0"></div>}
              <div className="p-4 flex-1">Conteúdo</div>
              <div className="p-4 w-40">Categoria</div>
              <div className="p-4 w-32 text-right">Ações</div>
            </div>

            <Reorder.Group 
              axis="y" 
              values={contents} 
              onReorder={handleReorder}
              className="divide-y divide-white/5"
            >
              {contents.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhum conteúdo cadastrado.
                </div>
              )}
              {contents.map((item) => (
                <Reorder.Item 
                  key={item.id} 
                  value={item}
                  dragListener={isReordering}
                  className={`flex items-center hover:bg-white/5 transition-colors bg-dark-surface/50 ${isReordering ? 'cursor-grab active:cursor-grabbing border-l-2 border-transparent active:border-neon-green' : ''}`}
                >
                  {isReordering && (
                    <div className="p-4 w-12 shrink-0 text-gray-600 flex justify-center">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <div className="p-4 flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{item.title}</div>
                    <div className="text-sm text-gray-400 truncate max-w-xs">{item.description}</div>
                  </div>
                  <div className="p-4 w-40 shrink-0">
                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-neon-green uppercase">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4 w-32 shrink-0 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {!isReordering && (
                        <>
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
          <div className="bg-dark-bg border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative my-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-dark-bg z-10 sticky top-0">
              <h3 className="text-xl font-bold">{formData.id ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Título</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">YouTube URL</label>
                <input 
                  type="url" 
                  value={formData.youtube_url}
                  onChange={e => setFormData({...formData, youtube_url: e.target.value})}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300">Thumbnail (Opcional)</label>
                  <div className="relative h-32 w-full border border-dashed border-white/20 rounded-xl bg-white/5 overflow-hidden">
                    {formData.thumbnail_url ? (
                      <div className="relative h-full w-full group">
                        <img src={formData.thumbnail_url} alt="Thumbnail" className="h-full w-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, thumbnail_url: ''})}
                          className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                        <Upload size={20} className="text-gray-400 mb-2" />
                        <span className="text-[10px] text-gray-500">{uploadingImage ? 'Enviando...' : 'Subir Thumbnail'}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300">Prioridade</label>
                  <input 
                    type="number" 
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Categoria</label>
                <input 
                  type="text" 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Descrição</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none min-h-[100px]"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl border border-white/10">Cancelar</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-neon-green text-dark-bg font-bold">Salvar Conteúdo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
