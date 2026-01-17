import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

// ============================================
// BENTO TILE WITH HOVER GLOW
// ============================================
interface BentoTileProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glowColor?: string;
  index?: number;
}

export function BentoTileMotion({ 
  children, 
  className = '', 
  size = 'md',
  glowColor = 'rgba(168, 27, 27, 0.4)',
  index = 0
}: BentoTileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);
  const isInView = useInView(tileRef, { once: true, margin: "-50px" });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!tileRef.current) return;
      const rect = tileRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    });
  }, []);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const sizeClasses = {
    sm: 'col-span-1 row-span-1',
    md: 'col-span-1 row-span-1',
    lg: 'col-span-1 md:col-span-2 row-span-1',
    xl: 'col-span-1 md:col-span-2 row-span-2'
  };

  return (
    <motion.div
      ref={tileRef}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden rounded-3xl
        deep-glass-noise
        transition-all duration-500 ease-out
        hover:-translate-y-1
        min-h-[280px]
        ${sizeClasses[size]}
        ${className}
      `}
      style={{ contain: 'layout paint' }}
    >
      <div className="relative z-10 h-full p-6 md:p-8">{children}</div>
    </motion.div>
  );
}
// ============================================
// ANIMATED ICON WRAPPER
// ============================================
import { LayoutGrid, Zap, Shield, Users, BarChart3, Lock, Settings } from 'lucide-react';
import { AnimatedIcon } from './animated-icon';

interface AnimatedIconWrapperProps {
  iconType: 'layout' | 'zap' | 'shield' | 'users' | 'chart' | 'lock' | 'gear';
  className?: string;
}

export function AnimatedIconWrapper({ iconType, className = '' }: AnimatedIconWrapperProps) {
  const iconConfig = {
    layout: { icon: LayoutGrid, animation: 'pulse' as const },
    zap: { icon: Zap, animation: 'bounce' as const },
    shield: { icon: Shield, animation: 'pulse' as const },
    users: { icon: Users, animation: 'bounce' as const },
    chart: { icon: BarChart3, animation: 'bounce' as const },
    lock: { icon: Lock, animation: 'shake' as const },
    gear: { icon: Settings, animation: 'rotate' as const },
  };

  const config = iconConfig[iconType];

  return (
    <div 
      className={`
        w-14 h-14 rounded-2xl deep-glass-sm
        flex items-center justify-center
        ${className}
      `}
    >
      <AnimatedIcon 
        icon={config.icon} 
        size={28} 
        animation={config.animation}
      />
    </div>
  );
}

// ============================================
// FEATURES BENTO GRID
// ============================================
interface FeatureItem {
  title: string;
  description: string;
  iconType: 'layout' | 'zap' | 'shield' | 'users' | 'chart' | 'lock' | 'gear';
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface FeaturesBentoProps {
  features: FeatureItem[];
  className?: string;
}

export function FeaturesBentoGrid({ features, className = '' }: FeaturesBentoProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 ${className}`}>
      {features.map((feature, index) => (
        <BentoTileMotion 
          key={index}
          index={index}
          size={feature.size || 'md'}
          glowColor={`${feature.color}60`}
        >
          <div className="flex flex-col h-full group">
            <AnimatedIconWrapper 
              iconType={feature.iconType}
              className="mb-6"
            />
            <h3 className="text-xl md:text-2xl font-bold mb-3 tracking-tight text-glass-heading">
              {feature.title}
            </h3>
            <p className="text-base leading-relaxed text-glass-secondary">
              {feature.description}
            </p>
          </div>
        </BentoTileMotion>
      ))}
    </div>
  );
}

// ============================================
// TESTIMONIALS CAROUSEL WITH SLIDING ANIMATION
// ============================================
interface TestimonialItem {
  name: string;
  role: string;
  expertise: string;
  text: string;
  color: string;
}

interface Testimonials3DProps {
  testimonials: TestimonialItem[];
  className?: string;
}

export function Testimonials3DCarousel({ testimonials, className = '' }: Testimonials3DProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  const totalItems = testimonials.length;
  const visibleCount = 3;
  
  // Get the 3 visible card indices with wrapping
  const getVisibleIndices = () => {
    const indices = [];
    for (let i = 0; i < visibleCount; i++) {
      let index = (currentIndex + i) % totalItems;
      indices.push(index);
    }
    return indices;
  };
  
  const visibleIndices = getVisibleIndices();
  
  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Main Container with arrows and cards */}
      <div className="flex items-center gap-4 md:gap-8">
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full btn-glass-morph flex items-center justify-center group transition-all duration-300 hover:scale-110"
          aria-label="Previous testimonial"
        >
          <svg 
            className="w-5 h-5 md:w-6 md:h-6 text-white/80 group-hover:text-white transition-colors" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Cards Container */}
        <div 
          className="flex-1 overflow-hidden py-4"
          style={{ perspective: '1200px' }}
        >
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
              key={currentIndex}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? '100%' : '-100%',
                  opacity: 0,
                }),
                center: {
                  x: 0,
                  opacity: 1,
                },
                exit: (dir: number) => ({
                  x: dir > 0 ? '-100%' : '100%',
                  opacity: 0,
                }),
              }}
              transition={{
                x: { type: 'tween', duration: 0.5, ease: [0.32, 0.72, 0, 1] },
                opacity: { duration: 0.3 },
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {visibleIndices.map((testimonialIndex, i) => {
                const testimonial = testimonials[testimonialIndex];
                
                return (
                  <motion.div
                    key={testimonialIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4,
                      delay: i * 0.1,
                      ease: 'easeOut'
                    }}
                  >
                    <TestimonialCard testimonial={testimonial} />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full btn-glass-morph flex items-center justify-center group transition-all duration-300 hover:scale-110"
          aria-label="Next testimonial"
        >
          <svg 
            className="w-5 h-5 md:w-6 md:h-6 text-white/80 group-hover:text-white transition-colors" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white/80 w-6' 
                : 'bg-white/20 hover:bg-white/40 w-2'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

interface TestimonialCardProps {
  testimonial: TestimonialItem;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="rounded-2xl p-5 md:p-6 deep-glass transition-all duration-300 h-full hover:-translate-y-1 hover:shadow-xl">
      {/* Verified Expertise Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full deep-glass-sm w-fit mb-4">
        <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium text-glass-secondary">{testimonial.expertise}</span>
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className="w-4 h-4 text-amber-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p className="text-sm md:text-base font-light italic leading-relaxed mb-5 text-glass-secondary min-h-[70px]">
        "{testimonial.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 mt-auto">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black text-sm"
          style={{ backgroundColor: testimonial.color }}
        >
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-glass-primary text-sm">{testimonial.name}</h4>
          <p className="text-xs uppercase tracking-wider text-glass-muted">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

