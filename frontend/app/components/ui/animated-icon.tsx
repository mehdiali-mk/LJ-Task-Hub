"use client";
import React, { useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { motion, type Variants } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

// Animation presets similar to AnimateIcons library
const animationVariants: Record<string, Variants> = {
  // Rotation animation for gear/settings icons
  rotate: {
    initial: { rotate: 0 },
    animate: { rotate: 360, transition: { duration: 2, ease: "linear", repeat: Infinity } },
    hover: { rotate: 180, transition: { duration: 0.5, ease: "easeInOut" } }
  },
  // Bounce animation for action icons (zap, check, etc)
  bounce: {
    initial: { y: 0 },
    animate: { y: [-2, 2, -2], transition: { duration: 0.6, repeat: Infinity } },
    hover: { y: -3, transition: { duration: 0.2, ease: "easeOut" } }
  },
  // Pulse/scale animation for UI icons
  pulse: {
    initial: { scale: 1 },
    animate: { scale: [1, 1.1, 1], transition: { duration: 1, repeat: Infinity } },
    hover: { scale: 1.15, transition: { duration: 0.2, ease: "easeOut" } }
  },
  // Shake animation for alert/bell icons
  shake: {
    initial: { rotate: 0 },
    animate: { rotate: [-5, 5, -5, 5, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 } },
    hover: { rotate: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } }
  },
  // Swing animation for bell icons
  swing: {
    initial: { rotate: 0, transformOrigin: "top center" },
    animate: { rotate: [-15, 15, -10, 10, -5, 5, 0], transition: { duration: 1, repeat: Infinity, repeatDelay: 1 } },
    hover: { rotate: [-20, 20, -15, 15, 0], transition: { duration: 0.6 } }
  },
  // Float animation for cloud/soft icons
  float: {
    initial: { y: 0 },
    animate: { y: [-3, 3], transition: { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } },
    hover: { y: -5, transition: { duration: 0.3 } }
  },
  // Heartbeat animation
  heartbeat: {
    initial: { scale: 1 },
    animate: { scale: [1, 1.2, 1, 1.2, 1], transition: { duration: 1.2, repeat: Infinity, repeatDelay: 0.5 } },
    hover: { scale: 1.25, transition: { duration: 0.15 } }
  },
  // Simple hover scale for generic icons
  scale: {
    initial: { scale: 1 },
    animate: {},
    hover: { scale: 1.15, transition: { duration: 0.2, ease: "easeOut" } }
  }
};

export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface AnimatedIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  animation?: keyof typeof animationVariants;
  isAnimated?: boolean;
  duration?: number;
}

export const AnimatedIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(({
  icon: Icon,
  size = 24,
  className = '',
  animation = 'scale',
  isAnimated = false,
  duration = 1
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [manualAnimate, setManualAnimate] = useState(false);

  useImperativeHandle(ref, () => ({
    startAnimation: () => setManualAnimate(true),
    stopAnimation: () => setManualAnimate(false)
  }));

  const variants = animationVariants[animation] || animationVariants.scale;
  const shouldAnimate = isAnimated || manualAnimate;

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial="initial"
      animate={shouldAnimate ? "animate" : isHovered ? "hover" : "initial"}
      variants={variants}
      style={{ willChange: 'transform' }}
    >
      <Icon 
        size={size} 
        className="icon-glass"
        strokeWidth={1.5}
      />
    </motion.div>
  );
});

AnimatedIcon.displayName = 'AnimatedIcon';

// Pre-configured icon exports for common use cases
export const SettingsAnimatedIcon = (props: Omit<AnimatedIconProps, 'icon' | 'animation'> & { icon: LucideIcon }) => (
  <AnimatedIcon {...props} animation="rotate" />
);

export const BellAnimatedIcon = (props: Omit<AnimatedIconProps, 'icon' | 'animation'> & { icon: LucideIcon }) => (
  <AnimatedIcon {...props} animation="swing" />
);

export const HeartAnimatedIcon = (props: Omit<AnimatedIconProps, 'icon' | 'animation'> & { icon: LucideIcon }) => (
  <AnimatedIcon {...props} animation="heartbeat" />
);

export const ZapAnimatedIcon = (props: Omit<AnimatedIconProps, 'icon' | 'animation'> & { icon: LucideIcon }) => (
  <AnimatedIcon {...props} animation="bounce" />
);
