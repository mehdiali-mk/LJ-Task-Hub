import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefractiveIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  glowColor?: string;
}

export function RefractiveIcon({ 
  icon: Icon, 
  size = 24, 
  className,
  glowColor = "white"
}: RefractiveIconProps) {
  return (
    <div 
      className={cn(
        "relative group",
        "flex items-center justify-center",
        className
      )}
      style={{ width: size + 16, height: size + 16 }}
    >
      {/* 1. Translucent Glass Base */}
      <div 
        className={cn(
          "absolute inset-0 rounded-xl",
          "bg-white/[0.03] border border-white/10",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
          "transition-all duration-300",
          "group-hover:bg-white/[0.08] group-hover:border-white/20",
          "group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        )}
      />

      {/* 2. Refractive Glyph - The icon itself with refractive filter */}
      <div 
        className="relative z-10 transition-transform duration-300 group-hover:scale-110"
        style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}
      >
        <Icon 
          size={size} 
          className={cn(
            "text-white/80 transition-all duration-300",
            "group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
          )}
        />
      </div>

      {/* 3. Specular Top-Coat Glint */}
      <div 
        className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
      >
        <div 
          className={cn(
            "absolute -inset-full w-[200%] h-[200%]",
            "bg-gradient-to-br from-transparent via-white/10 to-transparent",
            "rotate-45 translate-x-[-100%] translate-y-[-100%]",
            "transition-transform duration-700 ease-out",
            "group-hover:translate-x-[50%] group-hover:translate-y-[50%]"
          )}
        />
      </div>
      
      {/* Internal Glow on Hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 20px ${glowColor === 'white' ? 'rgba(255,255,255,0.1)' : glowColor}`
        }}
      />
    </div>
  );
}
