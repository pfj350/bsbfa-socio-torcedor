import { 
  Home, 
  Ticket, 
  ShoppingBag, 
  PlayCircle, 
  Users, 
  Trophy,
  Calendar,
  MapPin,
  ChevronRight,
  Bell,
  Menu,
  QrCode,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Início', icon: Home, path: '/' },
  { label: 'Benefícios', icon: Trophy, path: '/benefits' },
  { label: 'Loja Exclusiva', icon: ShoppingBag, path: '/store' },
  { label: 'Guias', icon: BookOpen, path: '/guides' },
  { label: 'Conteúdo', icon: PlayCircle, path: '/content' },
];

export const MOCK_USER = {
  name: 'Aloysio',
  type: 'Sócio Torcedor',
  level: 'MVP',
  points: 2450,
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  memberId: 'BFA-2024-8821'
};

export const NEXT_GAME = {
  opponent: 'Tubarões do Cerrado',
  date: '2024-10-24T14:00:00',
  location: 'Estádio Mané Garrincha',
  status: 'Confirmado',
  logo: 'https://images.unsplash.com/photo-1560272564-c8304700f8fc?w=100&h=100&fit=crop' // Placeholder
};

export const NEWS = [
  {
    id: 1,
    title: 'Vitória histórica contra o Cuiabá Arsenal',
    category: 'Jogo',
    image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=500&fit=crop',
    date: 'Há 2 dias'
  },
  {
    id: 2,
    title: 'Novo uniforme da temporada 2024/25',
    category: 'Clube',
    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=500&fit=crop',
    date: 'Há 5 dias'
  }
];

export const BENEFITS = [
  {
    id: 1,
    title: '20% OFF na Centauro',
    description: 'Desconto exclusivo em toda a loja online.',
    icon: ShoppingBag,
    type: 'Parceiro'
  },
  {
    id: 2,
    title: 'Visita ao Treino',
    description: 'Acompanhe a preparação do time de perto.',
    icon: ShieldCheck,
    type: 'Experiência'
  },
  {
    id: 3,
    title: 'Meet & Greet',
    description: 'Conheça os jogadores após o próximo jogo.',
    icon: Users,
    type: 'VIP'
  }
];

export const PRODUCTS = [
  {
    id: 1,
    name: 'Jersey Oficial 2024',
    price: 249.90,
    image: 'https://images.unsplash.com/photo-1577212017184-80cc0da1137a?w=400&h=400&fit=crop',
    exclusive: false
  },
  {
    id: 2,
    name: 'Boné Snapback BFA',
    price: 89.90,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
    exclusive: true
  },
  {
    id: 3,
    name: 'Kit Sócio Torcedor',
    price: 199.90,
    image: 'https://images.unsplash.com/photo-1556906781-9a412961d28c?w=400&h=400&fit=crop',
    exclusive: true
  }
];
