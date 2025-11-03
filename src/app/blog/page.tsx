"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getArticles, getPopularArticles, BlogArticle } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, PlusCircle, ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const formatViews = (num: number) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

export default function BlogPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [popularArticles, setPopularArticles] = useState<BlogArticle[]>([]);
  
  useEffect(() => {
    const allArticles = getArticles();
    setArticles(allArticles);
    setPopularArticles(getPopularArticles());
  }, []);

  const otherArticles = articles; // We will display all articles in the main list

  if (articles.length === 0) {
    return (
        <div className="py-24 px-4 min-h-screen flex justify-center items-center">
            <p>Chargement des articles...</p>
        </div>
    );
  }

  return (
    <div className="py-24 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-headline font-bold">Histoires <span className="text-gradient">Culinaires</span></h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Plongez dans les récits, les traditions et les innovations qui façonnent la cuisine africaine.</p>
        <Button asChild className="mt-6 animate-pulse-glow">
            <Link href="/blog/create">
                <PlusCircle className="mr-2 h-5 w-5" /> Écrire un article
            </Link>
        </Button>
      </motion.div>
      
      {/* Featured Articles Carousel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className='flex items-center mb-4'>
            <h2 className="text-2xl font-headline font-bold text-primary">À la une</h2>
            <div className='ml-4 h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent'></div>
        </div>
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent>
                {popularArticles.map((article) => (
                    <CarouselItem key={article.slug}>
                         <Link href={`/blog/${article.slug}`}>
                            <Card className="glassmorphic group overflow-hidden md:grid md:grid-cols-2 md:gap-0">
                                <div className="relative h-64 md:h-auto">
                                <Image
                                    src={article.imageUrl}
                                    alt={article.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    data-ai-hint={article.imageHint}
                                    priority
                                />
                                </div>
                                <div className="p-8 md:p-12 flex flex-col justify-center">
                                <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">À la une</p>
                                <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-4 group-hover:text-secondary transition-colors">{article.title}</h2>
                                <p className="text-muted-foreground line-clamp-3 mb-6">{article.excerpt}</p>
                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2"><User className="h-4 w-4" /><span>{article.author}</span></div>
                                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{article.date}</span></div>
                                </div>
                                </div>
                            </Card>
                        </Link>
                    </CarouselItem>
                ))}
            </CarouselContent>
             <CarouselPrevious className="text-primary hover:bg-primary/20 hover:text-primary left-[-1rem]"/>
             <CarouselNext className="text-primary hover:bg-primary/20 hover:text-primary right-[-1rem]"/>
        </Carousel>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content: Other Articles */}
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-2 space-y-8"
        >
          {otherArticles.map((article) => (
            <motion.div variants={item} key={article.slug}>
              <Link href={`/blog/${article.slug}`}>
                <Card className="glassmorphic group overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg flex flex-col md:flex-row">
                    <div className="relative h-48 md:h-auto md:w-1/3 flex-shrink-0">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        data-ai-hint={article.imageHint}
                      />
                    </div>
                  <CardContent className="p-6 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-headline font-bold text-primary mb-2 group-hover:text-secondary transition-colors">{article.title}</h2>
                      <p className="text-muted-foreground line-clamp-2">{article.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
                      <div className="flex items-center gap-2"><User className="h-4 w-4" /><span>{article.author}</span></div>
                      <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{article.date}</span></div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Sidebar: Popular Articles */}
        <motion.aside 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
        >
            <div className="sticky top-24 p-6 rounded-xl glassmorphic">
                <h3 className="text-2xl font-headline font-bold text-primary mb-6">Les plus populaires</h3>
                <div className="space-y-6">
                    {popularArticles.map((article, index) => (
                        <motion.div 
                            key={article.slug}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                        >
                            <Link href={`/blog/${article.slug}`} className="group flex items-start gap-4">
                                <span className="text-3xl font-bold font-headline text-primary/30 group-hover:text-secondary transition-colors mt-1">0{index+1}</span>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">{article.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <Eye className="h-3 w-3" />
                                        <span>{formatViews(article.views)} vues</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.aside>
      </div>
    </div>
  );
}
