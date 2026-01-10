import React, { forwardRef } from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';

// Animation state types
type AnimationState = 'idle' | 'hover' | 'active' | 'loading' | 'success' | 'error';

// Icon category types for different animation behaviors
type IconCategory = 
  | 'default'       // Basic breathing + lift
  | 'arrow'         // Horizontal movement
  | 'arrow-back'    // Reverse horizontal
  | 'action'        // Lift + glow
  | 'action-danger' // Lift + crimson glow
  | 'action-success'// Lift + emerald glow
  | 'nav'           // Fill transition
  | 'bell'          // Shake
  | 'gear'          // Rotate
  | 'heart'         // Beat
  | 'star'          // Sparkle
  | 'refresh'       // Spin
  | 'chevron'       // Rotate 180
  | 'lock'          // Unlock animation
  | 'check'         // Draw check
  | 'x'             // Draw X
  | 'loader';       // Loading spinner

interface AnimatedIconProps extends Omit<LucideProps, 'ref'> {
  icon: LucideIcon;
  category?: IconCategory;
  state?: AnimationState;
  isActive?: boolean;
  isOpen?: boolean;
  pulse?: boolean;
}

/**
 * Universal Kinetic Icon Component
 * 
 * All icons breathe with life when idle and respond fluidly to interactions.
 * Uses CSS-first animations targeting only GPU-composited properties.
 */
export const AnimatedIcon = forwardRef<SVGSVGElement, AnimatedIconProps>(({
  icon: Icon,
  category = 'default',
  state = 'idle',
  isActive = false,
  isOpen = false,
  pulse = false,
  className = '',
  ...props
}, ref) => {
  // Build class list based on category and state
  const categoryClasses: Record<IconCategory, string> = {
    default: 'kinetic-icon',
    arrow: 'kinetic-arrow',
    'arrow-back': 'kinetic-arrow kinetic-arrow-back',
    action: 'kinetic-action',
    'action-danger': 'kinetic-action kinetic-action-danger',
    'action-success': 'kinetic-action kinetic-action-success',
    nav: 'kinetic-nav',
    bell: 'kinetic-icon kinetic-bell',
    gear: 'kinetic-icon kinetic-gear',
    heart: 'kinetic-icon kinetic-heart',
    star: 'kinetic-icon kinetic-star',
    refresh: 'kinetic-icon kinetic-refresh',
    chevron: 'kinetic-icon kinetic-chevron',
    lock: 'kinetic-icon kinetic-lock',
    check: 'kinetic-icon kinetic-check-draw',
    x: 'kinetic-icon kinetic-x-draw',
    loader: 'kinetic-loader',
  };

  // State modifiers
  const stateModifiers: Record<AnimationState, string> = {
    idle: '',
    hover: '',
    active: 'active',
    loading: 'loading',
    success: 'kinetic-action-success',
    error: 'kinetic-action-danger',
  };

  const classes = [
    categoryClasses[category],
    stateModifiers[state],
    isActive ? 'active' : '',
    isOpen ? 'open' : '',
    pulse ? 'kinetic-icon-pulse' : '',
    'icon-glass', // From Serene Glass UI
    className,
  ].filter(Boolean).join(' ');

  return <Icon ref={ref} className={classes} {...props} />;
});

AnimatedIcon.displayName = 'AnimatedIcon';

// ============================================
// SPECIALIZED KINETIC COMPONENTS
// ============================================

interface KineticLoaderProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Liquid Glass Loader
 * A thin glass ring with organic flowing motion
 */
export function KineticLoader({ 
  size = 24, 
  strokeWidth = 2,
  className = '' 
}: KineticLoaderProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`kinetic-loader icon-glass ${className}`}
      style={{ willChange: 'transform' }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        style={{
          strokeDasharray: `${circumference * 0.6}, ${circumference}`,
          strokeDashoffset: circumference * 0.25,
        }}
      />
    </svg>
  );
}

interface KineticProgressProps {
  progress?: number;
  isIndeterminate?: boolean;
  className?: string;
}

/**
 * Liquid Progress Bar
 * A glass trough with flowing light
 */
export function KineticProgress({ 
  progress = 0, 
  isIndeterminate = false,
  className = '' 
}: KineticProgressProps) {
  return (
    <div 
      className={`
        relative h-1 rounded-full overflow-hidden
        deep-glass-sm
        ${className}
      `}
    >
      <div
        className={`
          absolute inset-0 rounded-full
          ${isIndeterminate ? 'kinetic-progress-liquid' : ''}
        `}
        style={
          !isIndeterminate
            ? {
                width: `${Math.min(100, Math.max(0, progress))}%`,
                background: 'linear-gradient(90deg, rgba(168, 27, 27, 0.6), rgba(232, 160, 64, 0.6))',
                transition: 'width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }
            : undefined
        }
      />
    </div>
  );
}

interface KineticDotProps {
  color?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Pulsing Status Dot
 */
export function KineticDot({ 
  color = 'default', 
  size = 'md',
  className = '' 
}: KineticDotProps) {
  const colors = {
    default: 'bg-white/60',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-rose-400',
  };

  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <span 
      className={`
        inline-block rounded-full kinetic-pulse
        ${colors[color]}
        ${sizes[size]}
        ${className}
      `}
    />
  );
}

// ============================================
// CONVENIENCE WRAPPERS
// ============================================

interface NavIconProps extends Omit<AnimatedIconProps, 'category'> {
  isActive?: boolean;
}

export function NavIcon({ isActive, ...props }: NavIconProps) {
  return <AnimatedIcon {...props} category="nav" isActive={isActive} />;
}

interface ActionIconProps extends Omit<AnimatedIconProps, 'category'> {
  variant?: 'default' | 'danger' | 'success';
}

export function ActionIcon({ variant = 'default', ...props }: ActionIconProps) {
  const category = variant === 'default' 
    ? 'action' 
    : variant === 'danger' 
    ? 'action-danger' 
    : 'action-success';
  return <AnimatedIcon {...props} category={category} />;
}

interface ArrowIconProps extends Omit<AnimatedIconProps, 'category'> {
  direction?: 'forward' | 'back';
}

export function ArrowIcon({ direction = 'forward', ...props }: ArrowIconProps) {
  return <AnimatedIcon {...props} category={direction === 'back' ? 'arrow-back' : 'arrow'} />;
}
