import { Recipe, BlogArticle, Comment as CommentType } from './types';
import data from './placeholder-images.json';

const placeholderImages = data.placeholderImages;

const findImage = (id: string) => {
  const img = placeholderImages.find(p => p.id === id);
  return img || { imageUrl: "https://picsum.photos/seed/error/800/600", imageHint: "placeholder" };
};

const comments: CommentType[] = [
    { 
        id: 1, 
        author: { id: 2, username: 'Amina' },
        avatarUrl: findImage('user-avatar-1').imageUrl, 
        text: 'Recette incroyable, merci pour le partage !', 
        timestamp: 'il y a 2 heures',
        likes: 15,
        replies: [
            { id: 3, author: { id: 3, username: 'Maman Diarra' }, avatarUrl: findImage('user-avatar-3').imageUrl, text: 'Avec plaisir Amina ! Contente que ça te plaise.', timestamp: 'il y a 1 heure', likes: 8, replies: [] }
        ]
    },
    { 
        id: 2, 
        author: { id: 4, username: 'Kofi' },
        avatarUrl: findImage('user-avatar-2').imageUrl, 
        text: 'Je l\'ai essayé ce week-end, un vrai régal. J\'ai ajouté un peu plus de piment.', 
        timestamp: 'il y a 5 heures',
        likes: 7,
        replies: [] 
    },
];

const recipes: Recipe[] = [
    {
        slug: 'thieboudienne',
        title: 'Thieboudienne',
        description: 'Plat national du Sénégal, un délicieux ragoût de poisson, de riz et de sauce tomate avec des légumes variés.',
        ...findImage('thieboudienne'),
        category: 'Afrique de l’Ouest',
        country: 'Sénégal',
        ingredients: [
            { name: 'Poisson (Thiof)', quantity: '1 kg' },
            { name: 'Riz', quantity: '500g' },
            { name: 'Concentré de tomate', quantity: '150g' },
            { name: 'Carottes', quantity: '4' },
            { name: 'Manioc', quantity: '1' },
            { name: 'Chou blanc', quantity: '1/2' },
        ],
        steps: [
            'Préparer la farce du poisson (Rof) et farcir le poisson.',
            'Faire dorer le poisson dans l\'huile chaude.',
            'Ajouter le concentré de tomate, l\'eau et les légumes.',
            'Laisser mijoter jusqu\'à ce que les légumes soient tendres.',
            'Retirer le poisson et les légumes, puis cuire le riz dans le bouillon.',
            'Servir le riz avec le poisson et les légumes.',
        ],
        likes: 128,
        comments: comments,
        author: { name: 'Maman Diarra', avatarUrl: findImage('user-avatar-3').imageUrl },
    },
    {
        slug: 'jollof-rice',
        title: 'Riz Jollof',
        description: 'Un plat de riz emblématique d\'Afrique de l\'Ouest, cuit dans une sauce tomate riche et épicée.',
        ...findImage('jollof-rice'),
        category: 'Afrique de l’Ouest',
        country: 'Ghana',
        ingredients: [
            { name: 'Riz long grain', quantity: '400g' },
            { name: 'Poulet ou boeuf', quantity: '500g' },
            { name: 'Tomates fraîches', quantity: '4' },
            { name: 'Poivron rouge', quantity: '1' },
            { name: 'Oignon', quantity: '1' },
            { name: 'Piment Scotch Bonnet', quantity: '1' },
        ],
        steps: [
            'Faire revenir la viande et réserver.',
            'Mixer les tomates, le poivron, l\'oignon et le piment pour faire la sauce.',
            'Faire cuire la sauce jusqu\'à réduction.',
            'Ajouter le riz et le bouillon, puis laisser cuire à feu doux.',
            'Incorporer la viande et servir chaud.',
        ],
        likes: 256,
        comments: [],
        author: { name: 'Kofi', avatarUrl: findImage('user-avatar-2').imageUrl },
    },
    {
        slug: 'tagine-marocain',
        title: 'Tagine Marocain',
        description: 'Un ragoût marocain traditionnel, lentement mijoté dans un plat en terre cuite. Celui-ci est à l\'agneau et aux pruneaux.',
        ...findImage('tagine'),
        category: 'Afrique du Nord',
        country: 'Maroc',
        ingredients: [
            { name: 'Épaule d\'agneau', quantity: '1 kg' },
            { name: 'Pruneaux dénoyautés', quantity: '250g' },
            { name: 'Amandes émondées', quantity: '100g' },
            { name: 'Oignons', quantity: '2' },
            { name: 'Gingembre, Curcuma, Cannelle', quantity: '1 c.à.c de chaque' },
            { name: 'Miel', quantity: '2 c.à.s' },
        ],
        steps: [
            'Faire dorer la viande avec les oignons et les épices.',
            'Couvrir d\'eau et laisser mijoter 1h30.',
            'Ajouter les pruneaux et le miel, et poursuivre la cuisson 30 minutes.',
            'Faire griller les amandes et les ajouter avant de servir.',
        ],
        likes: 312,
        comments: comments.slice(0, 1),
        author: { name: 'Fatima', avatarUrl: findImage('user-avatar-3').imageUrl },
    },
    {
        slug: 'poulet-yassa',
        title: 'Poulet Yassa',
        description: 'Un plat sénégalais de poulet mariné dans une sauce aux oignons, citron et moutarde.',
        ...findImage('poulet-yassa'),
        category: 'Afrique de l’Ouest',
        country: 'Sénégal',
        ingredients: [
            { name: 'Poulet', quantity: '1 entier' },
            { name: 'Oignons', quantity: '4 grands' },
            { name: 'Citrons verts', quantity: '3' },
            { name: 'Moutarde de Dijon', quantity: '3 c.à.s' },
            { name: 'Gousses d\'ail', quantity: '4' },
            { name: 'Huile d\'arachide', quantity: '5 c.à.s' },
        ],
        steps: [
            'Mariner le poulet avec oignons, citron, moutarde et ail pendant au moins 4 heures.',
            'Griller ou braiser le poulet.',
            'Faire confire la marinade d\'oignons dans une cocotte.',
            'Ajouter le poulet grillé à la sauce et laisser mijoter.',
            'Servir avec du riz blanc.',
        ],
        likes: 189,
        comments: [],
        author: { name: 'Amina', avatarUrl: findImage('user-avatar-1').imageUrl },
    },
    {
        slug: 'injera-et-wats',
        title: 'Injera et Wats',
        description: 'Le plat de base éthiopien, une crêpe fermentée (Injera) servie avec divers ragoûts (Wats).',
        ...findImage('injera'),
        category: 'Afrique de l\'Est',
        country: 'Éthiopie',
        ingredients: [
            { name: 'Farine de teff', quantity: '500g' },
            { name: 'Lentilles corail (Misir Wat)', quantity: '250g' },
            { name: 'Poulet (Doro Wat)', quantity: '500g' },
            { name: 'Berbéré (mélange d\'épices)', quantity: '3 c.à.s' },
            { name: 'Oignons', quantity: '3' },
        ],
        steps: [
            'Préparer la pâte à Injera et la laisser fermenter 3 jours.',
            'Cuire les crêpes Injera.',
            'Préparer le Doro Wat (ragoût de poulet) avec du berbéré.',
            'Préparer le Misir Wat (ragoût de lentilles).',
            'Servir les Wats sur une grande Injera.',
        ],
        likes: 220,
        comments: [comments[1]],
        author: { name: 'Kofi', avatarUrl: findImage('user-avatar-2').imageUrl },
    },
    {
        slug: 'bobotie',
        title: 'Bobotie',
        description: 'Plat national d\'Afrique du Sud, un gratin de viande hachée épicée et fruitée, nappé d\'une crème aux œufs.',
        ...findImage('bobotie'),
        category: 'Afrique du Sud',
        country: 'Afrique du Sud',
        ingredients: [
            { name: 'Viande de bœuf hachée', quantity: '1 kg' },
            { name: 'Pain de mie', quantity: '2 tranches' },
            { name: 'Lait', quantity: '250ml' },
            { name: 'Abricots secs', quantity: '100g' },
            { name: 'Poudre de curry', quantity: '2 c.à.s' },
            { name: 'Oeufs', quantity: '2' },
        ],
        steps: [
            'Faire tremper le pain dans le lait.',
            'Mélanger la viande avec oignons, curry, pain essoré et abricots.',
            'Tasser le mélange dans un plat à gratin.',
            'Mélanger le reste du lait avec les œufs et verser sur la viande.',
            'Enfourner à 180°C pendant 45 minutes.',
        ],
        likes: 95,
        comments: [],
        author: { name: 'Fatima', avatarUrl: findImage('user-avatar-3').imageUrl },
    },
];

