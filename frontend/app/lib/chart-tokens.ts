/**
 * Chart Color Tokens
 * 
 * Centralized, semantic color palette for dashboard visualizations.
 * Using specific brand colors from the TaskForge design system.
 */

// Brand color palette
export const brandColors = {
  primary: "#0096FF",       // Electric Blue
  secondary: "#005BBB",     // Deep Sky Blue
  accent: "#E60000",        // Vibrant Red (use sparingly)
  highlight: "#FFFFFF",     // Spark White
  base: "#001A33",          // Midnight Blue
  mid: "#335577",           // Steel City
} as const;

// Status-based semantic colors (using brand palette)
export const statusColors = {
  // Positive states - using a balanced green
  completed: {
    base: "#22c55e",
    light: "#4ade80",
    dark: "#16a34a",
    glow: "rgba(34, 197, 94, 0.3)",
  },
  success: {
    base: "#22c55e",
    light: "#4ade80",
    dark: "#16a34a",
    glow: "rgba(34, 197, 94, 0.3)",
  },
  
  // Progress states - using Electric Blue
  inProgress: {
    base: brandColors.primary,    // #0096FF
    light: "#33aaff",
    dark: brandColors.secondary,  // #005BBB
    glow: "rgba(0, 150, 255, 0.3)",
  },
  active: {
    base: brandColors.primary,
    light: "#33aaff",
    dark: brandColors.secondary,
    glow: "rgba(0, 150, 255, 0.3)",
  },
  
  // Pending states - using warm amber
  todo: {
    base: "#fbbf24",
    light: "#fcd34d",
    dark: "#f59e0b",
    glow: "rgba(251, 191, 36, 0.3)",
  },
  pending: {
    base: "#fbbf24",
    light: "#fcd34d",
    dark: "#f59e0b",
    glow: "rgba(251, 191, 36, 0.3)",
  },
  
  // Alert states - using Vibrant Red
  overdue: {
    base: brandColors.accent,     // #E60000
    light: "#ff3333",
    dark: "#cc0000",
    glow: "rgba(230, 0, 0, 0.3)",
  },
  highPriority: {
    base: brandColors.accent,
    light: "#ff3333",
    dark: "#cc0000",
    glow: "rgba(230, 0, 0, 0.3)",
  },
} as const;

// Priority colors
export const priorityColors = {
  high: {
    base: brandColors.accent,     // #E60000
    light: "#ff3333",
    dark: "#cc0000",
  },
  medium: {
    base: "#fbbf24",
    light: "#fcd34d",
    dark: "#f59e0b",
  },
  low: {
    base: "#22c55e",
    light: "#4ade80",
    dark: "#16a34a",
  },
} as const;

// Accent colors for charts (using brand-inspired palette)
export const chartAccents = [
  brandColors.primary,      // Electric Blue #0096FF
  "#8b5cf6",                // Purple
  "#14b8a6",                // Teal
  "#f97316",                // Orange
  "#ec4899",                // Pink
  brandColors.secondary,    // Deep Sky Blue #005BBB
  "#eab308",                // Yellow
  brandColors.mid,          // Steel City #335577
] as const;

// Gradient presets for glass effects (using brand colors)
export const glassGradients = {
  primary: `linear-gradient(135deg, ${brandColors.primary}33 0%, ${brandColors.primary}0d 100%)`,
  secondary: `linear-gradient(135deg, ${brandColors.secondary}33 0%, ${brandColors.secondary}0d 100%)`,
  success: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)",
  warning: "linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.05) 100%)",
  danger: `linear-gradient(135deg, ${brandColors.accent}33 0%, ${brandColors.accent}0d 100%)`,
} as const;

// Mesh gradient colors for backgrounds
export const meshGradientColors = {
  primary: brandColors.primary,     // #0096FF - Electric Blue
  secondary: brandColors.secondary, // #005BBB - Deep Sky Blue
  accent: brandColors.accent,       // #E60000 - Vibrant Red
  base: brandColors.base,           // #001A33 - Midnight Blue
  mid: brandColors.mid,             // #335577 - Steel City
  highlight: brandColors.highlight, // #FFFFFF - Spark White
} as const;

// Tooltip styling
export const tooltipStyles = {
  background: `${brandColors.base}f2`,  // Midnight Blue with opacity
  border: `1px solid ${brandColors.mid}40`,
  borderRadius: "12px",
  backdropFilter: "blur(20px)",
  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 ${brandColors.highlight}1a`,
  padding: "12px 16px",
} as const;

// Animation timing
export const chartAnimations = {
  stagger: 0.05,
  duration: 0.6,
  spring: {
    stiffness: 300,
    damping: 25,
  },
} as const;

// Color type interfaces
export interface ColorVariant {
  base: string;
  light: string;
  dark: string;
  glow?: string;
}

// Helper function to get color by status
export function getStatusColor(status: string): ColorVariant {
  const normalized = status.toLowerCase().replace(/[_-\s]/g, '');
  
  if (normalized.includes('complete') || normalized.includes('done')) {
    return statusColors.completed;
  }
  if (normalized.includes('progress') || normalized.includes('active')) {
    return statusColors.inProgress;
  }
  if (normalized.includes('todo') || normalized.includes('pending')) {
    return statusColors.todo;
  }
  if (normalized.includes('overdue') || normalized.includes('high')) {
    return statusColors.overdue;
  }
  
  return statusColors.inProgress;
}

// Helper function to get priority color
export function getPriorityColor(priority: string): ColorVariant {
  const normalized = priority.toLowerCase();
  
  if (normalized === 'high' || normalized === 'urgent') {
    return priorityColors.high;
  }
  if (normalized === 'low') {
    return priorityColors.low;
  }
  
  return priorityColors.medium;
}
