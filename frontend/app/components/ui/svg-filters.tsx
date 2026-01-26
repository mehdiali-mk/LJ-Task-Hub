import * as React from "react";

/**
 * SVG Refraction Filters
 * 
 * Provides SVG filter definitions for the Refractive Material System.
 * These filters create lens-like refraction effects using SVG displacement maps
 * instead of CSS backdrop-filter blur.
 * 
 * IOR (Index of Refraction) = 1.45
 * Displacement Scale = (IOR - 1.0) * 33 ≈ 15
 */

export function SVGFilters() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute", top: -9999, left: -9999, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <defs>
        {/* ============================================
            LENS REFRACT FILTER - IOR 1.45
            Main refraction effect for cards and panels
            ============================================ */}
        <filter
          id="refractLens"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          {/* Create edge-based displacement map from alpha channel */}
          <feGaussianBlur
            in="SourceAlpha"
            stdDeviation="12"
            result="blurredAlpha"
          />
          
          {/* Convert to displacement-ready grayscale (centered at 0.5) */}
          <feColorMatrix
            in="blurredAlpha"
            type="matrix"
            values="0 0 0 0 0.5
                    0 0 0 0 0.5
                    0 0 0 0 0.5
                    0 0 0 1 0"
            result="displaceBase"
          />
          
          {/* Create inward displacement gradient */}
          <feComponentTransfer in="displaceBase" result="displaceMap">
            <feFuncR type="linear" slope="0.3" intercept="0.35" />
            <feFuncG type="linear" slope="0.3" intercept="0.35" />
            <feFuncB type="linear" slope="0.3" intercept="0.35" />
            <feFuncA type="identity" />
          </feComponentTransfer>
          
          {/* Apply displacement to source - IOR 1.45 scaled */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="displaceMap"
            scale="15"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          
          {/* Subtle edge darkening for depth */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="edgeShadow" />
          <feColorMatrix
            in="edgeShadow"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0.15 0"
            result="shadowLayer"
          />
          
          {/* Composite: displaced content + edge shadow */}
          <feMerge>
            <feMergeNode in="shadowLayer" />
            <feMergeNode in="displaced" />
          </feMerge>
        </filter>

        {/* ============================================
            EDGE BEND FILTER
            Subtle edge-only refraction for borders
            ============================================ */}
        <filter
          id="refractEdge"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          {/* Detect edges using alpha gradient */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="innerBlur" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="outerBlur" />
          
          {/* Difference creates edge-only mask */}
          <feComposite
            in="innerBlur"
            in2="outerBlur"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="-1"
            k4="0"
            result="edgeMask"
          />
          
          {/* Convert edge mask to displacement */}
          <feColorMatrix
            in="edgeMask"
            type="matrix"
            values="0 0 0 0 0.5
                    0 0 0 0 0.5
                    0 0 0 0 0.5
                    0 0 0 2 0"
            result="edgeDisplace"
          />
          
          {/* Apply subtle displacement at edges only */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="edgeDisplace"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* ============================================
            GLASS CUTOUT FILTER
            Text appears as etched lens magnifying bg
            ============================================ */}
        <filter
          id="glassCutout"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          {/* Increase saturation of source */}
          <feColorMatrix
            in="SourceGraphic"
            type="saturate"
            values="1.3"
            result="saturated"
          />
          
          {/* Slight brightness boost for magnify effect */}
          <feComponentTransfer in="saturated" result="magnified">
            <feFuncR type="linear" slope="1.15" intercept="0.02" />
            <feFuncG type="linear" slope="1.15" intercept="0.02" />
            <feFuncB type="linear" slope="1.15" intercept="0.02" />
            <feFuncA type="identity" />
          </feComponentTransfer>
          
          {/* Subtle inner glow for etched effect */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="glowBlur" />
          <feColorMatrix
            in="glowBlur"
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0.3 0"
            result="innerGlow"
          />
          
          <feMerge>
            <feMergeNode in="magnified" />
            <feMergeNode in="innerGlow" />
          </feMerge>
        </filter>

        {/* ============================================
            SOFT REFRACT FILTER
            Lighter version for menus/dropdowns
            ============================================ */}
        <filter
          id="refractSoft"
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="softBlur" />
          
          <feColorMatrix
            in="softBlur"
            type="matrix"
            values="0 0 0 0 0.5
                    0 0 0 0 0.5
                    0 0 0 0 0.5
                    0 0 0 0.8 0"
            result="softDisplace"
          />
          
          <feDisplacementMap
            in="SourceGraphic"
            in2="softDisplace"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* ============================================
            TRANSMISSION SHADER
            Full transmission effect for overlays
            ============================================ */}
        <filter
          id="transmissionShader"
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          {/* Multi-layer displacement for chromatic effect */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="15" result="transBlur" />
          
          {/* Red channel displacement */}
          <feColorMatrix
            in="transBlur"
            type="matrix"
            values="0 0 0 0 0.52
                    0 0 0 0 0.5
                    0 0 0 0 0.48
                    0 0 0 1 0"
            result="chromaMap"
          />
          
          <feDisplacementMap
            in="SourceGraphic"
            in2="chromaMap"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="B"
            result="chromaDisplaced"
          />
          
          {/* Slight blur for transmission softness */}
          <feGaussianBlur in="chromaDisplaced" stdDeviation="0.5" />
        </filter>

        {/* ============================================
            LIQUID GLASS FILTER
            Solid glass block material for data viz
            ============================================ */}
        <filter
          id="liquidGlass"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          {/* Internal depth gradient */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="depthBlur" />
          <feColorMatrix
            in="depthBlur"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0.2 0"
            result="depthShadow"
          />
          
          {/* Specular highlight (top-left) */}
          <feOffset in="SourceAlpha" dx="-2" dy="-2" result="offsetAlpha" />
          <feGaussianBlur in="offsetAlpha" stdDeviation="2" result="specularBlur" />
          <feColorMatrix
            in="specularBlur"
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0.35 0"
            result="specular"
          />
          
          {/* Composite layers */}
          <feMerge>
            <feMergeNode in="depthShadow" />
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="specular" />
          </feMerge>
        </filter>

        {/* ============================================
            INTERNAL GLOW FILTER
            Hover glow effect for data points
            ============================================ */}
        <filter
          id="internalGlow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          {/* Create glow from source */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="glowBlur" />
          
          {/* Boost saturation and brightness */}
          <feColorMatrix
            in="glowBlur"
            type="matrix"
            values="1.2 0 0 0 0.1
                    0 1.2 0 0 0.1
                    0 0 1.2 0 0.1
                    0 0 0 0.7 0"
            result="boostedGlow"
          />
          
          {/* Merge glow behind source */}
          <feMerge>
            <feMergeNode in="boostedGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ============================================
            ELECTRO BLUE GLOW
            Specific glow for liquid progress
            ============================================ */}
        <filter
          id="electroBlueGlow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.2
                    0 0 0 0 0.7
                    0 0 0 0 1
                    0 0 0 0.8 0"
            result="blueGlow"
          />
          <feMerge>
            <feMergeNode in="blueGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ============================================
            GLASS TUBE FILTER
            3D glass tube effect for progress bars
            ============================================ */}
        <filter
          id="glassTube"
          x="-5%"
          y="-20%"
          width="110%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          {/* Bottom shadow for 3D */}
          <feOffset in="SourceAlpha" dx="0" dy="2" result="shadowOffset" />
          <feGaussianBlur in="shadowOffset" stdDeviation="2" result="shadowBlur" />
          <feColorMatrix
            in="shadowBlur"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0.3 0"
            result="shadow"
          />
          
          {/* Top highlight */}
          <feOffset in="SourceAlpha" dx="0" dy="-1" result="highlightOffset" />
          <feGaussianBlur in="highlightOffset" stdDeviation="1" result="highlightBlur" />
          <feColorMatrix
            in="highlightBlur"
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0.4 0"
            result="highlight"
          />
          
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="highlight" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Filter ID constants for use in components
 */
export const REFRACT_FILTERS = {
  LENS: "url(#refractLens)",
  EDGE: "url(#refractEdge)",
  GLASS_CUTOUT: "url(#glassCutout)",
  SOFT: "url(#refractSoft)",
  TRANSMISSION: "url(#transmissionShader)",
  // Liquid Glass Visualizations
  LIQUID_GLASS: "url(#liquidGlass)",
  INTERNAL_GLOW: "url(#internalGlow)",
  ELECTRO_BLUE_GLOW: "url(#electroBlueGlow)",
  GLASS_TUBE: "url(#glassTube)",
} as const;

export type RefractFilterType = keyof typeof REFRACT_FILTERS;
