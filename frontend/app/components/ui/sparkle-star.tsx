import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SparkleStarProps {
  className?: string;
  style?: React.CSSProperties;
}

export const SparkleStar = ({ className, style }: SparkleStarProps) => {
  // Generate particles with random directions
  const particles = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i * 360) / 8;
    const distance = 20; // Distance to travel
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * distance;
    const y = Math.sin(radian) * distance;
    
    return { x, y, delay: Math.random() * 0.2 };
  });

  return (
    <div className="relative inline-flex items-center justify-center">
        {/* Particles */}
        {particles.map((p, i) => (
            <div
                key={i}
                className="absolute w-1 h-1 bg-[#FFD700] rounded-full opacity-0 pointer-events-none group-hover:animate-[particle-burst_0.6s_ease-out_forwards]"
                style={{
                    // @ts-ignore - CSS variables for animation
                    "--x": `${p.x}px`,
                    "--y": `${p.y}px`,
                    animationDelay: `${p.delay}s`
                }}
            />
        ))}
        
        {/* Main Star */}
        <Star 
            className={cn("relative z-10", className)} 
            style={style}
        />
    </div>
  );
};
