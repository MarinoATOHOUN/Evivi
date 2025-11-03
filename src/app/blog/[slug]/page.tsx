"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { getArticleBySlug } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Calendar, User, ChevronsRight } from 'lucide-react';
import React from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <div className="relative h-[60vh]">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover"
          priority
          data-ai-hint={article.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 p-8 container mx-auto">
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-headline font-bold text-primary">
            {article.title}
          </motion.h1>
          <motion.div variants={itemVariants} className="flex items-center gap-6 text-sm text-white/80 mt-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{article.date}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl py-16 px-4">
        <motion.div variants={itemVariants} className="prose prose-invert prose-lg max-w-none prose-headings:font-headline prose-headings:text-primary prose-a:text-secondary prose-blockquote:border-secondary prose-blockquote:text-secondary/80">
          <p className="lead text-xl text-muted-foreground">{article.excerpt}</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.</p>
          
          <blockquote>
            La cuisine est un art ; tout art est patience.
          </blockquote>
          
          <h2>Un Voyage Sensoriel</h2>
          <p>Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales.</p>
          
          <div className="relative aspect-video my-8 rounded-lg overflow-hidden">
            <Image src="https://picsum.photos/seed/sub-article/1200/675" alt="Detail image" fill className="object-cover" data-ai-hint="cooking process"/>
          </div>

          <h2>Plus qu'une Recette</h2>
          <p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam. Proin magns. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem.</p>
          <ul>
            <li><ChevronsRight className="inline w-5 h-5 mr-2 text-primary" />Tradition et innovation se rencontrent.</li>
            <li><ChevronsRight className="inline w-5 h-5 mr-2 text-primary" />Des saveurs qui racontent une histoire.</li>
            <li><ChevronsRight className="inline w-5 h-5 mr-2 text-primary" />Un héritage à partager avec le monde.</li>
          </ul>
          <p>Praesent quis lectus vestibulum augue po. Nam sed magna reet. Fusce eget urna. Ut tellus arcu, sodales quis, semper vel, porta non, ante. Pellentesque sapien. In egestas, velit vitae tincidunt sodales, dui massa molestie purus, quis ultricies odio magna ac lacus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam feugiat, turpis vitae aliquam pre, est leo commodo, eget blandit magna neque.</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
