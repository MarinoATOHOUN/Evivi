"use client";

import { motion } from 'framer-motion';

export default function LegalNoticePage() {
  return (
    <div className="container mx-auto py-24 px-4 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-invert prose-lg max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">Mentions Légales</h1>
        <p className="lead">Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique.</p>

        <h2>Éditeur du site</h2>
        <p>
          Le site Évivi est édité par la société Hypee, une société conceptuelle dédiée à la création de plateformes numériques africaines.
        </p>
        <ul>
          <li><strong>Siège social :</strong> [Adresse fictive, 123 Rue de l'Innovation, 75001 Paris, France]</li>
          <li><strong>Contact :</strong> contact@hypee.example.com</li>
        </ul>

        <h2>Directeur de la publication</h2>
        <p>
          Le directeur de la publication est [Nom du directeur fictif], en sa qualité de CEO de Hypee.
        </p>

        <h2>Hébergement</h2>
        <p>
          Le site Évivi est hébergé par Firebase Hosting, un service de Google.
        </p>
        <ul>
          <li><strong>Hébergeur :</strong> Google LLC</li>
          <li><strong>Adresse :</strong> 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA</li>
        </ul>
        
        <h2>Propriété intellectuelle</h2>
        <p>
          La structure générale du site Évivi, ainsi que les textes, graphiques, images, sons et vidéos la composant, sont la propriété de Hypee ou de ses partenaires. Toute représentation et/ou reproduction et/ou exploitation partielle ou totale de ce site, par quelque procédé que ce soit, sans l'autorisation préalable et par écrit de Hypee ou de ses partenaires est strictement interdite et serait susceptible de constituer une contrefaçon au sens des articles L 335-2 et suivants du Code de la propriété intellectuelle.
        </p>
        <p>
          Le contenu soumis par les utilisateurs (recettes, articles, etc.) reste la propriété de leurs auteurs respectifs, sous réserve de la licence d'utilisation accordée à Évivi comme défini dans les <a href="/legal/conditions-utilisation">Conditions d'utilisation</a>.
        </p>

        <h2>Données personnelles</h2>
        <p>
          La collecte et le traitement de vos données personnelles sont régis par notre <a href="/legal/confidentialite">Politique de Confidentialité</a>.
        </p>
      </motion.div>
    </div>
  );
}