"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, MessageCircle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRecipes, Recipe, RecipeCategory } from '@/lib/mock-data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const categories: RecipeCategory[] = ['Afrique de l’Ouest', 'Afrique du Nord', 'Afrique Centrale', 'Afrique de l\'Est', 'Afrique du Sud'];

const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(recipe.likes);

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLiked(!isLiked);
        setLikeCount(likeCount + (!isLiked ? 1 : -1));
    };
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="break-inside-avoid group"
        >
             <div className="relative overflow-hidden rounded-t-lg">
                <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    width={400}
                    height={recipe.slug === 'thieboudienne' || recipe.slug === 'tagine-marocain' ? 600 : 400}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    data-ai-hint={recipe.imageHint}
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-4 rounded-b-lg glassmorphic border-t-0">
                <Link href={`/recipes/${recipe.slug}`} className="group">
                    <h3 className="text-xl font-headline font-bold text-primary group-hover:text-secondary transition-colors">{recipe.title}</h3>
                </Link>
                 <p className="text-sm text-muted-foreground mt-1">{recipe.country}</p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/10">
                    <Link href="/profile" onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 group/author">
                       <Avatar className="w-8 h-8 border-2 border-primary group-hover/author:border-secondary transition-colors">
                            <AvatarImage src={recipe.author.avatarUrl} />
                            <AvatarFallback>{recipe.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold group-hover/author:text-secondary transition-colors">{recipe.author.name}</span>
                    </Link>

                    <div className="flex items-center gap-4 text-xs">
                         <button
                            onClick={handleLike}
                            className={cn(
                                "flex items-center gap-1.5 transition-colors",
                                isLiked ? "text-destructive" : "text-muted-foreground",
                                "hover:text-destructive"
                            )}
                        >
                            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                            <span>{likeCount}</span>
                        </button>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MessageCircle className="w-4 h-4 text-secondary" />
                            <span>{recipe.comments.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


export default function RecipesPage() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [country, setCountry] = useState('all');

  useEffect(() => {
    setAllRecipes(getRecipes());
  }, []);

  const countries = useMemo(() => ['all', ...Array.from(new Set(allRecipes.map(r => r.country)))], [allRecipes]);

  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || recipe.category === category;
      const matchesCountry = country === 'all' || recipe.country === country;
      return matchesSearch && matchesCategory && matchesCountry;
    });
  }, [searchTerm, category, country, allRecipes]);

  return (
    <div className="container mx-auto py-24 px-4 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-headline font-bold">Toutes les <span className="text-gradient">Recettes</span></h1>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Parcourez notre collection de recettes authentiques et innovantes de tout le continent.</p>
            <Button asChild className="mt-6 animate-pulse-glow">
                <Link href="/create">
                    <PlusCircle className="mr-2 h-5 w-5" /> Créer une recette
                </Link>
            </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="my-8 p-4 rounded-xl glassmorphic"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="relative md:col-span-2">
            <Input
              type="text"
              placeholder="Rechercher une recette..."
              className="pl-10 h-12 text-base bg-card border-primary/20 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <motion.div
              animate={{
                scale: searchTerm ? [1, 1.2, 1] : 1,
                color: searchTerm ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
              }}
              transition={{ duration: 0.3 }}
              className="absolute left-3 top-0 bottom-0 flex items-center"
            >
              <Search className="w-5 h-5" />
            </motion.div>
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-12 bg-card border-primary/20">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="h-12 bg-card border-primary/20">
              <SelectValue placeholder="Pays" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les pays</SelectItem>
              {countries.map(c => c !== 'all' && <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            <AnimatePresence>
                {filteredRecipes.map((recipe) => (
                    <RecipeCard key={recipe.slug} recipe={recipe} />
                ))}
            </AnimatePresence>
        </div>
      
      {filteredRecipes.length === 0 && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center col-span-full py-20"
        >
            <p className="text-xl text-muted-foreground">Aucune recette ne correspond à votre recherche.</p>
            <Button variant="link" onClick={() => { setSearchTerm(''); setCategory('all'); setCountry('all'); }}>Réinitialiser les filtres</Button>
        </motion.div>
      )}
    </div>
  );
}
