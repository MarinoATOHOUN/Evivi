"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const pageVariants = {
  initial: {
    opacity: 0,
    clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
  },
  in: {
    opacity: 1,
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
  },
  out: {
    opacity: 0,
    clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.75,
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
