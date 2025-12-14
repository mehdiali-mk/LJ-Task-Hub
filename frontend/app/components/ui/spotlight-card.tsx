import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
}

export function SpotlightCard({
  children,
  className = "",
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(div, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseEnter = () => {
    setIsFocused(true);
    if (divRef.current) {
      gsap.to(divRef.current, { scale: 1.02, duration: 0.3, ease: "power2.out" });
    }
  };

  const handleMouseLeave = () => {
    setIsFocused(false);
    if (divRef.current) {
      gsap.to(divRef.current, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative h-full bg-white/[0.08] border border-white/20 ring-1 ring-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-3xl rounded-[2rem] overflow-hidden isolate transition-transform duration-300",
        className
      )}
    >
      {/* Mirror Gloss Overlay - Stronger for Apple feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col items-start gap-4">
        {children}
      </div>
    </div>
  );
}
