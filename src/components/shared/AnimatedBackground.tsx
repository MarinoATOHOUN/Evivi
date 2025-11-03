"use client";

import { motion } from 'framer-motion';

const AfricanPattern = () => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="pattern-cubes" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="scale(1) rotate(0)">
                <g >
                    <path d="M20 10L0 20v40l20 10 20-10V20L20 10z M0 20l20 10 20-10" fill="none" stroke="hsl(var(--primary))" strokeOpacity="0.1" strokeWidth="1"/>
                    <path d="M40 20l20 10v40l-20 10-20-10V30l20-10z M20 70l20-10" fill="none" stroke="hsl(var(--primary))" strokeOpacity="0.1" strokeWidth="1"/>
                </g>
            </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-cubes)"></rect>
    </svg>
);


export default function AnimatedBackground() {
  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-full z-[-1]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <motion.div
        className="w-[200%] h-[200%]"
        animate={{
          x: ['0%', '-50%'],
          y: ['0%', '-50%'],
        }}
        transition={{
          duration: 120,
          ease: "linear",
          repeat: Infinity,
          repeatType: "mirror"
        }}
      >
        <AfricanPattern />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
    </motion.div>
  );
}
