"use client";

import { motion } from 'framer-motion';

export default function TermsPage() {
  return (
    <div className="container mx-auto py-24 px-4 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-invert prose-lg max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">Conditions d'Utilisation</h1>
        <p className="lead">Dernière mise à jour : 25 octobre 2025</p>

        <p>Bienvenue sur Évivi ! Ces conditions d'utilisation régissent votre utilisation de notre site web et de nos services. En accédant ou en utilisant Évivi, vous acceptez d'être lié par ces conditions.</p>

        <h2>1. Utilisation de nos services</h2>
        <p>Vous devez utiliser nos services conformément à la loi et aux présentes conditions. Vous ne pouvez pas utiliser nos services de manière abusive, par exemple en interférant avec leur fonctionnement ou en tentant d'y accéder par une méthode autre que l'interface et les instructions que nous fournissons.</p>

        <h2>2. Votre contenu sur Évivi</h2>
        <p>Vous conservez tous les droits de propriété intellectuelle sur le contenu que vous soumettez (recettes, photos, articles, commentaires). En soumettant du contenu, vous accordez à Évivi une licence mondiale, non exclusive, libre de droits, pour utiliser, héberger, stocker, reproduire, modifier et distribuer ce contenu dans le but d'exploiter, de promouvoir et d'améliorer nos services.</p>
        <p>Vous garantissez que vous disposez de tous les droits nécessaires pour nous accorder cette licence pour tout le contenu que vous soumettez.</p>

        <h2>3. Conduite de l'utilisateur</h2>
        <p>Vous acceptez de ne pas publier de contenu :</p>
        <ul>
            <li>Qui est illégal, diffamatoire, obscène ou offensant.</li>
            <li>Qui enfreint les droits de propriété intellectuelle d'autrui.</li>
            <li>Qui contient des virus ou tout autre code informatique nuisible.</li>
        </ul>
        <p>Nous nous réservons le droit de supprimer tout contenu qui viole ces conditions sans préavis.</p>

        <h2>4. Modification et résiliation de nos services</h2>
        <p>Nous pouvons modifier ou interrompre nos services à tout moment. Nous pouvons également résilier ou suspendre votre accès à nos services si vous ne respectez pas nos conditions.</p>

        <h2>5. Limitation de responsabilité</h2>
        <p>Évivi est fourni "en l'état". Dans toute la mesure permise par la loi, nous déclinons toute garantie. Nous ne serons pas responsables des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs résultant de votre accès ou de votre utilisation de nos services.</p>

        <h2>6. Modifications des conditions</h2>
        <p>Nous pouvons modifier ces conditions à tout moment. Nous publierons les modifications sur cette page. En continuant à utiliser Évivi après la publication des modifications, vous acceptez les nouvelles conditions.</p>
      </motion.div>
    </div>
  );
}