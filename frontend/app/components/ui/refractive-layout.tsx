"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { SVGFilters, REFRACT_FILTERS } from "./svg-filters";

/**
 * Refractive Material System
 * 
 * iOS 26.2-inspired layout system that uses SVG displacement maps
 * instead of CSS blur for true light-bending refraction effects.
 * 
 * Features:
 * - Dynamic Contrast Weighting (auto-adjusts opacity based on bg luminosity)
 * - IOR 1.45 refraction on component edges
 * - Glass-cutout text effects
 */

// ============================================
// TYPES
// ============================================

type ContrastMode = "auto" | "clear" | "matte";

interface RefractiveContextValue {
  /** Current opacity level (0.05 = clear, 0.25 = matte) */
  lgOpacity: number;
  /** Current contrast weight multiplier */
  contrastWeight: number;
  /** Whether dynamic contrast is enabled */
  isDynamic: boolean;
  /** Manually set contrast mode */
  setContrastMode: (mode: ContrastMode) => void;
  /** Register a component for luminosity detection */
  registerComponent: (ref: HTMLElement | null) => void;
}

interface RefractiveProviderProps {
  children: React.ReactNode;
  /** Contrast mode: 'auto' detects background, 'clear'/'matte' are fixed */
  contrastMode?: ContrastMode;
  /** Mesh background canvas ref for luminosity sampling */
  meshCanvasRef?: React.RefObject<HTMLCanvasElement>;
}

// ============================================
// CONTEXT
// ============================================

const RefractiveContext = createContext<RefractiveContextValue | null>(null);

export function useRefractive() {
  const context = useContext(RefractiveContext);
  if (!context) {
    throw new Error("useRefractive must be used within a RefractiveProvider");
  }
  return context;
}

// ============================================
// LUMINOSITY DETECTION HOOK
// ============================================

function useLuminosityDetection(
  enabled: boolean,
  meshCanvasRef?: React.RefObject<HTMLCanvasElement>
) {
  const [luminosity, setLuminosity] = useState(0.3); // Default mid-range
  const samplingInterval = useRef<NodeJS.Timeout | null>(null);
  const registeredElements = useRef<Set<HTMLElement>>(new Set());

  const sampleLuminosity = useCallback(() => {
    if (!meshCanvasRef?.current || registeredElements.current.size === 0) {
      return;
    }

    const canvas = meshCanvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let totalLuminosity = 0;
    let sampleCount = 0;

    registeredElements.current.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Map screen coords to canvas coords
      const canvasX = (centerX / window.innerWidth) * canvas.width;
      const canvasY = (centerY / window.innerHeight) * canvas.height;

      try {
        const pixel = ctx.getImageData(
          Math.floor(canvasX),
          Math.floor(canvasY),
          1,
          1
        ).data;

        // Calculate luminosity using standard formula
        const r = pixel[0] / 255;
        const g = pixel[1] / 255;
        const b = pixel[2] / 255;
        const l = 0.299 * r + 0.587 * g + 0.114 * b;

        totalLuminosity += l;
        sampleCount++;
      } catch {
        // Canvas may be tainted or inaccessible
      }
    });

    if (sampleCount > 0) {
      setLuminosity(totalLuminosity / sampleCount);
    }
  }, [meshCanvasRef]);

  const registerComponent = useCallback((ref: HTMLElement | null) => {
    if (ref) {
      registeredElements.current.add(ref);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Start sampling at 2Hz (every 500ms for performance)
    samplingInterval.current = setInterval(sampleLuminosity, 500);

    return () => {
      if (samplingInterval.current) {
        clearInterval(samplingInterval.current);
      }
    };
  }, [enabled, sampleLuminosity]);

  return { luminosity, registerComponent };
}

// ============================================
// PROVIDER COMPONENT
// ============================================

import { MeshBackground } from "./mesh-background";

// ... (imports)

interface RefractiveContextValue {
  /** Current opacity level (0.05 = clear, 0.25 = matte) */
  lgOpacity: number;
  /** Current contrast weight multiplier */
  contrastWeight: number;
  /** Whether dynamic contrast is enabled */
  isDynamic: boolean;
  /** Whether Deep Focus mode is active */
  isDeepFocus: boolean;
  /** Manually set contrast mode */
  setContrastMode: (mode: ContrastMode) => void;
  /** Toggle Deep Focus mode */
  setDeepFocus: (active: boolean) => void;
  /** Register a component for luminosity detection */
  registerComponent: (ref: HTMLElement | null) => void;
}

