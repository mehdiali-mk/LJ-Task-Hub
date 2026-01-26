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

// Default colors palette (desaturated for dark mode, matching chart-tokens)
const defaultColors = [
  "hsl(200, 80%, 55%)",   // Cyan blue
  "hsl(280, 65%, 58%)",   // Soft purple
  "hsl(160, 70%, 48%)",   // Teal
  "hsl(35, 90%, 55%)",    // Warm orange
  "hsl(340, 70%, 58%)",   // Pink
  "hsl(45, 85%, 55%)",    // Gold
  "hsl(180, 60%, 48%)",   // Cyan
  "hsl(220, 75%, 58%)",   // Royal blue
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
  chartId,
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
  chartId: string;
}) {
  const path = createPieSegmentPath(cx, cy, outerRadius, innerRadius, startAngle, endAngle);
  // Use whole numbers for cleaner display
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  // Calculate label position at mid-angle of the segment
  const midAngle = (startAngle + endAngle) / 2;
  
  // Position labels at 40% of the way from inner to outer (inward bias to prevent edge overflow)
  // For donuts: stay closer to inner edge to avoid clipping at outer edge
  // For pies: position at 55% from center for readability
  const bandWidth = outerRadius - innerRadius;
  const labelDist = innerRadius > 0 
    ? innerRadius + (bandWidth * 0.5)  // Center of the band
    : outerRadius * 0.55;              // 55% out for pie charts

  const labelPos = polarToCartesian(cx, cy, labelDist, midAngle);
  
  // UNIQUE gradient ID per chart instance to prevent collisions
  const gradientId = `pie-gradient-${chartId}-${index}`;
  
  // Only show labels on segments that are large enough (at least ~11% of the pie = 40 degrees)
  const segmentAngle = endAngle - startAngle;
  const showLabel = segmentAngle > 40;

  return (
    <g
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: "pointer" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity={0.8} />
        </linearGradient>
      </defs>
      
      {/* Main segment */}
      <motion.path
        d={path}
        fill={`url(#${gradientId})`}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth={1}
        initial={animated ? { opacity: 0 } : undefined}
        animate={{
          opacity: isHovered ? 1 : 0.85,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{
          duration: 0.2,
          ease: "easeOut"
        }}
        style={{
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />
      
      {/* Label - only shown on large enough segments */}
      {showLabel && (
        <text
          x={labelPos.x}
          y={labelPos.y}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-semibold fill-white pointer-events-none"
          style={{
            textShadow: "0 1px 3px rgba(0,0,0,0.9)",
            opacity: isHovered ? 1 : 0.95,
            fontSize: "8px",
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
  centerValue,
  centerLabel,
}: LiquidPieChartProps & { centerValue?: string | number; centerLabel?: string }) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  
  // Generate unique ID for this chart instance to prevent gradient collisions
  const chartId = React.useId();
  
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 16; // Increased padding to prevent label overflow
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  // Calculate segment angles - STRICTLY use provided colors, no fallback
  const segments = React.useMemo(() => {
    let currentAngle = 0;
    return data.map((point, index) => {
      const percentage = total > 0 ? point.value / total : 0;
      const angle = percentage * 360;
      
      // STRICT: Use provided color, throw visible error color if missing
      const segmentColor = point.color ? String(point.color) : '#FF00FF'; // Magenta = missing color error
      
      const segment = {
        label: point.label,
        value: point.value,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: segmentColor,
      };
      currentAngle += angle;
      return segment;
    });
  }, [data, total]);

  return (
    <div className={cn("flex items-center gap-4 flex-wrap", className)}>
      {/* Chart */}
      <svg
        width={size}
        height={size}
        className="overflow-visible flex-shrink-0"
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
        
        {/* Segments - pass chartId for unique gradient IDs */}
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
            chartId={chartId}
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
            
            {/* Center value and label - rendered inside SVG for true centering */}
            {centerValue !== undefined && (
              <text
                x={cx}
                y={centerLabel ? cy - 4 : cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white font-bold"
                style={{ fontSize: '20px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
              >
                {centerValue}
              </text>
            )}
            {centerLabel && (
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white/60"
                style={{ fontSize: '10px' }}
              >
                {centerLabel}
              </text>
            )}
          </>
        )}
      </svg>
      
      {/* Legend */}
      {showLegend && (
        <div className="flex flex-col gap-1.5 min-w-0 flex-shrink">
          {segments.map((segment, index) => (
            <motion.div
              key={`legend-${segment.label}-${index}`}
              className="flex items-center gap-1.5 cursor-pointer min-w-0"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              animate={{
                opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.5,
              }}
            >
              {/* Color indicator (clean dot) */}
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: segment.color,
                  boxShadow: `0 0 4px ${segment.color}66`,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              
              {/* Label */}
              <span className="text-xs text-white/70 truncate">
                {segment.label}
              </span>
              
              {/* Value */}
              <span className="text-xs text-white/50 ml-auto flex-shrink-0">
                {segment.value}
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
