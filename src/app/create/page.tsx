"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, PlusCircle, Image as ImageIcon, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const recipeSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères."),
  description: z.string().min(10, "La description doit faire au moins 10 caractères."),
  category: z.string().min(1, "Veuillez sélectionner une catégorie."),
  country: z.string().min(2, "Le pays doit faire au moins 2 caractères."),
  ingredients: z.array(z.object({ name: z.string().min(1), quantity: z.string().min(1) })).min(1, "Ajoutez au moins un ingrédient."),
  steps: z.array(z.object({ value: z.string().min(5) })).min(1, "Ajoutez au moins une étape."),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

export default function CreateRecipePage() {
  const { toast } = useToast();
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: '',
      description: '',
      ingredients: [],
      steps: [{ value: '' }],
    },
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });
  
  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  const handleAddIngredient = () => {
    if (ingredientName && ingredientQuantity) {
      appendIngredient({ name: ingredientName, quantity: ingredientQuantity });
      setIngredientName('');
      setIngredientQuantity('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && images.length < 3) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([...images, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(data: RecipeFormValues) {
    console.log(data);
    toast({
      title: "Recette soumise !",
      description: "Votre recette a été envoyée pour validation. Merci !",
      variant: "default",
    });
    form.reset();
    setImages([]);
  }

  return (
    <div className="container mx-auto py-24 px-4 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-5xl md:text-6xl font-headline font-bold text-center">Créez votre <span className="text-gradient">Chef-d'œuvre</span></h1>
        <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">Partagez votre recette avec la communauté Évivi. Remplissez les champs ci-dessous pour commencer.</p>
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
              <FormItem><FormLabel>Titre de la recette</FormLabel><FormControl><Input placeholder="Ex: Thieboudienne Royal" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Décrivez votre plat, son histoire, ses saveurs..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField name="category" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez une région" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Afrique de l’Ouest">Afrique de l’Ouest</SelectItem>
                            <SelectItem value="Afrique du Nord">Afrique du Nord</SelectItem>
                            <SelectItem value="Afrique Centrale">Afrique Centrale</SelectItem>
                            <SelectItem value="Afrique de l'Est">Afrique de l'Est</SelectItem>
                            <SelectItem value="Afrique du Sud">Afrique du Sud</SelectItem>
                        </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField name="country" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Pays d'origine</FormLabel><FormControl><Input placeholder="Ex: Sénégal" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

            {/* Image Uploader */}
            <div>
              <FormLabel>Images (3 max)</FormLabel>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence>
                  {images.map((src, index) => (
                    <motion.div key={index} layout initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="relative aspect-square">
                      <img src={src} alt={`upload preview ${index}`} className="rounded-lg object-cover w-full h-full" />
                      <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setImages(images.filter((_, i) => i !== index))}>
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {images.length < 3 && (
                  <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="mt-2 text-sm text-muted-foreground">Télécharger</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <FormLabel>Ingrédients</FormLabel>
              <div className="flex gap-2 mt-2">
                <Input placeholder="Nom de l'ingrédient" value={ingredientName} onChange={(e) => setIngredientName(e.target.value)} />
                <Input placeholder="Quantité" className="w-1/3" value={ingredientQuantity} onChange={(e) => setIngredientQuantity(e.target.value)} />
                <Button type="button" onClick={handleAddIngredient}><PlusCircle className="h-4 w-4" /></Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <AnimatePresence>
                {ingredientFields.map((field, index) => (
                    <motion.div key={field.id} layout initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                        <span>{field.quantity} {field.name}</span>
                        <button type="button" onClick={() => removeIngredient(index)}><X className="h-4 w-4 hover:text-destructive" /></button>
                    </motion.div>
                ))}
                </AnimatePresence>
              </div>
              <FormMessage>{form.formState.errors.ingredients?.message}</FormMessage>
            </div>

            {/* Steps */}
            <div>
                <FormLabel>Étapes de préparation</FormLabel>
                <div className="space-y-4 mt-2">
                    {stepFields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2">
                            <span className="mt-2 font-bold text-primary">{index + 1}.</span>
                            <FormField name={`steps.${index}.value`} control={form.control} render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <FormControl><Textarea placeholder={`Étape ${index + 1}`} {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeStep(index)} disabled={stepFields.length <= 1}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendStep({ value: '' })}>Ajouter une étape</Button>
                 <FormMessage>{form.formState.errors.steps?.message}</FormMessage>
            </div>

            <Button type="submit" size="lg" className="w-full animate-pulse-glow">Soumettre ma recette</Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
