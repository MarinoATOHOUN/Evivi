"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Utensils, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../shared/ThemeToggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Separator } from '../ui/separator';

const navLinks = [
  { name: 'Recettes', href: '/recipes' },
  { name: 'Blog', href: '/blog' },
];

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const { user, logout } = useAuth();
  const router = useRouter();


  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  const MobileNav = () => (
    <Sheet>
        <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Ouvrir le menu</span>
            </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader className="text-left">
                <SheetTitle>
                    <Link href="/" className="flex items-center gap-2">
                        <Utensils className="h-6 w-6 text-primary" />
                        <span className="font-headline text-xl font-bold text-primary">Évivi</span>
                    </Link>
                </SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex flex-col h-full">
                <div className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                        <SheetClose asChild key={link.name}>
                            <Link href={link.href} className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                                {link.name}
                            </Link>
                        </SheetClose>
                    ))}
                </div>
                <Separator className="my-6" />
                {user ? (
                     <div className="flex flex-col gap-4">
                        <SheetClose asChild>
                            <Link href="/profile" className="flex items-center gap-3"><User className="mr-2 h-5 w-5" />Profil</Link>
                        </SheetClose>
                        <SheetClose asChild>
                            <Link href="/settings" className="flex items-center gap-3"><Settings className="mr-2 h-5 w-5" />Paramètres</Link>
                        </SheetClose>
                        <Separator className="my-2" />
                        <SheetClose asChild>
                            <Button variant="ghost" onClick={handleLogout} className="justify-start p-0 h-auto">
                                <LogOut className="mr-3 h-5 w-5" />
                                <span>Déconnexion</span>
                            </Button>
                        </SheetClose>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <SheetClose asChild>
                            <Button asChild variant="outline">
                                <Link href="/auth/login">Connexion</Link>
                            </Button>
                        </SheetClose>
                         <SheetClose asChild>
                            <Button asChild>
                                <Link href="/auth/register">S'inscrire</Link>
                            </Button>
                        </SheetClose>
                    </div>
                )}
                 <div className="mt-auto pb-8">
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Changer de thème</p>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </SheetContent>
    </Sheet>
  );

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 p-4"
    >
      <nav className="container mx-auto flex items-center justify-between p-4 rounded-full glassmorphic">
        <Link href="/" className="flex items-center gap-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold text-primary">Évivi</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {link.name}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/200/200`} alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile"><User className="mr-2 h-4 w-4" />Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings"><Settings className="mr-2 h-4 w-4" />Paramètres</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex rounded-full hover:bg-primary/10">
                <Link href="/auth/login">Connexion</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/auth/register">S'inscrire</Link>
              </Button>
            </>
          )}
        </div>
        <div className="md:hidden">
            <MobileNav />
        </div>
      </nav>
    </motion.header>
  );
}