// ... (RefractiveProviderProps)

// ... (context)

// ... (useLuminosityDetection)

// ============================================
// PROVIDER COMPONENT
// ============================================

export function RefractiveProvider({
  children,
  contrastMode = "auto",
  meshCanvasRef,
}: RefractiveProviderProps) {
  const [mode, setMode] = useState<ContrastMode>(contrastMode);
  const [isDeepFocus, setDeepFocus] = useState(false);
  
  const { luminosity, registerComponent } = useLuminosityDetection(
    mode === "auto",
    meshCanvasRef
  );

  // Calculate opacity based on mode and luminosity
  const lgOpacity = React.useMemo(() => {
    // Deep Focus overrides everything with a dense matte
    if (isDeepFocus) return 0.35; 

    switch (mode) {
      case "clear":
        return 0.05;
      case "matte":
        return 0.25;
      case "auto":
      default:
        // Map luminosity (0-1) to opacity (0.05-0.25)
        if (luminosity < 0.2) return 0.05;
        if (luminosity > 0.5) return 0.25;
        // Linear interpolation for mid-range
        return 0.05 + (luminosity - 0.2) * (0.2 / 0.3);
    }
  }, [mode, luminosity, isDeepFocus]);

  const contrastWeight = React.useMemo(() => {
    // Higher contrast weight for darker backgrounds or Deep Focus
    if (isDeepFocus) return 1.5;
    return 1.0 + (1 - luminosity) * 0.3;
  }, [luminosity, isDeepFocus]);

  // Update CSS custom properties
  useEffect(() => {
    document.documentElement.style.setProperty("--lg-opacity", lgOpacity.toFixed(3));
    document.documentElement.style.setProperty(
      "--lg-contrast-weight",
      contrastWeight.toFixed(2)
    );
  }, [lgOpacity, contrastWeight]);

  const value: RefractiveContextValue = {
    lgOpacity,
    contrastWeight,
    isDynamic: mode === "auto",
    isDeepFocus,
    setContrastMode: setMode,
    setDeepFocus,
    registerComponent,
  };

  return (
    <RefractiveContext.Provider value={value}>
      {/* Inject SVG filters once at provider level */}
      <SVGFilters />
      
      {/* Mesh Background with Speed Control */}
      <MeshBackground speed={isDeepFocus ? 0.2 : 1.0} />
      
      {children}
    </RefractiveContext.Provider>
  );
}

// ============================================
// REFRACTIVE CARD
// ============================================

interface RefractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Refraction intensity: 'full' | 'soft' | 'edge' */
  refraction?: "full" | "soft" | "edge" | "none";
  /** Enable dynamic contrast registration */
  dynamicContrast?: boolean;
}

export function RefractiveCard({
  className,
  refraction = "full",
  dynamicContrast = true,
  children,
  ...props
}: RefractiveCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Try to use context, but allow standalone usage
  let registerComponent: ((ref: HTMLElement | null) => void) | undefined;
  try {
    const context = useRefractive();
    registerComponent = context.registerComponent;
  } catch {
    // Not inside a RefractiveProvider, that's okay
  }

  useEffect(() => {
    if (dynamicContrast && registerComponent && ref.current) {
      registerComponent(ref.current);
    }
  }, [dynamicContrast, registerComponent]);

  const filterStyle = React.useMemo(() => {
    switch (refraction) {
      case "full":
        return { filter: REFRACT_FILTERS.LENS };
      case "soft":
        return { filter: REFRACT_FILTERS.SOFT };
      case "edge":
        return { filter: REFRACT_FILTERS.EDGE };
      default:
        return {};
    }
  }, [refraction]);

  return (
    <div
      ref={ref}
      className={cn(
        "refractive-card",
        "relative rounded-2xl",
        className
      )}
      {...props}
    >
      {/* Refractive Background Layer */}
      <div 
        className={cn(
          "absolute inset-0 rounded-2xl pointer-events-none",
          "bg-[rgba(255,255,255,var(--lg-opacity,0.12))]",
          "border border-[rgba(255,255,255,0.1)]",
          // Edge lighting
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-1px_1px_rgba(0,0,0,0.05)]",
          // Atmospheric shadow
          "shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]",
          "transition-all duration-300 ease-out"
        )}
        style={filterStyle}
      >
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 z-10 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}

// ============================================
// REFRACTIVE SIDEBAR
// ============================================

