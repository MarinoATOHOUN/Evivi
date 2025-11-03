"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-card py-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-repeat bg-center opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'slide 40s linear infinite',
        }} />
        <style jsx>{`
            @keyframes slide {
                0% { background-position: 0 0; }
                100% { background-position: -240px -240px; }
            }
        `}</style>
      <div className="container mx-auto text-center relative">
        <div className="relative inline-block mb-4">
          <p className="font-headline text-2xl font-bold text-primary">Évivi</p>
        </div>
        <div className="flex justify-center gap-6 mb-8">
            <p className="text-sm text-muted-foreground">
                Un projet de <Link href="#" className="font-bold text-secondary hover:underline">Hypee</Link>
            </p>
        </div>
        <p className="text-muted-foreground/80 max-w-2xl mx-auto text-sm">
            Hypee construit les réseaux sociaux africains de demain : des espaces numériques qui célèbrent nos cultures, amplifient nos voix et créent de la valeur pour nos créateurs.
        </p>
        <div className="flex justify-center gap-4 md:gap-6 mt-8">
          <Link href="/legal/confidentialite" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Confidentialité
          </Link>
          <span className="text-xs text-muted-foreground">|</span>
          <Link href="/legal/conditions-utilisation" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Conditions d'utilisation
          </Link>
          <span className="text-xs text-muted-foreground">|</span>
          <Link href="/legal/mentions-legales" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Mentions légales
          </Link>
        </div>
         <p className="text-xs text-muted-foreground/50 mt-8">
          &copy; {new Date().getFullYear()} Évivi. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}