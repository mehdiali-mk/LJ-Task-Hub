"use client";

import * as React from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * LiquidProgress
 * 
 * A glass tube progress bar with flowing electro-blue liquid.
 * Features spring-animated fill, wave animation, and glow effects.
 * 
 * Spring Physics: stiffness 300, damping 25
 */

interface LiquidProgressProps {
  /** Progress value 0-100 */
  value: number;
  /** Custom liquid color (default: electro-blue) */
  color?: string;
  /** Show animated wave on liquid surface */
  showWave?: boolean;
  /** Glow when progress > 80% */
  glowOnFill?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
  /** Show percentage label */
  showLabel?: boolean;
}

// Spring configuration for tactile feel
const springConfig = {
  stiffness: 300,
  damping: 25,
};

// Size configurations
const sizeConfig = {
  sm: { height: 8, borderRadius: 4, waveHeight: 2 },
  md: { height: 16, borderRadius: 8, waveHeight: 4 },
  lg: { height: 24, borderRadius: 12, waveHeight: 6 },
};

export function LiquidProgress({
  value,
  color = "hsl(200, 100%, 50%)",
  showWave = true,
  glowOnFill = true,
  size = "md",
  className,
  showLabel = false,
}: LiquidProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const config = sizeConfig[size];
  
  // Spring-animated progress value
  const springValue = useSpring(clampedValue, springConfig);
  const width = useTransform(springValue, [0, 100], ["0%", "100%"]);
  
  // Determine if should glow
  const shouldGlow = glowOnFill && clampedValue > 80;
  
  // Parse color for darker/lighter variants
  const colorDark = color.replace(/50%\)$/, "35%)");
  const colorLight = color.replace(/50%\)$/, "65%)");
  
  // Update spring when value changes
  React.useEffect(() => {
    springValue.set(clampedValue);
  }, [clampedValue, springValue]);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Glass Tube Container */}
      <div
        className="relative overflow-hidden"
        style={{
          height: config.height,
          borderRadius: config.borderRadius,
          background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.15) 100%)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: `
            inset 0 2px 4px rgba(0,0,0,0.2),
            inset 0 -1px 0 rgba(255,255,255,0.1),
            0 2px 8px rgba(0,0,0,0.15)
          `,
          filter: "url(#glassTube)",
        }}
      >
        {/* Liquid Fill */}
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{
            width,
            background: `linear-gradient(180deg, ${colorLight} 0%, ${color} 40%, ${colorDark} 100%)`,
            borderRadius: `${config.borderRadius - 1}px`,
            boxShadow: shouldGlow
              ? `0 0 20px ${color}, inset 0 1px 0 rgba(255,255,255,0.3)`
              : "inset 0 1px 0 rgba(255,255,255,0.3)",
            filter: shouldGlow ? "url(#electroBlueGlow)" : undefined,
          }}
        >
          {/* Wave Animation */}
          {showWave && clampedValue > 5 && clampedValue < 100 && (
            <svg
              className="absolute right-0 top-0 h-full"
              style={{ width: config.waveHeight * 3 }}
              viewBox={`0 0 ${config.waveHeight * 3} ${config.height}`}
              preserveAspectRatio="none"
            >
              <motion.path
                d={`
                  M 0 0
                  L 0 ${config.height}
                  L ${config.waveHeight * 3} ${config.height}
                  Q ${config.waveHeight * 2} ${config.height / 2}, ${config.waveHeight * 3} 0
                  Z
                `}
                fill={color}
                animate={{
                  d: [
                    `M 0 0 L 0 ${config.height} L ${config.waveHeight * 3} ${config.height} Q ${config.waveHeight * 2} ${config.height / 2}, ${config.waveHeight * 3} 0 Z`,
                    `M 0 0 L 0 ${config.height} L ${config.waveHeight * 3} ${config.height} Q ${config.waveHeight * 1.5} ${config.height * 0.3}, ${config.waveHeight * 3} 0 Z`,
                    `M 0 0 L 0 ${config.height} L ${config.waveHeight * 3} ${config.height} Q ${config.waveHeight * 2.5} ${config.height * 0.7}, ${config.waveHeight * 3} 0 Z`,
                    `M 0 0 L 0 ${config.height} L ${config.waveHeight * 3} ${config.height} Q ${config.waveHeight * 2} ${config.height / 2}, ${config.waveHeight * 3} 0 Z`,
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>
          )}
          
          {/* Specular highlight on liquid */}
          <div
            className="absolute inset-x-0 top-0"
            style={{
              height: "40%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)",
              borderRadius: `${config.borderRadius - 1}px ${config.borderRadius - 1}px 0 0`,
            }}
          />
        </motion.div>
        
        {/* Glass reflection overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 50%)",
            borderRadius: config.borderRadius - 1,
          }}
        />
      </div>
      
      {/* Optional Label */}
      {showLabel && (
        <motion.span
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white/80"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
        >
          {Math.round(clampedValue)}%
        </motion.span>
      )}
    </div>
  );
}

/**
 * LiquidProgressCircular
 * 
 * Circular variant of liquid progress with glass ring.
 */
interface LiquidProgressCircularProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export function LiquidProgressCircular({
  value,
  size = 80,
  strokeWidth = 8,
  color = "hsl(200, 100%, 50%)",
  showLabel = true,
  className,
}: LiquidProgressCircularProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Spring-animated progress
  const springValue = useSpring(clampedValue, springConfig);
  const strokeDashoffset = useTransform(
    springValue,
    [0, 100],
    [circumference, 0]
  );
  
  React.useEffect(() => {
    springValue.set(clampedValue);
  }, [clampedValue, springValue]);

  const shouldGlow = clampedValue > 80;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background track (glass tube) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          style={{
            filter: "url(#glassTube)",
          }}
        />
        
        {/* Liquid fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset,
            filter: shouldGlow ? "url(#electroBlueGlow)" : undefined,
          }}
        />
        
        {/* Specular highlight arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth / 3}
          strokeDasharray={`${circumference * 0.15} ${circumference * 0.85}`}
          style={{ transform: `rotate(-45deg)`, transformOrigin: "center" }}
        />
      </svg>
      
      {/* Center label */}
      {showLabel && (
        <motion.span
          className="absolute text-sm font-semibold text-white/90"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
        >
          {Math.round(clampedValue)}%
        </motion.span>
      )}
    </div>
  );
}

export { type LiquidProgressProps, type LiquidProgressCircularProps };