interface RefractiveSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Sidebar position */
  position?: "left" | "right";
}

export function RefractiveSidebar({
  className,
  position = "left",
  children,
  ...props
}: RefractiveSidebarProps) {
  return (
    <aside
      className={cn(
        "refractive-sidebar",
        "relative h-full",
        className
      )}
      {...props}
    >
      {/* Refractive Background Layer */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          "bg-[rgba(15,15,25,calc(var(--lg-opacity,0.12)*2.5))]",
          position === "left"
            ? "border-r border-[rgba(255,255,255,0.06)]"
            : "border-l border-[rgba(255,255,255,0.06)]",
          // Inset rim lighting
          position === "left"
            ? "shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]"
            : "shadow-[inset_1px_0_0_rgba(255,255,255,0.05)]",
          // Cast shadow
          position === "left"
            ? "shadow-[4px_0_20px_rgba(0,0,0,0.1)]"
            : "shadow-[-4px_0_20px_rgba(0,0,0,0.1)]"
        )}
        style={{ filter: REFRACT_FILTERS.EDGE }}
      />
      
      {/* Content Layer */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </aside>
  );
}

// ============================================
// REFRACTIVE MENU
// ============================================

interface RefractiveMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Menu animation state */
  isOpen?: boolean;
}

export function RefractiveMenu({
  className,
  isOpen = true,
  children,
  ...props
}: RefractiveMenuProps) {
  return (
    <div
      className={cn(
        "refractive-menu",
        "relative rounded-xl",
        // Animation container
        isOpen ? "pointer-events-auto" : "pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Refractive Background Layer */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl pointer-events-none",
          "bg-[rgba(20,20,35,calc(var(--lg-opacity,0.12)*3))]",
          "border border-[rgba(255,255,255,0.12)]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
          "shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)]",
          // Animation
          "transition-all duration-200 ease-out",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
        style={{ filter: REFRACT_FILTERS.SOFT }}
      />
      
      {/* Content Layer */}
      <div 
        className={cn(
          "relative z-10 overflow-hidden rounded-xl",
          "transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================
// GLASS CUTOUT TEXT
// ============================================

interface GlassCutoutTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Text element type */
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "p";
}

export function GlassCutoutText({
  as: Component = "span",
  className,
  children,
  ...props
}: GlassCutoutTextProps) {
  return (
    <Component
      className={cn(
        "glass-cutout-text",
        // Semi-transparent to show background through
        "text-[rgba(255,255,255,0.4)]",
        // Subtle emboss effect
        "drop-shadow-[0_1px_0_rgba(255,255,255,0.1)]",
        // Font styling
        "font-bold tracking-tight",
        className
      )}
      style={{
        filter: REFRACT_FILTERS.GLASS_CUTOUT,
        // Text magnifies and saturates background
        mixBlendMode: "overlay",
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

// ============================================
// REFRACTIVE PANEL (Generic container)
// ============================================

interface RefractivePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Panel variant */
  variant?: "elevated" | "inset" | "floating";
}

export function RefractivePanel({
  className,
  variant = "elevated",
  children,
  ...props
}: RefractivePanelProps) {
  const variantStyles = {
    elevated: cn(
      "bg-[rgba(255,255,255,var(--lg-opacity,0.08))]",
      "shadow-[0_8px_24px_-6px_rgba(0,0,0,0.2)]"
    ),
    inset: cn(
      "bg-[rgba(0,0,0,calc(var(--lg-opacity,0.08)*1.5))]",
      "shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
    ),
    floating: cn(
      "bg-[rgba(255,255,255,calc(var(--lg-opacity,0.08)*1.2))]",
      "shadow-[0_16px_48px_-12px_rgba(0,0,0,0.3)]"
    ),
  };

  return (
    <div
      className={cn(
        "refractive-panel",
        "relative rounded-xl",
        "transition-all duration-300",
        className
      )}
      {...props}
    >
      {/* Refractive Background Layer */}
      <div 
        className={cn(
          "absolute inset-0 rounded-xl pointer-events-none",
          "border border-[rgba(255,255,255,0.08)]",
          variantStyles[variant]
        )}
        style={{ filter: REFRACT_FILTERS.EDGE }}
      />
      
      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export {
  type ContrastMode,
  type RefractiveCardProps,
  type RefractiveSidebarProps,
  type RefractiveMenuProps,
  type GlassCutoutTextProps,
  type RefractivePanelProps,
};
