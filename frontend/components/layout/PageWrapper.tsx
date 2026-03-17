
import React from 'react';
import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  withPadding?: boolean;
  maxWidthClass?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ 
  children, 
  className = '', 
  withPadding = true,
  maxWidthClass = 'max-w-md'
}) => {
  return (
    <motion.main 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`min-h-screen pb-24 ${withPadding ? 'px-4 pt-4' : ''} ${className}`}
    >
      <div className={`${maxWidthClass} mx-auto w-full`}>
        {children}
      </div>
    </motion.main>
  );
};

export default PageWrapper;
