import React, { useRef, useEffect } from "react";
import gsap from "gsap";

export function FluidBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);
  const blob4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Ambient Motion (Floating & Pulsing - Fluid Mesh)
      const blobs = [blob1Ref.current, blob2Ref.current, blob3Ref.current, blob4Ref.current];
      
      blobs.forEach((blob, i) => {
        if (!blob) return;
        
        // Liquid drift - Random large movements
        gsap.to(blob, {
          x: "random(-400, 400)", // Large range for full coverage
          y: "random(-400, 400)",
          scale: "random(0.8, 1.2)",
          duration: "random(40, 60)", // Slow, heavy fluid feel
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 2, // Staggered start
        });
        
        // Rotation for color mixing
        gsap.to(blob, {
          rotation: "random(0, 360)",
          duration: "random(20, 30)",
          repeat: -1,
          ease: "linear",
        });
      });

      // Mouse Interaction (Subtle Parallax for Depth)
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const xPct = (clientX / window.innerWidth - 0.5);
        const yPct = (clientY / window.innerHeight - 0.5);

        // Gentle parallax
        gsap.to(blobs, {
          xPercent: xPct * 10,
          yPercent: yPct * 10,
          duration: 3,
          ease: "power2.out",
          overwrite: "auto" // Prevent conflict with ambient
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden -z-50 bg-black pointer-events-none">
       {/* Dynamic Background: Apple Music Mesh Gradient (Neon Colors - No Glow) */}
        {/* Massive, blurred blobs for fluid mesh */}
        <div ref={blob1Ref} className="absolute top-[-20%] left-[-20%] w-[90vw] h-[90vw] bg-[#06B6D4] rounded-full filter blur-[200px] opacity-15"></div>
        <div ref={blob2Ref} className="absolute bottom-[-20%] right-[-20%] w-[90vw] h-[90vw] bg-[#EF4444] rounded-full filter blur-[200px] opacity-15"></div>
        <div ref={blob3Ref} className="absolute top-[20%] right-[10%] w-[90vw] h-[90vw] bg-[#A855F7] rounded-full filter blur-[200px] opacity-15"></div>
        <div ref={blob4Ref} className="absolute bottom-[10%] left-[10%] w-[90vw] h-[90vw] bg-[#1E1B4B] rounded-full filter blur-[200px] opacity-15"></div>
        
        {/* Grain Overlay - Subtle Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
    </div>
  );
}