const articles: BlogArticle[] = [
  { slug: 'l-histoire-du-jollof', title: "La Guerre du Riz Jollof : une rivalité savoureuse", excerpt: "Plongez au cœur de la rivalité amicale entre le Ghana et le Nigeria pour le titre du meilleur riz Jollof...", ...findImage('blog-market'), content: "Contenu complet de l'article sur le riz Jollof.", author: "Évivi", date: "15 Juil 2024", views: 15200 },
  { slug: 'le-secret-des-epices', title: "Le Secret des Épices : le Berbéré Éthiopien", excerpt: "Découvrez le berbéré, ce mélange d'épices complexe qui est l'âme de la cuisine éthiopienne...", ...findImage('blog-spices'), content: "Contenu complet de l'article sur le Berbéré.", author: "Évivi", date: "10 Juil 2024", views: 9800 },
  { slug: 'le-partage-un-ingredient-essentiel', title: "Le Partage, un Ingrédient Essentiel", excerpt: "En Afrique, un repas est bien plus que de la nourriture. C'est un acte de communauté, de partage...", ...findImage('blog-community'), content: "Contenu complet de l'article sur le partage.", author: "Évivi", date: "05 Juil 2024", views: 12400 },
  { slug: 'la-main-a-la-pate', title: "La Main à la Pâte : L'art de l'Ugali, du Fufu et du Banku", excerpt: "Ces accompagnements à base de farine sont le pilier de nombreux repas à travers le continent. Apprenez leurs secrets...", ...findImage('blog-hands'), content: "Contenu complet de l'article sur les pâtes.", author: "Évivi", date: "01 Juil 2024", views: 7600 },
];

export const getRecipes = (): Recipe[] => recipes;
export const getRecipeBySlug = (slug: string): Recipe | undefined => recipes.find(r => r.slug === slug);
export const getPopularRecipes = (): Recipe[] => [...recipes].sort((a, b) => b.likes - a.likes).slice(0, 3);
export const getRecipesByCategory = (category: string): Recipe[] => recipes.filter(r => r.category === category);

export const getArticles = (): BlogArticle[] => articles;
export const getArticleBySlug = (slug: string): BlogArticle | undefined => articles.find(a => a.slug === slug);
export const getRecentArticles = (): BlogArticle[] => articles.slice(0, 4);
export const getPopularArticles = (): BlogArticle[] => [...articles].sort((a, b) => b.views - a.views).slice(0, 3);
