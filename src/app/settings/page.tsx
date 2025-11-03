"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Bell, Palette, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import AuthGuard from '@/components/shared/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

const profileSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit faire au moins 3 caractères."),
  bio: z.string().max(255, "La biographie ne doit pas dépasser 255 caractères.").optional(),
});

const accountSchema = z.object({
    email: z.string().email("Adresse email invalide."),
});

function SettingsPageContent() {
  const { toast } = useToast();
  const { user, refetchUser } = useAuth();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: '', bio: '' },
  });
  
  const accountForm = useForm<z.infer<typeof accountSchema>>({
      resolver: zodResolver(accountSchema),
      defaultValues: { email: ''},
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username,
        bio: user.bio || '',
      });
      accountForm.reset({
        email: user.email,
      });
    }
  }, [user, profileForm, accountForm]);

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsSubmittingProfile(true);
    // Mock submission
    setTimeout(() => {
        toast({ title: 'Profil mis à jour avec succès !' });
        // In a real app, you would refetch the user data here.
        // refetchUser();
        setIsSubmittingProfile(false);
    }, 1000);
  };
  
  const onAccountSubmit = async (data: z.infer<typeof accountSchema>) => {
    setIsSubmittingAccount(true);
    // Mock submission
    setTimeout(() => {
        toast({ title: 'Adresse e-mail mise à jour !' });
        // refetchUser();
        setIsSubmittingAccount(false);
    }, 1000);
  };
  
  if (!user) return null;

  return (
    <div className="container mx-auto py-32 px-4 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-5xl md:text-6xl font-headline font-bold text-center">Paramètres</h1>
        <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">Gérez les informations de votre compte, votre profil et vos préférences.</p>
      </motion.div>

      <Tabs defaultValue="profile" className="mt-12 max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profil</TabsTrigger>
          <TabsTrigger value="account"><Lock className="w-4 h-4 mr-2" />Compte</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="w-4 h-4 mr-2" />Apparence</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Profil public</CardTitle>
              <CardDescription>Ces informations seront affichées publiquement sur votre profil.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <Button type="button" variant="outline"><Upload className="w-4 h-4 mr-2"/>Changer d'avatar</Button>
                    </div>
                  </FormItem>
                  <FormField name="username" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>Nom d'utilisateur</FormLabel><FormControl><Input placeholder="Votre nom" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="bio" control={profileForm.control} render={({ field }) => (
                    <FormItem><FormLabel>Biographie</FormLabel><FormControl><Textarea placeholder="Parlez-nous un peu de vous..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" disabled={isSubmittingProfile}>
                    {isSubmittingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
            <Card className="glassmorphic">
                <CardHeader>
                    <CardTitle>Informations du compte</CardTitle>
                    <CardDescription>Gérez votre adresse e-mail.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Form {...accountForm}>
                        <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-8">
                            <FormField name="email" control={accountForm.control} render={({ field }) => (
                                <FormItem><FormLabel>Adresse e-mail</FormLabel><FormControl><Input type="email" placeholder="votre@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="submit" disabled={isSubmittingAccount}>
                                {isSubmittingAccount ? "Mise à jour..." : "Mettre à jour l'e-mail"}
                            </Button>
                        </form>
                   </Form>
                   <div className="mt-8 border-t pt-8">
                        <CardTitle className="text-lg">Changer de mot de passe</CardTitle>
                        <CardDescription className="mb-4">Non implémenté dans cette version.</CardDescription>
                        <div className="space-y-4">
                            <Input type="password" placeholder="Mot de passe actuel" disabled />
                            <Input type="password" placeholder="Nouveau mot de passe" disabled />
                        </div>
                   </div>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
           <Card className="glassmorphic">
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Choisissez comment vous souhaitez être notifié.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <Label>Nouveaux "Miam"</Label>
                            <p className="text-sm text-muted-foreground">Quand quelqu'un aime une de vos recettes.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                     <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                           <Label>Nouveaux commentaires</Label>
                            <p className="text-sm text-muted-foreground">Quand quelqu'un commente une de vos recettes.</p>
                        </div>
                        <Switch defaultChecked/>
                    </div>
                     <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <Label>Réponses à vos commentaires</Label>
                            <p className="text-sm text-muted-foreground">Quand quelqu'un répond à un de vos commentaires.</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="appearance">
           <Card className="glassmorphic">
                <CardHeader>
                    <CardTitle>Apparence</CardTitle>
                    <CardDescription>Personnalisez l'apparence de l'application.</CardDescription>
                </Header>
                <CardContent className="space-y-6">
                   <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <Label>Thème</Label>
                            <p className="text-sm text-muted-foreground">Choisissez entre le thème clair et le thème sombre.</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
    return (
        <AuthGuard>
            <SettingsPageContent />
        </AuthGuard>
    )
}
