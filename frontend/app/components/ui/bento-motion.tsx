import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  AnimatedLayoutIcon, 
  AnimatedZapIcon, 
  AnimatedShieldIcon, 
  AnimatedUsersIcon, 
  AnimatedChartIcon, 
  AnimatedLockIcon 
} from './animated-icons';

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
      {/* Hover-Glow Light Source */}
      <div 
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          width: '350px',
          height: '350px',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          opacity: isHovered ? 0.8 : 0,
          filter: 'blur(30px)',
        }}
      />
      <div className="relative z-10 h-full p-6 md:p-8">{children}</div>
    </motion.div>
  );
}

// ============================================
// ANIMATED ICON WRAPPER
// ============================================
interface AnimatedIconWrapperProps {
  iconType: 'layout' | 'zap' | 'shield' | 'users' | 'chart' | 'lock';
  color: string;
  className?: string;
}

export function AnimatedIconWrapper({ iconType, color, className = '' }: AnimatedIconWrapperProps) {
  const icons = {
    layout: AnimatedLayoutIcon,
    zap: AnimatedZapIcon,
    shield: AnimatedShieldIcon,
    users: AnimatedUsersIcon,
    chart: AnimatedChartIcon,
    lock: AnimatedLockIcon,
  };

  const IconComponent = icons[iconType];

  return (
    <motion.div 
      className={`
        w-14 h-14 rounded-2xl deep-glass-sm
        flex items-center justify-center transition-all duration-500
        ${className}
      `}
      whileHover={{ scale: 1.15 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <IconComponent className="w-7 h-7 icon-glass" color={color} />
    </motion.div>
  );
}

// ============================================
// FEATURES BENTO GRID
// ============================================
interface FeatureItem {
  title: string;
  description: string;
  iconType: 'layout' | 'zap' | 'shield' | 'users' | 'chart' | 'lock';
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
              color={feature.color}
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
// 3D TESTIMONIALS CAROUSEL
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
  return (
    <div 
      className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 ${className}`}
      style={{ perspective: '1000px' }}
    >
      {testimonials.map((testimonial, index) => (
        <Testimonial3DCard 
          key={index}
          testimonial={testimonial}
          index={index}
        />
      ))}
    </div>
  );
}

interface Testimonial3DCardProps {
  testimonial: TestimonialItem;
  index: number;
}

function Testimonial3DCard({ testimonial, index }: Testimonial3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, rotateX: 15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: 15 }}
      transition={{ 
        duration: 0.7, 
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      style={{ 
        transformStyle: 'preserve-3d'
      }}
      whileHover={{ 
        scale: 1.02,
        rotateX: -2,
        rotateY: index === 0 ? 2 : index === 2 ? -2 : 0
      }}
      className="relative rounded-3xl p-6 md:p-8
        deep-glass
        transition-all duration-300
        hover:-translate-y-1
        group"
    >
      {/* Verified Expertise Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full deep-glass-sm">
        <svg className="w-3.5 h-3.5 text-emerald-400 icon-glass" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium text-glass-secondary">{testimonial.expertise}</span>
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-6 mt-8">
        {[...Array(5)].map((_, i) => (
          <motion.svg 
            key={i}
            className="w-4 h-4 text-white/20"
            fill="currentColor"
            viewBox="0 0 20 20"
            initial={{ opacity: 0.2 }}
            whileInView={{ opacity: 1, color: '#D4AF37' }}
            transition={{ delay: i * 0.1 + 0.3, duration: 0.3 }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </motion.svg>
        ))}
      </div>

      {/* Quote */}
      <p className="text-lg font-light italic leading-relaxed mb-6 text-glass-secondary">
        "{testimonial.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4 mt-auto">
        <motion.div 
          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-black"
          style={{ backgroundColor: testimonial.color }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          {testimonial.name.charAt(0)}
        </motion.div>
        <div>
          <h4 className="font-semibold text-glass-primary">{testimonial.name}</h4>
          <p className="text-sm uppercase tracking-wider text-glass-muted">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
}
