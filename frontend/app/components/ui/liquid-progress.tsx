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
  showWave = false, // Disabled by default for realism
  glowOnFill = true,
  size = "md",
  className,
  showLabel = true, // Default to true for visibility
}: LiquidProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const config = sizeConfig[size];
  
  // Parse color for gradient
  const colorDark = color.replace(/50%\)$/, "40%)");
  const colorLight = color.replace(/50%\)$/, "60%)");

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {/* Label Row */}
      {showLabel && (
        <div className="flex justify-between items-end px-1">
          <span className="text-xs text-transparent">.</span> {/* Spacer if needed, or remove */}
          <span className="text-xs font-medium text-white/70">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}

      {/* Modern Tube Container */}
      <div
        className="relative overflow-hidden w-full bg-white/5 border border-white/10"
        style={{
          height: config.height,
          borderRadius: config.borderRadius,
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
        }}
      >
        {/* Fill */}
        <motion.div
          className="absolute inset-y-0 left-0"
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            background: `linear-gradient(90deg, ${color} 0%, ${colorLight} 100%)`,
            borderRadius: config.borderRadius,
          }}
        >
          {/* Subtle shine/gloss */}
          <div
            className="absolute inset-x-0 top-0 h-[40%]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
            }}
          />
          
          {/* Glow effect at tip */}
          {glowOnFill && (
            <div 
              className="absolute right-0 top-0 bottom-0 w-[4px]"
              style={{
                background: "rgba(255,255,255,0.4)",
                filter: "blur(2px)",
              }}
            />
          )}
        </motion.div>
      </div>
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
