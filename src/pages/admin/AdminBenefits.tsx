import { motion, Reorder } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Plus, Pencil, Trash2, X, Upload, Link as LinkIcon, GripVertical, Check, ListOrdered, Star, Heart, Zap, Tag, Gift, Coffee, Bold, Italic, Heading1, Heading2, List } from 'lucide-react';

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  category: string;
  action_link: string | null;
  is_banner?: boolean;
  image_url?: string | null;
  priority?: number;
}

const PRESET_ICONS = [
  { name: 'Trophy', icon: Trophy },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'Zap', icon: Zap },
  { name: 'Tag', icon: Tag },
  { name: 'Gift', icon: Gift },
  { name: 'Coffee', icon: Coffee },
];

export default function AdminBenefits() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    icon: 'Trophy',
    category: 'VIP',
    action_link: '',
    is_banner: false,
    image_url: '',
    priority: '0'
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);

  const fetchBenefits = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('benefits')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setBenefits(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBenefits();
  }, []);

  const handleReorder = async (newOrder: Benefit[]) => {
    setBenefits(newOrder);
  };

  const saveOrder = async () => {
    setIsSavingOrder(true);
    try {
      // Create updates for all items based on their new position
      const updates = benefits.map((item, index) => ({
        id: item.id,
        priority: benefits.length - index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('benefits')
          .update({ priority: update.priority })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      setIsReordering(false);
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
      alert('Falha ao salvar a nova ordem. Tente novamente.');
    } finally {
      setIsSavingOrder(false);
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
        icon: formData.icon,
        category: formData.category,
        action_link: formData.action_link,
        is_banner: formData.is_banner,
        image_url: formData.image_url,
        priority: parseInt(formData.priority.toString()) || 0
      };

      if (isEditing) {
        const { error } = await supabase.from('benefits').update(payload).eq('id', formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('benefits').insert([payload]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchBenefits();
    } catch (error: any) {
      console.error('Erro ao salvar benefício:', error);
      alert('Erro ao salvar benefício: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleEdit = (benefit: Benefit) => {
    setFormData({
      id: benefit.id,
      title: benefit.title,
      description: benefit.description,
      icon: benefit.icon || 'Trophy',
      category: benefit.category || 'VIP',
      action_link: benefit.action_link || '',
      is_banner: Boolean(benefit.is_banner),
      image_url: benefit.image_url || '',
      priority: (benefit.priority || 0).toString()
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `benefits/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch (error) {
      alert('Erro ao subir imagem. Verifique o bucket "images".');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este benefício?')) {
      await supabase.from('benefits').delete().eq('id', id);
      fetchBenefits();
    }
  };

  const openNewModal = () => {
    setFormData({ id: '', title: '', description: '', icon: 'Trophy', category: 'VIP', action_link: '', is_banner: false, image_url: '', priority: '0' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* SEO Metadata for Static Checkers */}
      <title>Gerenciar Benefícios - Admin</title>
      <meta name="description" content="Painel administrativo para gestão de benefícios do sócio torcedor." />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Benefícios</h2>
          <p className="text-gray-400">Adicione ou edite os benefícios oferecidos aos sócios.</p>
        </div>
        <div className="flex gap-2">
          {benefits.length > 1 && (
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
            Novo Benefício
          </button>
        </div>
      </div>

      <div className="bg-dark-surface/50 border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Carregando benefícios...</div>
        ) : (
          <div className="w-full">
            <div className="flex border-b border-white/5 text-sm uppercase text-gray-500 font-bold">
              {isReordering && <div className="p-4 w-12 shrink-0"></div>}
              <div className="p-4 flex-1">Título</div>
              <div className="p-4 w-40">Categoria</div>
              <div className="p-4 w-40">Link de Resgate</div>
              <div className="p-4 w-32 text-right">Ações</div>
            </div>
            
            <Reorder.Group 
              axis="y" 
              values={benefits} 
              onReorder={handleReorder}
              className="divide-y divide-white/5"
            >
              {benefits.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhum benefício cadastrado.
                </div>
              )}
              {benefits.map((benefit) => (
                <Reorder.Item 
                  key={benefit.id} 
                  value={benefit}
                  dragListener={isReordering}
                  className={`flex items-center hover:bg-white/5 transition-colors bg-dark-surface/50 ${isReordering ? 'cursor-grab active:cursor-grabbing border-l-2 border-transparent active:border-neon-green' : ''}`}
                >
                  {isReordering && (
                    <div className="p-4 w-12 shrink-0 text-gray-600 flex justify-center">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <div className="p-4 flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{benefit.title}</div>
                    <div className="text-sm text-gray-400 truncate">{benefit.description}</div>
                  </div>
                  <div className="p-4 w-40 shrink-0">
                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-neon-green">
                      {benefit.category}
                    </span>
                    {benefit.is_banner && (
                      <span className="ml-2 bg-yellow-400/10 px-3 py-1 rounded-full text-xs font-bold text-yellow-400 border border-yellow-400/20">
                        Banner
                      </span>
                    )}
                  </div>
                  <div className="p-4 w-40 shrink-0 text-gray-400 text-sm truncate">
                    {benefit.action_link ? (
                      <div className="flex items-center gap-1">
                        <LinkIcon size={14} /> Link Cadastrado
                      </div>
                    ) : '-'}
                  </div>
                  <div className="p-4 w-32 shrink-0 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!isReordering && (
                        <>
                          <button 
                            onClick={() => handleEdit(benefit)}
                            className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(benefit.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
          <div className="bg-dark-bg border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative my-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/5 sticky top-0 bg-dark-bg z-10">
              <h3 className="text-xl font-bold">{formData.id ? 'Editar Benefício' : 'Novo Benefício'}</h3>
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
                <label className="text-sm font-bold text-gray-300">Prioridade de Exibição (Início)</label>
                <input 
                  type="number" 
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                  placeholder="0 (Maior número aparece primeiro)"
                />
                <p className="text-[10px] text-gray-500 uppercase font-black">Quanto maior o número, mais pro topo o item fica.</p>
              </div>
              
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-300 block">Banner / Imagem de Fundo (Opcional)</label>
                {formData.image_url ? (
                  <div className="relative w-full aspect-[21/9] group">
                    <img src={formData.image_url} alt="Banner" className="w-full h-full object-cover rounded-xl border border-white/10" />
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, image_url: ''})}
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
                      {uploadingImage ? 'Enviando banner...' : 'Clique para subir Banner (Recomendado: 1200x500)'}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300">Categoria</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    placeholder="Ex: VIP, Experiência"
                    className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-300">Ícone</label>
                  <div className="flex gap-4 flex-wrap">
                    {PRESET_ICONS.map((preset) => {
                      const IconComp = preset.icon;
                      const isSelected = formData.icon === preset.name;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: preset.name })}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                            isSelected 
                              ? 'border-neon-green bg-neon-green/10 text-neon-green shadow-[0_0_10px_rgba(0,255,163,0.2)]' 
                              : 'border-white/10 bg-dark-bg text-gray-400 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          <IconComp size={24} />
                          <span className="text-[10px] font-bold">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Option to type custom icon name manually if needed */}
                  <input 
                    type="text" 
                    value={formData.icon}
                    onChange={e => setFormData({...formData, icon: e.target.value})}
                    placeholder="Ou digite o nome exato (ex: Settings)"
                    className="w-full bg-dark-bg border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none text-sm mt-2"
                  />
                </div>
              </div>

              <div className="bg-dark-bg border border-white/5 rounded-2xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.is_banner}
                    onChange={e => setFormData({ ...formData, is_banner: e.target.checked })}
                    className="w-5 h-5 rounded border-white/10 text-neon-green bg-dark-surface focus:ring-neon-green focus:ring-offset-dark-bg"
                  />
                  <div>
                    <span className="text-sm font-bold text-gray-200 block">Exibir como Banner Horizontal</span>
                    <span className="text-xs text-gray-500">O card ocupará toda a largura da tela.</span>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Link de Resgate</label>
                <input 
                  type="url" 
                  value={formData.action_link}
                  onChange={e => setFormData({...formData, action_link: e.target.value})}
                  placeholder="https://..."
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                />
                <p className="text-xs text-gray-500">Ao clicar em resgatar, o sócio será levado a este link.</p>
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
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-neon-green text-dark-bg hover:bg-neon-green-hover transition-colors font-bold"
                >
                  Salvar Benefício
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
