
import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  delay = 0,
  hoverEffect = true 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay,
        ease: [0.23, 1, 0.32, 1] // Cubic bezier for premium feel
      }}
      className={twMerge(
        "glass-panel rounded-2xl p-6 relative overflow-hidden group",
        hoverEffect && "glass-card-hover",
        className
      )}
    >
      {/* Light sheen effect on hover */}
      {hoverEffect && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
      )}
      {children}
    </motion.div>
  );
};

export default GlassCard;
