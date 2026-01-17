import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface GlassmorphicIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: 'spin' | 'none';
}

export function GlassmorphicIcon({ 
  icon: Icon, 
  size = 'md',
  className = '',
  animate = 'none'
}: GlassmorphicIconProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 40
  };

  const animateClass = animate === 'spin' ? 'icon-glass-spin' : '';

  return (
    <div 
      className={`
        relative rounded-2xl
        bg-white/5 backdrop-blur-md
        border border-white/10
        flex items-center justify-center
        transition-all duration-500 ease-out
        group-hover:bg-white/10 group-hover:border-white/20
        group-hover:scale-110 group-hover:shadow-lg
        ${sizeClasses[size]}
        ${className}
      `}
      style={{ willChange: 'transform' }}
    >
      {/* Inner Glow */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{ 
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)',
          filter: 'blur(8px)'
        }}
      />
      
      {/* SVG Icon - Always white, animated */}
      <Icon 
        size={iconSizes[size]} 
        className={`relative z-10 icon-glass ${animateClass}`}
      />
    </div>
  );
}
