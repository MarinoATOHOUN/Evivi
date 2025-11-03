"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Utensils, Sprout, BookOpen, ChefHat, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { getPopularRecipes, getRecentArticles, Recipe, BlogArticle } from '@/lib/mock-data';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'Afrique de l’Ouest', icon: Utensils, description: 'Saveurs audacieuses et épicées' },
  { name: 'Afrique du Nord', icon: Sprout, description: 'Mélanges sucrés-salés raffinés' },
  { name: 'Afrique Centrale', icon: ChefHat, description: 'Cuisine forestière et authentique' },
  { name: 'Afrique du Sud', icon: BookOpen, description: 'Influences multiples et colorées' },
];

const FloatingIcon = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [isClient, setIsClient] = useState(false);
  const [animation, setAnimation] = useState({
    initialY: 0,
    initialX: 0,
    duration: 10,
    delay: 0
  });

  useEffect(() => {
    setIsClient(true);
    setAnimation({
      initialY: Math.random() * 20 - 10,
      initialX: Math.random() * 20 - 10,
      duration: Math.random() * 5 + 8,
      delay: Math.random() * 5,
    });
  }, []);

  if (!isClient) {
    return null;
  }
  
  const { initialY, initialX, duration, delay } = animation;

  return (
    <motion.div
      className={`absolute text-primary/30 ${className}`}
      initial={{ y: `${initialY}vh`, x: `${initialX}vw`, opacity: 0 }}
      animate={{ 
        y: [`${initialY}vh`, `${initialY + Math.random() * 5 - 2.5}vh`, `${initialY}vh`],
        x: [`${initialX}vw`, `${initialX + Math.random() * 5 - 2.5}vw`, `${initialX}vw`],
        rotate: [0, Math.random() * 20 - 10, 0],
        opacity: [0, 0.5, 0]
      }}
      transition={{ 
        duration: duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay,
       }}
    >
      {children}
    </motion.div>
  );
};

const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(recipe.likes);

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to recipe details
        e.stopPropagation(); // Stop event bubbling
        setIsLiked(!isLiked);
        setLikeCount(likeCount + (!isLiked ? 1 : -1));
    };

    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.05, boxShadow: "0px 10px 30px -5px hsl(var(--primary)/0.2)" }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="h-full group"
        >
            <Card className="h-full overflow-hidden glassmorphic flex flex-col">
              <Link href={`/recipes/${recipe.slug}`} className="block">
                <div className="relative h-48 overflow-hidden">
                    <Image
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        data-ai-hint={recipe.imageHint}
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
              </Link>
                <CardContent className="p-4 flex flex-col flex-grow">
                     <div className="flex-grow">
                        <Link href={`/recipes/${recipe.slug}`} className="group/title">
                            <h3 className="text-lg font-headline font-bold text-primary group-hover/title:text-secondary transition-colors">{recipe.title}</h3>
                        </Link>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/10">
                         <Link href="/profile" onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 group/author">
                            <Avatar className="h-8 w-8 border-2 border-primary group-hover/author:border-secondary transition-colors">
                                <AvatarImage src={recipe.author.avatarUrl} alt={recipe.author.name} />
                                <AvatarFallback>{recipe.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex items-center gap-4 text-xs">
                            <button
                                onClick={handleLike}
                                className={cn(
                                    "flex items-center gap-1.5 transition-colors hover:text-destructive",
                                    isLiked ? "text-destructive" : "text-muted-foreground"
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
                </CardContent>
            </Card>
        </motion.div>
    );
};

const BlogCard = ({ article }: { article: BlogArticle }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="h-full"
    >
      <Link href={`/blog/${article.slug}`} className="block h-full">
        <Card className="h-full overflow-hidden glassmorphic group">
           <div className="relative h-40">
             <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              data-ai-hint={article.imageHint}
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-headline text-md font-bold text-primary">{article.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default function Home() {
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [recentArticles, setRecentArticles] = useState<BlogArticle[]>([]);

  useEffect(() => {
    setPopularRecipes(getPopularRecipes());
    setRecentArticles(getRecentArticles());
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center h-screen-safe overflow-hidden">
          <div className="absolute inset-0 z-0">
            <FloatingIcon className="top-[10%] left-[10%]"><Utensils size={80} /></FloatingIcon>
            <FloatingIcon className="top-[20%] right-[15%]"><Sprout size={60} /></FloatingIcon>
            <FloatingIcon className="bottom-[15%] left-[20%]"><ChefHat size={70} /></FloatingIcon>
            <FloatingIcon className="bottom-[25%] right-[25%]"><BookOpen size={90} /></FloatingIcon>
          </div>

          <div className="z-10 text-center px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-primary"
            >
              Évivi
            </motion.h1>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold text-gradient mt-2"
            >
              Le goût de l'Afrique en réseau.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground"
            >
              Le réseau social qui célèbre la gastronomie africaine. Partagez vos recettes, racontez vos histoires et connectez-vous avec des milliers de passionnés.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full animate-pulse-glow">
                <Link href="/recipes">
                  Découvrir les recettes <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
               <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link href="/auth/register">
                  Rejoindre la communauté
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-headline font-bold text-center mb-12">Explorer par <span className="text-gradient">Région</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -15, boxShadow: "0px 20px 25px -5px hsl(var(--primary)/0.15), 0px 8px 10px -6px hsl(var(--primary)/0.15)"}}
                  className="relative p-6 rounded-lg glassmorphic flex flex-col items-center text-center"
                >
                  <div className="p-4 bg-primary/20 rounded-full mb-4">
                    <category.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-headline font-bold text-primary">{category.name}</h3>
                  <p className="text-muted-foreground mt-2">{category.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Recipes Section */}
        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto">
            <h2 className="text-4xl font-headline font-bold text-center mb-12">Recettes <span className="text-gradient">Populaires</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularRecipes.map((recipe) => (
                 <RecipeCard key={recipe.slug} recipe={recipe} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button asChild size="lg" variant="outline" className="rounded-full border-secondary text-secondary hover:bg-secondary/10 hover:text-secondary">
                <Link href="/recipes">Voir toutes les recettes <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Blog Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-headline font-bold text-center mb-12">Histoires <span className="text-gradient">Culinaires</span></h2>
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent>
                {recentArticles.map((article, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <BlogCard article={article} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="text-primary hover:bg-primary/20 hover:text-primary"/>
              <CarouselNext className="text-primary hover:bg-primary/20 hover:text-primary"/>
            </Carousel>
          </div>
        </section>
      </main>
    </div>
  );
}
