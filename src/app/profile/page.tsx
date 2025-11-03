"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getRecipes, Recipe } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, BookHeart, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/shared/AuthGuard';

const userStats = {
    recipesCount: 3,
    likesReceived: 412,
    commentsReceived: 42,
};

function ProfilePageContent() {
    const { user } = useAuth();
    const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
    
    useEffect(() => {
        // TODO: Replace with API call to fetch recipes by user
        setMyRecipes(getRecipes().slice(0, 3));
    }, []);

    if (!user) return null;

    return (
        <div className="min-h-screen pt-32">
            <div className="relative h-[50vh] flex items-center justify-center">
                <div className="absolute inset-0 overflow-hidden z-0">
                    <Image src="https://picsum.photos/seed/profile-bg/1920/1080" alt="Profile background" fill className="object-cover opacity-20" data-ai-hint="abstract texture" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
                </div>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative text-center px-4"
                >
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="relative w-32 h-32 md:w-40 md:h-40 mx-auto"
                    >
                        <Avatar className="w-full h-full border-4 border-primary shadow-lg shadow-primary/20">
                            <AvatarImage src={user.avatarUrl} alt={user.username} data-ai-hint="user avatar" />
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-50"/>
                    </motion.div>
                    <h1 className="mt-6 text-4xl md:text-5xl font-headline font-bold text-primary">{user.username}</h1>
                    <p className="mt-2 text-muted-foreground max-w-lg mx-auto">{user.bio || "Aucune biographie."}</p>
                    <Button size="sm" variant="outline" className="mt-4 rounded-full" asChild>
                        <Link href="/settings">
                            <Edit className="w-4 h-4 mr-2" /> Modifier le profil
                        </Link>
                    </Button>
                </motion.div>
            </div>
            
            <div className="container mx-auto -mt-16 relative z-10 px-4 pb-24">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="p-6 rounded-xl glassmorphic grid grid-cols-1 md:grid-cols-3 gap-4 text-center"
                >
                    <div className="flex flex-col items-center gap-2">
                        <BookHeart className="w-8 h-8 text-primary"/>
                        <span className="font-bold text-2xl">{userStats.recipesCount}</span>
                        <span className="text-sm text-muted-foreground">Recettes publiées</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                        <span className="font-bold text-2xl">{userStats.likesReceived}</span>
                        <span className="text-sm text-muted-foreground">"Miam" reçus</span>
                    </div>
                     <div className="flex flex-col items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-primary"/>
                        <span className="font-bold text-2xl">{userStats.commentsReceived}</span>
                        <span className="text-sm text-muted-foreground">Commentaires</span>
                    </div>
                </motion.div>

                <div className="mt-16">
                    <h2 className="text-3xl font-headline font-bold mb-8">Mes Recettes</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {myRecipes.map((recipe, index) => (
                           <motion.div
                            key={recipe.slug}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                           >
                            <Link href={`/recipes/${recipe.slug}`}>
                                <Card className="overflow-hidden group glassmorphic h-full">
                                    <div className="relative h-48">
                                        <Image
                                        src={recipe.imageUrl}
                                        alt={recipe.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        data-ai-hint={recipe.imageHint}
                                        />
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-headline text-lg font-bold text-primary">{recipe.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{recipe.description}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                           </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <AuthGuard>
            <ProfilePageContent />
        </AuthGuard>
    );
}
