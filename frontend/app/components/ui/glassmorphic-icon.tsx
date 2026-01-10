import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface GlassmorphicIconProps {
  icon: LucideIcon;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GlassmorphicIcon({ 
  icon: Icon, 
  color = '#A81B1B', 
  size = 'md',
  className = ''
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
      style={{
        willChange: 'transform',
        boxShadow: `0 0 0 0 ${color}00`,
      }}
    >
      {/* Inner Glow */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        style={{ 
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
          filter: 'blur(8px)'
        }}
      />
      
      {/* SVG Icon */}
      <Icon 
        size={iconSizes[size]} 
        className="relative z-10 transition-all duration-500"
        style={{ 
          color: color,
          filter: 'drop-shadow(0 0 8px transparent)',
          willChange: 'transform, filter'
        }}
      />
    </div>
  );
}
