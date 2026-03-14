import { motion } from 'motion/react';
import { MessageSquare, Heart, Share2, MoreHorizontal } from 'lucide-react';

const POSTS = [
  {
    id: 1,
    user: 'Brasília FA Oficial',
    avatar: 'B',
    time: '2h',
    content: 'Quem foi o MVP da partida de ontem? Comentem abaixo! 👇🏈',
    image: 'https://images.unsplash.com/photo-1611000273577-4b248a394d44?w=800&h=500&fit=crop',
    likes: 245,
    comments: 42
  },
  {
    id: 2,
    user: 'Carlos Silva',
    avatar: 'C',
    time: '4h',
    content: 'Incrível a energia da torcida hoje! Vamos com tudo para a final! #GoBFA',
    likes: 89,
    comments: 12
  }
];

export default function Community() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-4xl font-bold italic uppercase">Comunidade</h1>
        <button className="bg-neon-green text-dark-bg font-bold px-6 py-2 rounded-full hover:bg-neon-green-hover transition-colors">
          Novo Post
        </button>
      </motion.div>

      <div className="space-y-6">
        {POSTS.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-surface border border-white/5 rounded-2xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold">
                  {post.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{post.user}</h3>
                  <p className="text-xs text-gray-500">{post.time}</p>
                </div>
              </div>
              <button className="text-gray-500 hover:text-white">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <p className="text-gray-200 mb-4">{post.content}</p>

            {post.image && (
              <div className="rounded-xl overflow-hidden mb-4 border border-white/5">
                <img src={post.image} alt="Post content" className="w-full h-auto" />
              </div>
            )}

            <div className="flex items-center gap-6 pt-4 border-t border-white/5">
              <button className="flex items-center gap-2 text-gray-400 hover:text-neon-green transition-colors text-sm">
                <Heart size={18} />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                <MessageSquare size={18} />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm ml-auto">
                <Share2 size={18} />
                <span>Compartilhar</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
