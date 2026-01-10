import React from 'react';
import { BentoTile } from './bento-tile';
import { GlassmorphicIcon } from './glassmorphic-icon';
import type { LucideIcon } from 'lucide-react';

interface BentoFeature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface BentoGridProps {
  features: BentoFeature[];
  className?: string;
}

export function BentoGrid({ features, className = '' }: BentoGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 ${className}`}>
      {features.map((feature, index) => (
        <BentoTile 
          key={index} 
          size={feature.size || 'md'}
          glowColor={`${feature.color}40`}
        >
          <div className="flex flex-col h-full group">
            <GlassmorphicIcon 
              icon={feature.icon} 
              color={feature.color}
              className="mb-6"
            />
            
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">
              {feature.title}
            </h3>
            
            <p className="text-white/50 text-base leading-relaxed flex-grow">
              {feature.description}
            </p>
          </div>
        </BentoTile>
      ))}
    </div>
  );
}

interface BentoTestimonial {
  name: string;
  role: string;
  text: string;
  avatar?: string;
  color: string;
}

interface BentoTestimonialsProps {
  testimonials: BentoTestimonial[];
  className?: string;
}

export function BentoTestimonials({ testimonials, className = '' }: BentoTestimonialsProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 ${className}`}>
      {testimonials.map((testimonial, index) => (
        <BentoTile 
          key={index}
          glowColor={`${testimonial.color}30`}
        >
          <div className="flex flex-col h-full justify-between group">
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i}
                  className="w-4 h-4 text-white/20 group-hover:text-amber-400 transition-colors duration-300"
                  style={{ transitionDelay: `${i * 50}ms`, willChange: 'color' }}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            
            {/* Quote */}
            <p className="text-white/70 text-lg font-light italic leading-relaxed flex-grow mb-6">
              "{testimonial.text}"
            </p>
            
            {/* Author */}
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-black transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  backgroundColor: testimonial.color,
                  willChange: 'transform'
                }}
              >
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-white">{testimonial.name}</h4>
                <p className="text-sm text-white/40 uppercase tracking-wider">{testimonial.role}</p>
              </div>
            </div>
          </div>
        </BentoTile>
      ))}
    </div>
  );
}
