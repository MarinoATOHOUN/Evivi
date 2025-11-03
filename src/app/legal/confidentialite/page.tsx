"use client";

import { motion } from 'framer-motion';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-24 px-4 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-invert prose-lg max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">Politique de Confidentialité</h1>
        <p className="lead">Dernière mise à jour : 25 octobre 2025</p>
        
        <p>Chez Évivi, nous respectons votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre plateforme.</p>

        <h2>1. Informations que nous collectons</h2>
        <p>Nous pouvons collecter des informations vous concernant de différentes manières :</p>
        <ul>
            <li><strong>Informations que vous nous fournissez :</strong> Cela inclut les informations que vous saisissez lors de votre inscription (nom, email), la création de votre profil, et la publication de contenu (recettes, articles, commentaires).</li>
            <li><strong>Données d'utilisation :</strong> Nous collectons automatiquement des informations lorsque vous accédez et utilisez le site, telles que votre adresse IP, votre type de navigateur, les pages que vous visitez et le temps passé sur ces pages.</li>
        </ul>

        <h2>2. Comment nous utilisons vos informations</h2>
        <p>Nous utilisons les informations collectées pour :</p>
        <ul>
            <li>Fournir, maintenir et améliorer nos services.</li>
            <li>Personnaliser votre expérience sur la plateforme.</li>
            <li>Communiquer avec vous, y compris pour vous envoyer des notifications ou des newsletters si vous y avez consenti.</li>
            <li>Protéger la sécurité de notre plateforme et de nos utilisateurs.</li>
        </ul>

        <h2>3. Partage de vos informations</h2>
        <p>Nous ne partageons pas vos informations personnelles avec des tiers, sauf dans les cas suivants :</p>
        <ul>
            <li>Avec votre consentement explicite.</li>
            <li>Pour nous conformer à une obligation légale.</li>
            <li>Pour protéger nos droits, notre vie privée, notre sécurité ou nos biens, ainsi que ceux de nos utilisateurs ou du public.</li>
            <li>Avec des fournisseurs de services tiers qui travaillent en notre nom et qui ont accepté des obligations de confidentialité.</li>
        </ul>
        <p>Votre nom d'utilisateur et le contenu que vous publiez sont publics et visibles par tous les utilisateurs d'Évivi.</p>

        <h2>4. Sécurité de vos informations</h2>
        <p>Nous utilisons des mesures de sécurité administratives, techniques et physiques pour protéger vos informations personnelles. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est sécurisée à 100 %, et nous ne pouvons garantir une sécurité absolue.</p>
        
        <h2>5. Vos droits</h2>
        <p>Selon votre lieu de résidence, vous pouvez avoir le droit d'accéder, de corriger ou de supprimer vos informations personnelles. Vous pouvez gérer les informations de votre profil directement depuis vos paramètres de compte. Pour toute autre demande, veuillez nous contacter.</p>
        
        <h2>6. Cookies</h2>
        <p>Nous utilisons des cookies et des technologies similaires pour faire fonctionner notre site et analyser son utilisation. Vous pouvez contrôler l'utilisation des cookies au niveau de votre navigateur.</p>

        <h2>7. Modifications de cette politique</h2>
        <p>Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle politique sur cette page. Nous vous conseillons de consulter cette page périodiquement pour tout changement.</p>
        
        <h2>8. Nous contacter</h2>
        <p>Si vous avez des questions concernant cette politique de confidentialité, vous pouvez nous contacter à l'adresse suivante : [contact-fictif@evivi.com].</p>
      </motion.div>
    </div>
  );
}