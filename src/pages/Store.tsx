import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  regular_price: number;
  sale_price: number | null;
  image_url: string;
  checkout_url: string;
}

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setProducts(data);
      }
      setIsLoading(false);
    }
    
    fetchProducts();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-bold italic uppercase mb-2">Loja <span className="text-neon-green">Exclusiva</span></h1>
          <p className="text-gray-400">Produtos oficiais e coleções exclusivas.</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-neon-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl">
          <p>Nenhum produto disponível na loja no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative aspect-square bg-dark-bg rounded-3xl overflow-hidden mb-4 border border-white/5 group-hover:border-neon-green/30 transition-all">
                {product.sale_price && (
                  <div className="absolute top-4 left-4 z-10 bg-dark-bg/80 backdrop-blur border border-neon-green/30 text-neon-green text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star size={12} fill="currentColor" />
                    OFERTA SÓCIO
                  </div>
                )}
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => window.open(product.checkout_url, '_blank')}
                    className="bg-neon-green text-dark-bg font-bold py-3 px-6 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-neon-green-hover hover:scale-105"
                  >
                    <ShoppingBag size={18} />
                    COMPRAR AGORA
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-1 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-2 font-mono">
                  {product.sale_price ? (
                    <>
                      <span className="text-gray-500 line-through text-sm">R$ {product.regular_price.toFixed(2).replace('.', ',')}</span>
                      <span className="text-neon-green font-bold text-lg">R$ {product.sale_price.toFixed(2).replace('.', ',')}</span>
                    </>
                  ) : (
                    <span className="text-gray-300">R$ {product.regular_price.toFixed(2).replace('.', ',')}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
