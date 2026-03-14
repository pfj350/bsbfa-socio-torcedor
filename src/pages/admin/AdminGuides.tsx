import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookOpen, Plus, Pencil, Trash2, X, Upload, File as FileIcon } from 'lucide-react';

interface Guide {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  file_url: string;
}

export default function AdminGuides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    cover_image_url: '',
    file_url: ''
  });

  const fetchGuides = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setGuides(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('guide-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('guide-covers')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, cover_image_url: data.publicUrl }));
    } catch (error) {
      alert('Erro ao subir a capa do guia.');
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
      // Keeps original name sanitized + random component for uniqueness
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${Math.random().toString(36).substring(7)}_${safeName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('guide-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('guide-files')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, file_url: data.publicUrl }));
    } catch (error) {
      alert('Erro ao subir o arquivo do guia.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cover_image_url || !formData.file_url) {
      alert('A imagem de capa e o arquivo (PDF/zip) são obrigatórios.');
      return;
    }

    const isEditing = !!formData.id;
    
    const payload = {
      title: formData.title,
      description: formData.description,
      cover_image_url: formData.cover_image_url,
      file_url: formData.file_url
    };

    if (isEditing) {
      await supabase.from('guides').update(payload).eq('id', formData.id);
    } else {
      await supabase.from('guides').insert([payload]);
    }
    
    setIsModalOpen(false);
    fetchGuides();
  };

  const handleEdit = (guide: Guide) => {
    setFormData({
      id: guide.id,
      title: guide.title,
      description: guide.description,
      cover_image_url: guide.cover_image_url || '',
      file_url: guide.file_url || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este guia?')) {
      await supabase.from('guides').delete().eq('id', id);
      fetchGuides();
    }
  };

  const openNewModal = () => {
    setFormData({ id: '', title: '', description: '', cover_image_url: '', file_url: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Guias (PDFs e Arquivos)</h2>
          <p className="text-gray-400">Materiais ricos, playbooks e manuais para baixar.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-neon-green text-dark-bg px-4 py-2 font-bold rounded-lg flex items-center gap-2 hover:bg-neon-green-hover transition-colors"
        >
          <Plus size={20} />
          Novo Guia
        </button>
      </div>

      <div className="bg-dark-surface/50 border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Carregando guias...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-sm uppercase text-gray-500">
                <th className="p-4 font-bold w-24">Capa</th>
                <th className="p-4 font-bold">Guia</th>
                <th className="p-4 font-bold">Arquivo</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {guides.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Nenhum guia cadastrado.
                  </td>
                </tr>
              )}
              {guides.map((guide) => (
                <tr key={guide.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <img src={guide.cover_image_url} alt={guide.title} className="w-16 h-20 object-cover rounded-lg bg-dark-bg" />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white">{guide.title}</div>
                    <div className="text-sm text-gray-400 line-clamp-1 max-w-xs">{guide.description}</div>
                  </td>
                  <td className="p-4">
                    <a href={guide.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-neon-green hover:underline text-sm font-bold">
                      <FileIcon size={16} /> Acessar Arquivo
                    </a>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
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
              <h3 className="text-xl font-bold">{formData.id ? 'Editar Guia' : 'Novo Guia'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-300 block">Imagem da Capa</label>
                {formData.cover_image_url ? (
                  <div className="relative w-32 h-44 mx-auto group">
                    <img src={formData.cover_image_url} alt="Capa" className="w-full h-full object-cover rounded-xl border border-white/10" />
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, cover_image_url: ''})}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-24 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center relative hover:border-neon-green/50 transition-colors bg-white/5">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingImage}
                    />
                    <span className="text-sm font-bold text-gray-400">
                      {uploadingImage ? 'Enviando imagem...' : 'Clique para subir uma Capa'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-300 block">Arquivo (.pdf, .zip, etc)</label>
                {formData.file_url ? (
                  <div className="bg-neon-green/10 border border-neon-green/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-neon-green font-bold text-sm">
                      <FileIcon size={20} /> Arquivo Anexado Pronto
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, file_url: ''})}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-24 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center relative hover:border-neon-green/50 transition-colors bg-white/5">
                    <input 
                      type="file" 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingFile}
                    />
                    <Upload className="text-neon-green mb-2" />
                    <span className="text-sm font-bold text-gray-400">
                      {uploadingFile ? 'Enviando arquivo pesado...' : 'Clique para selecionar o Arquivo do Guia'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Título do Guia</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Descrição curta do Guia</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none min-h-[100px]"
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
                  disabled={uploadingImage || uploadingFile}
                  className="px-6 py-3 rounded-xl bg-neon-green text-dark-bg hover:bg-neon-green-hover transition-colors font-bold disabled:opacity-50"
                >
                  Salvar Guia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
