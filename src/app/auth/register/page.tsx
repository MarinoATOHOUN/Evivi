"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const registerSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit faire au moins 3 caractères."),
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { toast } = useToast();
    const { register } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '' },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    try {
        await register(data.username, data.email, data.password);
        toast({
            title: "Inscription réussie !",
            description: "Bienvenue sur Évivi. Vous pouvez maintenant vous connecter.",
        });
        router.push('/auth/login');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: "Erreur d'inscription",
            description: "Impossible de créer le compte. Veuillez réessayer.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-md glassmorphic">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mx-auto bg-primary/20 p-4 rounded-full w-fit"
            >
              <UserPlus className="h-8 w-8 text-primary" />
            </motion.div>
            <CardTitle className="font-headline text-3xl text-primary mt-4">Créer un compte</CardTitle>
            <CardDescription>Rejoignez la communauté et commencez votre voyage culinaire.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField name="username" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl><Input placeholder="Votre nom d'artiste culinaire" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="email" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="votreadresse@email.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="password" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl><Input type="password" placeholder="Au moins 8 caractères" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  { isLoading ? "Inscription..." : "S'inscrire" }
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="font-semibold text-secondary hover:underline">
                Connectez-vous
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
