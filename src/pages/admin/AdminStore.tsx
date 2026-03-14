import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, Plus, Pencil, Trash2, X, Upload } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  regular_price: number;
  sale_price: number | null;
  image_url: string;
  checkout_url: string;
}

export default function AdminStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    regular_price: '',
    sale_price: '',
    image_url: '',
    checkout_url: ''
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('store_products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setProducts(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('store-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao subir a imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      alert('A imagem do produto é obrigatória.');
      return;
    }

    const isEditing = !!formData.id;
    
    // Convert comma to dot if user types R$ 10,00
    const regular = parseFloat(formData.regular_price.toString().replace(',', '.'));
    const sale = formData.sale_price ? parseFloat(formData.sale_price.toString().replace(',', '.')) : null;

    const payload = {
      name: formData.name,
      regular_price: regular,
      sale_price: sale,
      image_url: formData.image_url,
      checkout_url: formData.checkout_url
    };

    if (isEditing) {
      await supabase.from('store_products').update(payload).eq('id', formData.id);
    } else {
      await supabase.from('store_products').insert([payload]);
    }
    
    setIsModalOpen(false);
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      regular_price: product.regular_price.toString(),
      sale_price: product.sale_price ? product.sale_price.toString() : '',
      image_url: product.image_url,
      checkout_url: product.checkout_url
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      await supabase.from('store_products').delete().eq('id', id);
      fetchProducts();
    }
  };

  const openNewModal = () => {
    setFormData({ id: '', name: '', regular_price: '', sale_price: '', image_url: '', checkout_url: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Loja Exclusiva</h2>
          <p className="text-gray-400">Produtos, preços e links de venda.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-neon-green text-dark-bg px-4 py-2 font-bold rounded-lg flex items-center gap-2 hover:bg-neon-green-hover transition-colors"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      <div className="bg-dark-surface/50 border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Carregando produtos...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-sm uppercase text-gray-500">
                <th className="p-4 font-bold w-24">Imagem</th>
                <th className="p-4 font-bold">Produto</th>
                <th className="p-4 font-bold">Preço Regular</th>
                <th className="p-4 font-bold">Oferta</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-dark-bg" />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white">{product.name}</div>
                  </td>
                  <td className="p-4">
                    R$ {product.regular_price.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="p-4">
                    {product.sale_price ? (
                      <span className="text-neon-green font-bold">
                        R$ {product.sale_price.toFixed(2).replace('.', ',')}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
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
              <h3 className="text-xl font-bold">{formData.id ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-300 block">Imagem do Produto (Obrigatório 1:1, Quadrada)</label>
                {formData.image_url ? (
                  <div className="relative w-40 h-40 mx-auto group">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover rounded-2xl border-2 border-neon-green" />
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, image_url: ''})}
                      className="absolute top-2 right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-32 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center relative hover:border-neon-green/50 transition-colors bg-white/5">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingImage}
                    />
                    <Upload className="text-gray-400 mb-2" />
                    <span className="text-sm font-bold text-gray-400">
                      {uploadingImage ? 'Enviando imagem...' : 'Clique para subir (1080x1080px)'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Nome do Produto</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300">Preço Principal (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.regular_price}
                    onChange={e => setFormData({...formData, regular_price: e.target.value})}
                    placeholder="199.90"
                    className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300">Preço Promoção (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.sale_price}
                    onChange={e => setFormData({...formData, sale_price: e.target.value})}
                    placeholder="149.90 (Opcional)"
                    className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Link do Gateway (Checkout URL)</label>
                <input 
                  type="url" 
                  value={formData.checkout_url}
                  onChange={e => setFormData({...formData, checkout_url: e.target.value})}
                  placeholder="https://mpago.la/..."
                  className="w-full bg-dark-surface border border-white/10 rounded-xl p-3 focus:border-neon-green transition-colors outline-none"
                  required
                />
                <p className="text-xs text-gray-500">Ao clicar em comprar, o usuário será direcionado para cá (Pagar.me, MercadoPago, etc).</p>
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
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
