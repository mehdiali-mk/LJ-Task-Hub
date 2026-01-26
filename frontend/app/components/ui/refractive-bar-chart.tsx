"use client";

import * as React from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * RefractiveBarChart
 * 
 * Bar chart with solid glass block bars featuring specular highlights,
 * internal refractive depth, and spring-animated updates.
 * 
 * Spring Physics: stiffness 300, damping 25
 */

interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface RefractiveBarChartProps {
  /** Data points to display */
  data: BarDataPoint[];
  /** Chart height in pixels */
  height?: number;
  /** Show x-axis labels */
  showLabels?: boolean;
  /** Show value on hover/always */
  showValues?: "hover" | "always" | "never";
  /** Enable spring animations */
  animated?: boolean;
  /** Bar gap in pixels */
  gap?: number;
  /** Additional className */
  className?: string;
}

// Spring configuration
const springConfig = {
  stiffness: 300,
  damping: 25,
};

// Default colors palette (glass-friendly)
const defaultColors = [
  "hsl(200, 100%, 50%)",  // Electro blue
  "hsl(280, 80%, 55%)",   // Purple
  "hsl(160, 80%, 45%)",   // Teal
  "hsl(35, 100%, 55%)",   // Orange
  "hsl(340, 80%, 55%)",   // Pink
  "hsl(220, 80%, 55%)",   // Royal blue
];

/**
 * Individual glass bar component
 */
function GlassBar({
  value,
  maxValue,
  height,
  color,
  label,
  showValue,
  animated,
  index,
}: {
  value: number;
  maxValue: number;
  height: number;
  color: string;
  label: string;
  showValue: "hover" | "always" | "never";
  animated: boolean;
  index: number;
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  // Spring-animated height
  const springHeight = useSpring(percentage, springConfig);
  const barHeight = useTransform(springHeight, [0, 100], [0, height - 40]);
  
  React.useEffect(() => {
    if (animated) {
      springHeight.set(percentage);
    }
  }, [percentage, animated, springHeight]);

  // Color variants
  const colorDark = color.replace(/\d+%\)$/, (match) => {
    const val = parseInt(match);
    return `${Math.max(20, val - 15)}%)`;
  });
  const colorLight = color.replace(/\d+%\)$/, (match) => {
    const val = parseInt(match);
    return `${Math.min(80, val + 15)}%)`;
  });

  return (
    <div
      className="flex flex-col items-center justify-end flex-1 min-w-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Value label */}
      {(showValue === "always" || (showValue === "hover" && isHovered)) && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="text-xs font-medium text-white/80 mb-1"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
        >
          {value.toLocaleString()}
        </motion.div>
      )}
      
      {/* Glass Bar */}
      <motion.div
        className="relative w-full max-w-[60px] mx-auto cursor-pointer"
        style={{
          height: animated ? barHeight : `${(percentage / 100) * (height - 40)}px`,
          minHeight: 4,
        }}
        initial={{ height: 0 }}
        animate={{ height: animated ? undefined : `${(percentage / 100) * (height - 40)}px` }}
        transition={animated ? undefined : { type: "spring", ...springConfig }}
      >
        {/* Main glass block */}
        <div
          className="absolute inset-0 rounded-t-lg overflow-hidden transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${colorLight} 0%, ${color} 50%, ${colorDark} 100%)`,
            border: "1px solid rgba(255,255,255,0.2)",
            borderBottom: "none",
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.3),
              inset -2px 0 4px rgba(0,0,0,0.1),
              0 4px 12px rgba(0,0,0,0.2)
            `,
            filter: isHovered ? "url(#internalGlow)" : "url(#liquidGlass)",
            transform: isHovered ? "scaleX(1.05)" : "scaleX(1)",
          }}
        >
          {/* Specular highlight */}
          <div
            className="absolute top-0 left-0 right-1/2 h-1/3"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)",
              borderRadius: "6px 0 0 0",
            }}
          />
          
          {/* Internal depth gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, transparent 30%, rgba(0,0,0,0.15) 100%)",
            }}
          />
          
          {/* Edge rim */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
            }}
          />
        </div>
      </motion.div>
      
      {/* X-axis label */}
      <div
        className="mt-2 text-xs text-white/60 truncate max-w-full px-1 text-center"
        title={label}
      >
        {label}
      </div>
    </div>
  );
}

export function RefractiveBarChart({
  data,
  height = 200,
  showLabels = true,
  showValues = "hover",
  animated = true,
  gap = 8,
  className,
}: RefractiveBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("relative", className)}>
      {/* Chart container */}
      <div
        className="relative flex items-end"
        style={{
          height,
          gap,
          padding: "8px 0",
        }}
      >
        {/* Y-axis grid lines (subtle) */}
        <div className="absolute inset-x-0 top-0 bottom-8 pointer-events-none">
          {[0.25, 0.5, 0.75].map((ratio) => (
            <div
              key={ratio}
              className="absolute left-0 right-0 border-t border-white/5"
              style={{ bottom: `${ratio * 100}%` }}
            />
          ))}
        </div>
        
        {/* Bars */}
        {data.map((point, index) => (
          <GlassBar
            key={`${point.label}-${index}`}
            value={point.value}
            maxValue={maxValue}
            height={height}
            color={point.color || defaultColors[index % defaultColors.length]}
            label={showLabels ? point.label : ""}
            showValue={showValues}
            animated={animated}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Horizontal variant of the bar chart
 */
interface RefractiveBarChartHorizontalProps extends Omit<RefractiveBarChartProps, "height"> {
  /** Bar height for each item */
  barHeight?: number;
}

export function RefractiveBarChartHorizontal({
  data,
  barHeight = 32,
  showLabels = true,
  showValues = "always",
  animated = true,
  gap = 8,
  className,
}: RefractiveBarChartHorizontalProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("relative space-y-2", className)} style={{ gap }}>
      {data.map((point, index) => {
        const percentage = (point.value / maxValue) * 100;
        const color = point.color || defaultColors[index % defaultColors.length];
        const colorDark = color.replace(/\d+%\)$/, (m) => `${Math.max(20, parseInt(m) - 15)}%)`);
        const colorLight = color.replace(/\d+%\)$/, (m) => `${Math.min(80, parseInt(m) + 15)}%)`);

        return (
          <div key={`${point.label}-${index}`} className="flex items-center gap-3">
            {/* Label */}
            {showLabels && (
              <div className="w-20 text-sm text-white/70 truncate" title={point.label}>
                {point.label}
              </div>
            )}
            
            {/* Bar container */}
            <div
              className="flex-1 relative rounded-lg overflow-hidden"
              style={{
                height: barHeight,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* Glass bar */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-lg"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ type: "spring", ...springConfig }}
                style={{
                  background: `linear-gradient(180deg, ${colorLight} 0%, ${color} 50%, ${colorDark} 100%)`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
                  filter: "url(#liquidGlass)",
                }}
              >
                {/* Specular highlight */}
                <div
                  className="absolute inset-x-0 top-0 h-1/2"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)",
                  }}
                />
              </motion.div>
              
              {/* Value */}
              {showValues !== "never" && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <span className="text-xs font-medium text-white/80">
                    {point.value.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export {
  type BarDataPoint,
  type RefractiveBarChartProps,
  type RefractiveBarChartHorizontalProps,
};
