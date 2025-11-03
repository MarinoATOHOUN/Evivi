"use client";

import { useRef, use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { getRecipeBySlug, Recipe, Comment as CommentType } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Clock, Users, ChefHat, ThumbsUp, Send } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};


const ParallaxImage = ({ recipe }: { recipe: Recipe }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={ref} className="relative h-[80vh] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src={recipe.imageUrl}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
          data-ai-hint={recipe.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </motion.div>
      <motion.div
        style={{ opacity }}
        className="absolute bottom-0 left-0 right-0 p-8 text-white z-10 container mx-auto"
      >
        <motion.div variants={itemVariants}>
          <Badge variant="secondary" className="mb-4">{recipe.category}</Badge>
        </motion.div>
        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-headline font-bold text-primary shadow-lg">
          {recipe.title}
        </motion.h1>
        <motion.p variants={itemVariants} className="mt-4 max-w-2xl text-lg text-white/90">
          {recipe.description}
        </motion.p>
      </motion.div>
    </div>
  );
};

const CommentForm = ({ placeholder, buttonText, onSubmit }: { placeholder: string, buttonText: string, onSubmit: (text: string) => void }) => {
  const [text, setText] = useState('');
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };
  
  if (!user) {
    return (
        <div className="text-center p-4 border rounded-lg">
            <p className="text-muted-foreground">Vous devez être connecté pour commenter.</p>
            <Button variant="link" asChild><Link href="/auth/login">Se connecter</Link></Button>
        </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start">
      <Avatar className="mt-1">
        <AvatarImage src={user.avatarUrl} />
        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={1}
          className="bg-card/50"
        />
        <AnimatePresence>
            {text.trim() && (
                 <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2"
                >
                    <Button type="submit" size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        {buttonText}
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </form>
  );
};

const Comment = ({ comment, onReply }: { comment: CommentType, onReply: (text: string, parentId: number) => void }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(likeCount + (!isLiked ? 1 : -1));
    }

    const handleReplySubmit = (text: string) => {
        onReply(text, comment.id);
        setIsReplying(false);
    }
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            className="flex gap-4"
        >
            <Avatar>
                <AvatarImage src={comment.author.avatarUrl} />
                <AvatarFallback>{comment.author.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <div className="p-4 rounded-lg glassmorphic">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-secondary">{comment.author.username}</p>
                        <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                    </div>
                    <p className="text-muted-foreground mt-1">{comment.text}</p>
                </div>
                 <div className="flex items-center gap-4 text-xs ml-4 mt-2">
                    <button onClick={handleLike} className={`flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors ${isLiked ? 'text-primary' : ''}`}>
                        <ThumbsUp className="w-3 h-3" /> {likeCount}
                    </button>
                    <button onClick={() => setIsReplying(!isReplying)} className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                        <MessageCircle className="w-3 h-3" /> Répondre
                    </button>
                </div>
                <AnimatePresence>
                {isReplying && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4"
                    >
                       <CommentForm placeholder={`Répondre à ${comment.author.username}...`} buttonText="Répondre" onSubmit={handleReplySubmit} />
                    </motion.div>
                )}
                </AnimatePresence>

                {comment.replies && comment.replies.length > 0 && (
                     <div className="mt-4 space-y-4 pl-8 border-l-2 border-primary/10">
                        {comment.replies.map(reply => (
                            <Comment key={reply.id} comment={reply} onReply={onReply} />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { user } = useAuth();
  const { slug } = React.use(params);
  const recipeData = getRecipeBySlug(slug);
  const [recipe, setRecipe] = useState(recipeData);

  if (!recipe) {
    notFound();
  }
  
  const handleCommentSubmit = (text: string) => {
      if (!user) return;
      const newComment: CommentType = {
          id: Date.now(),
          author: { id: user.id, username: user.username },
          avatarUrl: user.avatarUrl,
          text,
          timestamp: 'à l\'instant',
          likes: 0,
          replies: []
      };
      setRecipe(prev => prev ? {...prev, comments: [newComment, ...prev.comments]} : prev);
  }
  
  const handleReplySubmit = (text: string, parentId: number) => {
       if (!user) return;
      const newReply: CommentType = {
          id: Date.now(),
          author: { id: user.id, username: user.username },
          avatarUrl: user.avatarUrl,
          text,
          timestamp: 'à l\'instant',
          likes: 0,
          replies: []
      };

      const addReply = (comments: CommentType[]): CommentType[] => {
          return comments.map(c => {
              if (c.id === parentId) {
                  return {...c, replies: [newReply, ...(c.replies || [])]};
              }
              if (c.replies) {
                  return {...c, replies: addReply(c.replies)};
              }
              return c;
          });
      };
      
      setRecipe(prev => prev ? {...prev, comments: addReply(prev.comments)} : prev);
  }
  
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <ParallaxImage recipe={recipe} />

      <div className="container mx-auto -mt-24 relative z-20 px-4">
        <motion.div variants={itemVariants} className="p-8 rounded-xl glassmorphic grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
                <Clock className="w-8 h-8 text-primary"/>
                <span className="font-bold text-lg">60 min</span>
                <span className="text-sm text-muted-foreground">Temps</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Users className="w-8 h-8 text-primary"/>
                <span className="font-bold text-lg">4</span>
                <span className="text-sm text-muted-foreground">Personnes</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <ChefHat className="w-8 h-8 text-primary"/>
                <span className="font-bold text-lg">Facile</span>
                <span className="text-sm text-muted-foreground">Difficulté</span>
            </div>
             <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Heart className="w-6 h-6 text-destructive"/>
                        <span className="font-bold text-lg">{recipe.likes}</span>
                    </div>
                     <div className="flex items-center gap-1">
                        <MessageCircle className="w-6 h-6 text-secondary"/>
                        <span className="font-bold text-lg">{recipe.comments.length}</span>
                    </div>
                </div>
                 <span className="text-sm text-muted-foreground">Popularité</span>
            </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
          {/* Ingredients */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <h2 className="text-3xl font-headline font-bold text-primary mb-6">Ingrédients</h2>
            <div className="relative space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial={{ opacity: 0, x: -50, scale: 0.5, rotate: -10 }}
                  animate={i => ({
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    rotate: Math.random() * 8 - 4,
                    transition: { delay: i * 0.1, type: "spring", stiffness: 200, damping: 20 },
                  })}
                  whileHover={{ scale: 1.05, rotate: 0, zIndex: 10, boxShadow: "0px 5px 15px hsl(var(--primary)/0.1)" }}
                  className="p-4 rounded-lg glassmorphic flex justify-between items-center"
                >
                  <span className="font-medium">{ing.name}</span>
                  <span className="text-muted-foreground">{ing.quantity}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h2 className="text-3xl font-headline font-bold text-primary mb-6">Préparation</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-border -z-10" />
              {recipe.steps.map((step, i) => (
                 <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5 }}
                  className="relative pl-12 pb-8"
                >
                  <div className="absolute left-0 top-1.5 flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-bold">
                    {i + 1}
                  </div>
                  <p>{step}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <motion.div variants={itemVariants} className="mt-12 text-center">
             <Button size="lg" className="mr-4 rounded-full animate-pulse-glow">
                <Heart className="w-5 h-5 mr-2" /> Miam !
             </Button>
             <Button size="lg" variant="outline" className="rounded-full border-secondary text-secondary hover:bg-secondary/10 hover:text-secondary">
                 <MessageCircle className="w-5 h-5 mr-2" /> Laisser un commentaire
            </Button>
        </motion.div>

        {/* Comments */}
        <motion.div variants={itemVariants} className="mt-20">
          <h2 className="text-3xl font-headline font-bold text-primary mb-6">Commentaires ({recipe.comments.length})</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
             <CommentForm placeholder="Ajoutez votre grain de sel..." buttonText="Commenter" onSubmit={handleCommentSubmit} />
             <div className="pt-8 space-y-6">
                {recipe.comments.map((comment) => (
                    <Comment key={comment.id} comment={comment} onReply={handleReplySubmit} />
                ))}
             </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
