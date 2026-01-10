import React, { useRef, useCallback, useEffect, useState } from 'react';

interface BentoTileProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glowColor?: string;
}

export function BentoTile({ 
  children, 
  className = '', 
  size = 'md',
  glowColor = 'rgba(139, 10, 26, 0.4)' // Default to Starboy crimson
}: BentoTileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const rafRef = useRef<number>();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      if (!tileRef.current) return;
      const rect = tileRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const sizeClasses = {
    sm: 'col-span-1 row-span-1',
    md: 'col-span-1 row-span-1 md:col-span-1',
    lg: 'col-span-1 row-span-1 md:col-span-2',
    xl: 'col-span-1 row-span-2 md:col-span-2 md:row-span-2'
  };

  return (
    <div
      ref={tileRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative overflow-hidden rounded-3xl
        bg-white/[0.03] backdrop-blur-xl
        border border-white/10
        transition-all duration-500 ease-out
        hover:border-white/20 hover:bg-white/[0.06]
        hover:shadow-2xl hover:-translate-y-1
        min-h-[280px]
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        contain: 'layout paint',
        ['--glow-x' as string]: `${mousePos.x}px`,
        ['--glow-y' as string]: `${mousePos.y}px`,
        ['--glow-color' as string]: glowColor,
        ['--glow-opacity' as string]: isHovered ? '1' : '0',
      }}
    >
      {/* Reactive Glow Effect */}
      <div 
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          left: 'var(--glow-x)',
          top: 'var(--glow-y)',
          width: '400px',
          height: '400px',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, var(--glow-color) 0%, transparent 70%)`,
          opacity: 'var(--glow-opacity)',
          filter: 'blur(40px)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
