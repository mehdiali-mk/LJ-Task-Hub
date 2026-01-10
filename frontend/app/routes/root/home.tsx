import React, { useRef } from "react";
import type { Route } from "../../+types/root";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowRight, Layers } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { FeaturesBentoGrid, Testimonials3DCarousel } from "@/components/ui/bento-motion";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TaskHub - Sonic Flow" },
    { name: "description", content: "Project management that feels like your favorite playlist." },
  ];
}

const Homepage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden text-white selection:bg-[#00FFFF]/30 isolate">
      {/* Background is handled by MeshBackground in root.tsx */}

      {/* Navigation */}
      <MarketingNavbar />

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 sm:pt-48 sm:pb-32 lg:pb-40 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10 space-y-8">

             
             <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-none">
              <span className="text-glass-hero">Rhythm of</span> <br/>
              <span className="text-glass-heading">Productivity.</span>
            </h1>
            
            <p className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl mb-10 leading-relaxed font-light text-glass-secondary">
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




      {/* Features Section - Bento Grid */}
      <div className="py-32 relative z-10" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black text-center mb-16 tracking-tighter text-glass-heading">FEATURES</h2>
            <FeaturesBentoGrid 
              features={[
                { 
                  title: "Fluid State", 
                  description: "Interfaces that adapt to your rhythm. Drag, drop, and flow through your projects with zero friction.",
                  iconType: "layout", 
                  color: "#A81B1B",
                  size: "lg"
                },
                { 
                  title: "Live Sync", 
                  description: "Real-time updates, zero latency. Your team stays connected.",
                  iconType: "zap", 
                  color: "#E8A040"
                },
                { 
                  title: "Ironclad", 
                  description: "Security that never skips a beat. End-to-end encryption.",
                  iconType: "shield", 
                  color: "#1A1A3E"
                },
                { 
                  title: "Team Harmony", 
                  description: "Collaborate seamlessly with unlimited members across all workspaces.",
                  iconType: "users", 
                  color: "#A81B1B"
                },
                { 
                  title: "Deep Insights", 
                  description: "Analytics that reveal the pulse of your productivity.",
                  iconType: "chart", 
                  color: "#E8A040",
                  size: "lg"
                },
                { 
                  title: "Access Control", 
                  description: "Granular permissions that put you in control.",
                  iconType: "lock", 
                  color: "#1A1A3E"
                }
              ]}
            />
        </div>
      </div>

      {/* Testimonials - 3D Carousel */}
      <div className="py-24 relative z-10" id="testimonials">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black text-center mb-16 tracking-tighter text-glass-heading">TESTIMONIALS</h2>
            <Testimonials3DCarousel 
              testimonials={[
                {
                  name: "Alex M.",
                  role: "Producer",
                  expertise: "Verified Expert",
                  text: "It looks like a music app, but works like a powerhouse. The dark aesthetic is absolutely stunning.",
                  color: "#A81B1B"
                },
                {
                  name: "Sarah J.",
                  role: "Designer",
                  expertise: "UI Specialist",
                  text: "The glassmorphism is perfect. Not too heavy, just right. Every interaction feels premium.",
                  color: "#E8A040"
                },
                {
                  name: "Mike T.",
                  role: "Developer",
                  expertise: "Full Stack",
                  text: "Finally, a dark mode that actually feels 'dark' and not just gray. The animations are buttery smooth.",
                  color: "#1A1A3E"
                }
              ]}
            />
         </div>
      </div>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
};

export default Homepage;
