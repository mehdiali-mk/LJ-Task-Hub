"use client";

import * as React from "react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * LiquidPieChart
 * 
 * Pie/donut chart with glass segments featuring refractive edges,
 * specular highlights, and spring-animated transitions.
 * 
 * Spring Physics: stiffness 300, damping 25
 */

interface PieDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface LiquidPieChartProps {
  /** Data points to display */
  data: PieDataPoint[];
  /** Chart size in pixels */
  size?: number;
  /** Inner radius for donut style (0 = pie, >0 = donut) */
  innerRadius?: number;
  /** Show labels on segments */
  showLabels?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Enable spring animations */
  animated?: boolean;
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
  "hsl(45, 90%, 50%)",    // Gold
  "hsl(180, 70%, 45%)",   // Cyan
];

/**
 * Calculate SVG arc path
 */
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(" ");
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Create pie segment path (filled shape)
 */
function createPieSegmentPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  if (innerRadius === 0) {
    // Pie slice (no hole)
    return [
      "M", cx, cy,
      "L", outerStart.x, outerStart.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
      "Z",
    ].join(" ");
  }

  // Donut segment
  return [
    "M", outerStart.x, outerStart.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
    "L", innerEnd.x, innerEnd.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
    "Z",
  ].join(" ");
}

/**
 * Individual glass segment
 */
function GlassSegment({
  cx,
  cy,
  outerRadius,
  innerRadius,
  startAngle,
  endAngle,
  color,
  label,
  value,
  total,
  animated,
  index,
  onHover,
  isHovered,
}: {
  cx: number;
  cy: number;
  outerRadius: number;
  innerRadius: number;
  startAngle: number;
  endAngle: number;
  color: string;
  label: string;
  value: number;
  total: number;
  animated: boolean;
  index: number;
  onHover: (index: number | null) => void;
  isHovered: boolean;
}) {
  const path = createPieSegmentPath(cx, cy, outerRadius, innerRadius, startAngle, endAngle);
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  
  // Calculate label position (midpoint of arc)
  const midAngle = (startAngle + endAngle) / 2;
  const labelRadius = (outerRadius + innerRadius) / 2;
  const labelPos = polarToCartesian(cx, cy, labelRadius, midAngle);
  
  // Color variants
  const colorDark = color.replace(/\d+%\)$/, (m) => `${Math.max(20, parseInt(m) - 20)}%)`);
  const colorLight = color.replace(/\d+%\)$/, (m) => `${Math.min(85, parseInt(m) + 15)}%)`);

  // Create gradient ID unique to this segment
  const gradientId = `glass-gradient-${index}`;

  return (
    <g
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: "pointer" }}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colorLight} />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor={colorDark} />
        </linearGradient>
      </defs>
      
      {/* Main segment */}
      <motion.path
        d={path}
        fill={`url(#${gradientId})`}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
        initial={animated ? { scale: 0, opacity: 0 } : undefined}
        animate={{
          scale: isHovered ? 1.05 : 1,
          opacity: 1,
        }}
        transition={{
          scale: { type: "spring", ...springConfig },
          opacity: { duration: 0.3, delay: index * 0.05 },
        }}
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          filter: isHovered ? "url(#internalGlow)" : "url(#liquidGlass)",
        }}
      />
      
      {/* Specular highlight arc */}
      <path
        d={describeArc(cx, cy, outerRadius - 2, startAngle + 5, startAngle + (endAngle - startAngle) * 0.4)}
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={2}
        strokeLinecap="round"
        style={{ pointerEvents: "none" }}
      />
      
      {/* Inner edge highlight (for donut) */}
      {innerRadius > 0 && (
        <path
          d={describeArc(cx, cy, innerRadius + 1, startAngle, endAngle)}
          fill="none"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth={1}
          style={{ pointerEvents: "none" }}
        />
      )}
      
      {/* Label */}
      {endAngle - startAngle > 20 && (
        <text
          x={labelPos.x}
          y={labelPos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-medium fill-white/90 pointer-events-none"
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
            fontSize: innerRadius > 0 ? "10px" : "11px",
          }}
        >
          {percentage}%
        </text>
      )}
    </g>
  );
}

export function LiquidPieChart({
  data,
  size = 200,
  innerRadius = 0,
  showLabels = true,
  showLegend = true,
  animated = true,
  className,
}: LiquidPieChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 10;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  // Calculate segment angles
  const segments = React.useMemo(() => {
    let currentAngle = 0;
    return data.map((point, index) => {
      const percentage = total > 0 ? point.value / total : 0;
      const angle = percentage * 360;
      const segment = {
        ...point,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: point.color || defaultColors[index % defaultColors.length],
      };
      currentAngle += angle;
      return segment;
    });
  }, [data, total]);

  return (
    <div className={cn("flex items-center gap-6", className)}>
      {/* Chart */}
      <svg
        width={size}
        height={size}
        className="overflow-visible"
      >
        {/* Background circle (glass container) */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius + 4}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
        
        {/* Segments */}
        {segments.map((segment, index) => (
          <GlassSegment
            key={`${segment.label}-${index}`}
            cx={cx}
            cy={cy}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            startAngle={segment.startAngle}
            endAngle={segment.endAngle}
            color={segment.color}
            label={segment.label}
            value={segment.value}
            total={total}
            animated={animated}
            index={index}
            onHover={setHoveredIndex}
            isHovered={hoveredIndex === index}
          />
        ))}
        
        {/* Center circle for donut (glass effect) */}
        {innerRadius > 0 && (
          <>
            <circle
              cx={cx}
              cy={cy}
              r={innerRadius}
              fill="rgba(0,0,0,0.3)"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
            {/* Center highlight */}
            <circle
              cx={cx}
              cy={cy - innerRadius * 0.3}
              r={innerRadius * 0.15}
              fill="rgba(255,255,255,0.1)"
            />
          </>
        )}
      </svg>
      
      {/* Legend */}
      {showLegend && (
        <div className="flex flex-col gap-2">
          {segments.map((segment, index) => (
            <motion.div
              key={`legend-${segment.label}-${index}`}
              className="flex items-center gap-2 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              animate={{
                opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.5,
              }}
            >
              {/* Color indicator (glass dot) */}
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${segment.color.replace(/\d+%\)$/, (m) => `${Math.min(85, parseInt(m) + 15)}%)`)} 0%, ${segment.color} 100%)`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              
              {/* Label */}
              <span className="text-sm text-white/70">
                {segment.label}
              </span>
              
              {/* Value */}
              <span className="text-sm text-white/50 ml-auto">
                {segment.value.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Compact donut variant with center value
 */
interface LiquidDonutProps extends Omit<LiquidPieChartProps, "innerRadius" | "showLabels" | "showLegend"> {
  /** Center label (shown in donut hole) */
  centerLabel?: string;
  /** Center value (shown in donut hole) */
  centerValue?: string | number;
}

export function LiquidDonut({
  data,
  size = 160,
  animated = true,
  centerLabel,
  centerValue,
  className,
}: LiquidDonutProps) {
  const innerRadius = size * 0.3;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className={cn("relative inline-block", className)}>
      <LiquidPieChart
        data={data}
        size={size}
        innerRadius={innerRadius}
        showLabels={false}
        showLegend={false}
        animated={animated}
      />
      
      {/* Center content */}
      {(centerLabel || centerValue) && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          {centerValue && (
            <span
              className="text-xl font-bold text-white/90"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
            >
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-xs text-white/60">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export {
  type PieDataPoint,
  type LiquidPieChartProps,
  type LiquidDonutProps,
};
