import React, { useEffect, useRef } from "react";
import type { Route } from "../../+types/root";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowRight, Layout, Zap, Shield, Star, Quote, Layers } from "lucide-react";
import gsap from "gsap";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SparkleStar } from "@/components/ui/sparkle-star";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TaskHub - Sonic Flow" },
    { name: "description", content: "Project management that feels like your favorite playlist." },
  ];
}

const Homepage = () => {
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
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden text-white selection:bg-[#00FFFF]/30 isolate">
      {/* Dynamic Background: Apple Music Mesh Gradient (Neon Colors - No Glow) */}
      <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 bg-black">
        {/* Massive, blurred blobs for fluid mesh */}
        <div ref={blob1Ref} className="absolute top-[-20%] left-[-20%] w-[90vw] h-[90vw] bg-[#06B6D4] rounded-full filter blur-[200px] opacity-15"></div>
        <div ref={blob2Ref} className="absolute bottom-[-20%] right-[-20%] w-[90vw] h-[90vw] bg-[#EF4444] rounded-full filter blur-[200px] opacity-15"></div>
        <div ref={blob3Ref} className="absolute top-[20%] right-[10%] w-[90vw] h-[90vw] bg-[#A855F7] rounded-full filter blur-[200px] opacity-15"></div>
        <div ref={blob4Ref} className="absolute bottom-[10%] left-[10%] w-[90vw] h-[90vw] bg-[#1E1B4B] rounded-full filter blur-[200px] opacity-15"></div>
        
        {/* Grain Overlay - Subtle Texture */}

        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay pointer-events-none"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/20 bg-white/[0.08] backdrop-blur-2xl ring-1 ring-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 ring-1 ring-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors backdrop-blur-md shadow-inner">
                 <Layers className="text-[#00FFFF] w-6 h-6 group-hover:text-[#00FF00] transition-colors" />
              </div>
              <span className="font-bold text-2xl tracking-tighter text-white">TaskHub</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Features</a>
                <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Testimonials</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/sign-in" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Log In
              </Link>
              <Link to="/sign-up">
                <Button className="rounded-full bg-white text-black hover:bg-gray-200 hover:scale-105 transition-all duration-300 font-bold px-6 shadow-[0_0_20px_rgba(255,255,255,0.1)] border-0">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 sm:pt-48 sm:pb-32 lg:pb-40 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10 space-y-8">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[#00FF00] text-sm font-medium mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF00]"></span>
                </span>
                New: Sonic Flow Update
             </div>
             
             <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8 leading-none">
              Rhythm of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400 animate-pulse">Productivity.</span>
            </h1>
            
            <p className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-400 mb-10 leading-relaxed font-light">
              Manage projects with the fluidity of sound. 
              Immersive, responsive, and completely in tune with your team.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
              <Link to="/sign-up">
                <Button size="lg" className="rounded-full h-16 px-10 text-xl font-bold bg-white text-black hover:bg-gray-100 hover:scale-105 transition-all duration-500 border-none shadow-lg">
                  Start Listening <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Interface Preview - Glass Card */}
          <div className="relative mt-12 mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-24 duration-1000 delay-200">
             <div className="rounded-3xl p-3 bg-white/[0.08] backdrop-blur-3xl border border-white/20 ring-1 ring-white/10 shadow-[0_20px_100px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_100px_rgba(0,255,255,0.1)] transition-shadow duration-700">
                 <div className="rounded-2xl overflow-hidden bg-black/80 aspect-[16/9] flex items-center justify-center relative shadow-inner border border-white/5 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00FFFF]/10 via-transparent to-[#FFA500]/10 opacity-50 group-hover:opacity-75 transition-opacity duration-700"></div>
                     
                    {/* UI Mockup Content */} 
                    <div className="absolute inset-0 p-8 grid grid-cols-12 gap-6">
                         {/* Sidebar */}
                         <div className="hidden md:block col-span-3 glass-card rounded-2xl h-full opacity-60 flex flex-col p-4 gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/10"></div>
                            <div className="h-4 w-24 bg-white/10 rounded-full"></div>
                            <div className="h-4 w-32 bg-white/5 rounded-full"></div>
                             <div className="h-4 w-20 bg-white/5 rounded-full"></div>
                         </div>
                         {/* Main */}
                         <div className="col-span-12 md:col-span-9 space-y-6">
                              <div className="w-full h-20 glass-card rounded-2xl flex items-center justify-between px-8 opacity-80">
                                   <div className="w-48 h-6 bg-white/20 rounded-full"></div>
                                   <div className="w-10 h-10 rounded-full bg-[#00FFFF]/20 border border-[#00FFFF]/50"></div>
                              </div>
                              <div className="grid grid-cols-3 gap-6 h-48">
                                   <div className="glass-card-lime glass-card rounded-2xl opacity-70 p-4 relative overflow-hidden group/card hover:opacity-100 cursor-pointer">
                                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00FF00] shadow-[0_0_10px_#00FF00]"></div>
                                   </div>
                                   <div className="glass-card-orange glass-card rounded-2xl opacity-70 p-4 relative overflow-hidden group/card hover:opacity-100 cursor-pointer">
                                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FFA500] shadow-[0_0_10px_#FFA500]"></div>
                                   </div>
                                   <div className="glass-card rounded-2xl opacity-70 p-4 relative overflow-hidden group/card hover:opacity-100 cursor-pointer">
                                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00FFFF] shadow-[0_0_10px_#00FFFF]"></div>
                                   </div>
                              </div>
                         </div>
                    </div>
                 </div>
             </div>
          </div>
        </div>
      </div>




      {/* Features Section */}
      <div className="py-32 relative z-10" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black text-center mb-16 tracking-tighter bg-gradient-to-r from-white via-gray-400 to-white bg-clip-text text-transparent">FEATURES</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: "Fluid State", icon: Layout, desc: "Interfaces that adapt to your rhythm.", color: "#00FFFF" },
                    { title: "Live Sync", icon: Zap, desc: "Real-time updates, zero latency.", color: "#00FF00" },
                    { title: "Ironclad", icon: Shield, desc: "Security that never skips a beat.", color: "#FFA500" }
                ].map((feature, i) => (
                    <SpotlightCard key={i} className="min-h-[300px] flex flex-col justify-between group">
                         {/* Ambient Glow Background */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity duration-700" style={{ backgroundColor: feature.color }}></div>
                        
                        <div className="relative z-20">
                            <div 
                              className={`h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border transition-all duration-500 ${
                                i === 0 ? "border-cyan-500/50 text-cyan-400" :
                                i === 1 ? "border-purple-500/50 text-purple-400" :
                                "border-red-500/50 text-red-400"
                              }`}
                            >
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                            <p className="text-white/50 text-lg leading-relaxed font-light">
                                {feature.desc}
                            </p>
                        </div>
                    </SpotlightCard>
                ))}
            </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 relative z-10" id="testimonials">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black text-center mb-16 tracking-tighter bg-gradient-to-r from-white via-gray-400 to-white bg-clip-text text-transparent">TESTIMONIALS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Alex M.",
                    role: "Producer",
                    text: "It looks like a music app, but works like a powerhouse. Incredible.",
                    initial: "A",
                    color: "#00FFFF",
                    bg: "bg-[#00FFFF]"
                  },
                  {
                    name: "Sarah J.",
                    role: "Designer",
                    text: "The glassmorphism is perfect. Not too heavy, just right.",
                    initial: "S",
                    color: "#00FF00",
                    bg: "bg-[#00FF00]"
                  },
                  {
                    name: "Mike T.",
                    role: "Developer",
                    text: "Finally, a dark mode that actually feels 'dark' and not just gray.",
                    initial: "M",
                    color: "#FFA500",
                    bg: "bg-[#FFA500]"
                  }
                ].map((t, i) => (
                   <div key={i} className={`p-8 rounded-3xl relative flex flex-col gap-6 group hover:-translate-y-2 transition-all duration-500 bg-white/[0.08] backdrop-blur-3xl border border-white/20 ring-1 ring-white/10 shadow-xl hover:shadow-[0_0_50px_-12px_${t.color}]`}>
                       {/* Quote Icon Background Glow */}
                      <Quote className={`absolute top-6 right-6 text-white/5 w-12 h-12 group-hover:text-[${t.color}]/20 transition-colors duration-500`} />
                      
                      <div className="flex gap-1">
                         {[...Array(5)].map((_, j) => (
                             <SparkleStar 
                               key={j} 
                               className={`w-4 h-4 fill-current text-white/20 transition-all duration-300 group-hover:text-[#FFD700] group-hover:animate-sparkle`} 
                               style={{ animationDelay: `${j * 100}ms` }}
                             />
                         ))}
                      </div>
                      
                      <p className="text-white/80 text-lg font-light italic relative z-10">"{t.text}"</p>
                      
                      <div className="flex items-center gap-4 mt-auto">
                          <div className={`w-12 h-12 rounded-full ${t.bg} flex items-center justify-center font-bold text-black shadow-lg group-hover:scale-110 transition-transform duration-300 ring-2 ring-transparent group-hover:ring-white/50`}>
                             {t.initial}
                          </div>
                          <div>
                              <h4 className="font-bold text-white group-hover:text-[${t.color}] transition-colors">{t.name}</h4>
                              <p className="text-xs text-white/50 uppercase tracking-wider">{t.role}</p>
                          </div>
                      </div>
                   </div>
                ))}
            </div>
         </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
            <p className="text-white text-sm">© TaskHub. All rights reserved.</p>
            <div className="flex gap-6">
                <a href="#" className="text-white hover:text-[#00FFFF] transition-colors">Twitter</a>
                <a href="#" className="text-white hover:text-[#00FFFF] transition-colors">GitHub</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
