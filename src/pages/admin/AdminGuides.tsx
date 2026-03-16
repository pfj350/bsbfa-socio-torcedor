import { motion, Reorder } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookOpen, Plus, Pencil, Trash2, X, Upload, ExternalLink, GripVertical, Check, ListOrdered, Bold, Italic, Heading1, Heading2, List, Link as LinkIcon } from 'lucide-react';

interface Guide {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  file_url: string;
  priority: number;
}

export default function AdminGuides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    cover_image_url: '',
    file_url: '',
    priority: '0'
  });

  const fetchGuides = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setGuides(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleReorder = (newOrder: Guide[]) => {
    setGuides(newOrder);
  };

  const saveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const updates = guides.map((item, index) => ({
        id: item.id,
        priority: guides.length - index
      }));

      for (const update of updates) {
        await supabase
          .from('guides')
          .update({ priority: update.priority })
          .eq('id', update.id);
      }
      
      setIsReordering(false);
      fetchGuides(); // Refresh to ensure sync
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
      const filePath = `guides/covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, cover_image_url: data.publicUrl }));
    } catch (error) {
      alert('Erro ao subir imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `guides/files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images') // Using 'images' bucket for simplicity as seen in other modules
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, file_url: data.publicUrl }));
    } catch (error) {
      alert('Erro ao subir arquivo.');
    } finally {
      setUploadingFile(false);
    }
  };

  const insertMarkdown = (tag: string, placeholder: string = '') => {
    const textarea = descriptionRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.description;
    const selection = text.substring(start, end) || placeholder;
    
    let newText = '';
    let cursorPosition = 0;

    if (tag === 'bold') {
      newText = text.substring(0, start) + `**${selection}**` + text.substring(end);
      cursorPosition = start + 2 + selection.length + 2;
    } else if (tag === 'italic') {
      newText = text.substring(0, start) + `*${selection}*` + text.substring(end);
      cursorPosition = start + 1 + selection.length + 1;
    } else if (tag === 'h1') {
      newText = text.substring(0, start) + `# ${selection}` + text.substring(end);
      cursorPosition = start + 2 + selection.length;
    } else if (tag === 'h2') {
      newText = text.substring(0, start) + `## ${selection}` + text.substring(end);
      cursorPosition = start + 3 + selection.length;
    } else if (tag === 'list') {
      newText = text.substring(0, start) + `- ${selection}` + text.substring(end);
      cursorPosition = start + 2 + selection.length;
    } else if (tag === 'link') {
      newText = text.substring(0, start) + `[${selection}](url)` + text.substring(end);
      cursorPosition = start + selection.length + 3;
    }

    setFormData({ ...formData, description: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!formData.id;
      const payload = {
        title: formData.title,
        description: formData.description,
        cover_image_url: formData.cover_image_url,
        file_url: formData.file_url,
        priority: parseInt(formData.priority) || 0
      };

      if (isEditing) {
        const { error } = await supabase.from('guides').update(payload).eq('id', formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('guides').insert([payload]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchGuides();
    } catch (error: any) {
      console.error('Erro ao salvar guia:', error);
      alert('Erro ao salvar guia: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleEdit = (guide: Guide) => {
    setFormData({
      id: guide.id,
      title: guide.title,
      description: guide.description,
      cover_image_url: guide.cover_image_url || '',
      file_url: guide.file_url || '',
      priority: (guide.priority || 0).toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remover este guia?')) {
      await supabase.from('guides').delete().eq('id', id);
      fetchGuides();
    }
  };

  const openNewModal = () => {
    setFormData({ id: '', title: '', description: '', cover_image_url: '', file_url: '', priority: '0' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* SEO Metadata for Static Checkers */}
      <title>Gerenciar Guias - Admin</title>
      <meta name="description" content="Painel administrativo para gestão de guias e manuais em PDF." />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Guias</h2>
          <p className="text-gray-400">Adicione os PDFs ou links dos guias de nutrição e treino.</p>
        </div>
        <div className="flex gap-2">
          {guides.length > 1 && (
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
            Novo Guia
          </button>
        </div>
      </div>

      <div className="bg-dark-surface/50 border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Carregando guias...</div>
        ) : (
          <div className="w-full">
            <div className="flex border-b border-white/5 text-sm uppercase text-gray-500 font-bold">
              {isReordering && <div className="p-4 w-12 shrink-0"></div>}
              <div className="p-4 flex-1">Guia</div>
              <div className="p-4 w-32 text-right">Ações</div>
            </div>

            <Reorder.Group 
              axis="y" 
              values={guides} 
              onReorder={handleReorder}
              className="divide-y divide-white/5"
            >
              {guides.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhum guia cadastrado.
                </div>
              )}
              {guides.map((guide) => (
                <Reorder.Item 
                  key={guide.id} 
                  value={guide}
                  dragListener={isReordering}
                  className={`flex items-center hover:bg-white/5 transition-colors bg-dark-surface/50 ${isReordering ? 'cursor-grab active:cursor-grabbing border-l-2 border-transparent active:border-neon-green' : ''}`}
                >
                  {isReordering && (
                    <div className="p-4 w-12 shrink-0 text-gray-600 flex justify-center">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <div className="p-4 flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{guide.title}</div>
                    <div className="text-sm text-gray-400 truncate">{guide.description}</div>
                  </div>
                  <div className="p-4 w-32 shrink-0 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {!isReordering && (
                        <>
                          <button 
                            onClick={() => handleEdit(guide)}
                            className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(guide.id)}
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
              <h3 className="text-xl font-bold">{formData.id ? 'Editar Guia' : 'Novo Guia'}</h3>
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
                <label className="text-sm font-bold text-gray-300">Prioridade de Exibição</label>
                <input 
                  type="number" 
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300">Capa (Imagem)</label>
                  <div className="relative h-32 w-full border border-dashed border-white/20 rounded-xl bg-white/5 overflow-hidden">
                    {formData.cover_image_url ? (
                      <div className="relative h-full w-full group">
                        <img src={formData.cover_image_url} alt="Capa" className="h-full w-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, cover_image_url: ''})}
                          className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                        <Upload size={20} className="text-gray-400 mb-2" />
                        <span className="text-[10px] text-gray-500">{uploadingImage ? 'Enviando...' : 'Subir Capa'}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300">Arquivo (PDF/Link)</label>
                  <div className="relative h-32 w-full border border-dashed border-white/20 rounded-xl bg-white/5 flex flex-col items-center justify-center">
                    {formData.file_url ? (
                      <div className="flex flex-col items-center gap-2 p-2 text-center">
                        <span className="text-neon-green text-xs font-bold truncate w-full">Arquivo Pronto</span>
                        <button type="button" onClick={() => setFormData({...formData, file_url: ''})} className="text-red-400 text-[10px] underline">Remover</button>
                      </div>
                    ) : (
                      <label className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                        <Upload size={20} className="text-gray-400 mb-2" />
                        <span className="text-[10px] text-gray-500">{uploadingFile ? 'Enviando...' : 'Subir PDF/Link'}</span>
                        <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploadingFile} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-300">Descrição (Markdown)</label>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => insertMarkdown('bold', 'texto')} title="Negrito" className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400">
                      <Bold size={16} />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('italic', 'texto')} title="Itálico" className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400">
                      <Italic size={16} />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('h1', 'Título')} title="H1" className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400">
                      <Heading1 size={16} />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('h2', 'Subtítulo')} title="H2" className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400">
                      <Heading2 size={16} />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('list', 'item')} title="Lista" className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400">
                      <List size={16} />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('link', 'link')} title="Link" className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400">
                      <LinkIcon size={16} />
                    </button>
                  </div>
                </div>
                <textarea 
                  ref={descriptionRef}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none min-h-[120px] font-mono text-sm"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl border border-white/10">Cancelar</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-neon-green text-dark-bg font-bold">Salvar Guia</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
