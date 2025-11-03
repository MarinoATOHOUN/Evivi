"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const articleSchema = z.object({
  title: z.string().min(5, "Le titre doit faire au moins 5 caractères."),
  excerpt: z.string().min(20, "L'extrait doit faire au moins 20 caractères."),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

export default function CreateArticlePage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [contentError, setContentError] = useState('');

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      excerpt: '',
    },
  });
  
  useEffect(() => {
    if (content) {
        setContentError('');
    }
  }, [content]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(data: ArticleFormValues) {
    if (content.length < 100) {
        setContentError("Le contenu de l'article doit faire au moins 100 caractères.");
        return;
    }
    
    console.log({ ...data, content, image });
    toast({
      title: "Article soumis !",
      description: "Votre article a été envoyé pour validation. Merci !",
      variant: "default",
    });
    form.reset();
    setContent('');
    setImage(null);
  }

  return (
    <div className="container mx-auto py-24 px-4 min-h-screen">
       <style jsx global>{`
        .ql-toolbar {
          border-top-left-radius: var(--radius);
          border-top-right-radius: var(--radius);
          border-color: hsl(var(--border));
        }
        .ql-container {
          border-bottom-left-radius: var(--radius);
          border-bottom-right-radius: var(--radius);
          border-color: hsl(var(--border));
          min-height: 300px;
          font-size: 1rem;
        }
        .ql-editor {
          color: hsl(var(--foreground));
        }
        .ql-snow .ql-stroke {
          stroke: hsl(var(--muted-foreground));
        }
        .ql-snow .ql-picker-label {
          color: hsl(var(--muted-foreground));
        }
      `}</style>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-5xl md:text-6xl font-headline font-bold text-center">Écrire une <span className="text-gradient">Histoire</span></h1>
        <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">Partagez vos connaissances, vos histoires et vos inspirations culinaires avec la communauté.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12 max-w-4xl mx-auto p-8 rounded-xl glassmorphic"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField name="title" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Titre de l'article</FormLabel><FormControl><Input placeholder="Ex: L'art du thé à la menthe" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormField name="excerpt" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Extrait (description courte)</FormLabel><FormControl><Input placeholder="Un bref résumé qui donnera envie de lire votre article..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            {/* Image Uploader */}
            <div>
              <FormLabel>Image de l'article</FormLabel>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence>
                  {image && (
                    <motion.div layout initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="relative aspect-video">
                      <img src={image} alt="upload preview" className="rounded-lg object-cover w-full h-full" />
                      <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setImage(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!image && (
                  <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="mt-2 text-sm text-muted-foreground">Télécharger une image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            {/* Content */}
             <FormItem>
                <FormLabel>Contenu de l'article</FormLabel>
                   <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      placeholder="Écrivez votre histoire ici..."
                    />
                {contentError && <p className="text-sm font-medium text-destructive">{contentError}</p>}
            </FormItem>


            <Button type="submit" size="lg" className="w-full animate-pulse-glow">Soumettre l'article</Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
