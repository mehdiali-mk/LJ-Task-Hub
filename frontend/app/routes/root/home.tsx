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
    { title: "TaskForge - Sonic Flow" },
    { name: "description", content: "Project management that feels like your favorite playlist." },
  ];
}

const Homepage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden text-white selection:bg-white/30 isolate">
      {/* Background is handled by MeshBackground in root.tsx */}

      {/* Navigation */}
      <MarketingNavbar />

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 sm:pt-48 sm:pb-32 lg:pb-40 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10 space-y-8">

             
             <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-8 leading-none">
              <span className="text-glass-hero-morph">Orchestrate</span> <br/>
              <span className="text-glass-heading-morph">Your Success.</span>
            </h1>
            
            <p className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl mb-10 leading-relaxed font-light text-glass-subtitle">
              Transform chaos into clarity. Seamlessly plan, track, and deliver 
              projects with precision—empowering teams to achieve excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
              <Link to="/sign-up">
                <Button size="lg" className="btn-glass-morph rounded-full h-16 px-10 text-xl font-bold transition-all duration-500 border-none shadow-lg">
                  Get Started <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Interface Preview - Glass Card */}
          <div className="relative mt-12 mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-24 duration-1000 delay-200">
             <div className="rounded-3xl p-3 bg-white/[0.08] backdrop-blur-3xl border border-white/20 ring-1 ring-white/10 shadow-[0_20px_100px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_100px_rgba(0,255,255,0.1)] transition-shadow duration-700">
                 <div className="rounded-2xl overflow-hidden bg-black/80 aspect-[16/9] flex items-center justify-center relative shadow-inner border border-white/5 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-[#FFA500]/10 opacity-50 group-hover:opacity-75 transition-opacity duration-700"></div>
                     
                    {/* Demo Dashboard Content */} 
                    <div className="absolute inset-0 p-4 md:p-6 grid grid-cols-12 gap-3 md:gap-4">
                         {/* Sidebar */}
                         <div className="hidden md:flex col-span-2 glass-card rounded-xl h-full flex-col p-3 gap-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white">T</span>
                              </div>
                              <span className="text-[10px] font-bold text-white/90">TaskForge</span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/10">
                                <div className="w-3 h-3 rounded bg-cyan-400/30"></div>
                                <span className="text-[8px] text-white/80">Dashboard</span>
                              </div>
                              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5">
                                <div className="w-3 h-3 rounded bg-white/20"></div>
                                <span className="text-[8px] text-white/50">Projects</span>
                              </div>
                              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5">
                                <div className="w-3 h-3 rounded bg-white/20"></div>
                                <span className="text-[8px] text-white/50">My Tasks</span>
                              </div>
                              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5">
                                <div className="w-3 h-3 rounded bg-white/20"></div>
                                <span className="text-[8px] text-white/50">Members</span>
                              </div>
                            </div>
                            <div className="mt-auto">
                              <div className="flex items-center gap-2 px-2 py-1.5">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"></div>
                                <span className="text-[8px] text-white/70">John Doe</span>
                              </div>
                            </div>
                         </div>
                         
                         {/* Main Content */}
                         <div className="col-span-12 md:col-span-10 space-y-3 md:space-y-4 overflow-hidden">
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                   <div>
                                     <h2 className="text-xs md:text-sm font-bold text-white">Dashboard</h2>
                                     <p className="text-[8px] md:text-[10px] text-white/50">Welcome back to your workspace</p>
                                   </div>
                                   <div className="flex items-center gap-2">
                                     <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white/20"></div>
                                   </div>
                              </div>
                              
                              {/* Stats Cards */}
                              <div className="grid grid-cols-4 gap-2 md:gap-3">
                                   <div className="glass-card rounded-xl p-2 md:p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[7px] md:text-[9px] text-white/60 uppercase tracking-wide">Total Tasks</span>
                                        <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                                          <div className="w-2 h-2 rounded-sm bg-blue-400"></div>
                                        </div>
                                      </div>
                                      <p className="text-sm md:text-lg font-bold text-white">248</p>
                                      <p className="text-[7px] text-green-400">+12% this week</p>
                                   </div>
                                   <div className="glass-card rounded-xl p-2 md:p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[7px] md:text-[9px] text-white/60 uppercase tracking-wide">In Progress</span>
                                        <div className="w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                                          <div className="w-2 h-2 rounded-sm bg-orange-400"></div>
                                        </div>
                                      </div>
                                      <p className="text-sm md:text-lg font-bold text-white">64</p>
                                      <p className="text-[7px] text-orange-400">8 due today</p>
                                   </div>
                                   <div className="glass-card rounded-xl p-2 md:p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[7px] md:text-[9px] text-white/60 uppercase tracking-wide">Completed</span>
                                        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                          <div className="w-2 h-2 rounded-sm bg-green-400"></div>
                                        </div>
                                      </div>
                                      <p className="text-sm md:text-lg font-bold text-white">156</p>
                                      <p className="text-[7px] text-green-400">63% completion</p>
                                   </div>
                                   <div className="glass-card rounded-xl p-2 md:p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[7px] md:text-[9px] text-white/60 uppercase tracking-wide">Projects</span>
                                        <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                                          <div className="w-2 h-2 rounded-sm bg-purple-400"></div>
                                        </div>
                                      </div>
                                      <p className="text-sm md:text-lg font-bold text-white">12</p>
                                      <p className="text-[7px] text-purple-400">3 active</p>
                                   </div>
                              </div>
                              
                              {/* Charts & Tasks Row */}
                              <div className="grid grid-cols-12 gap-2 md:gap-3 flex-1">
                                   {/* Task Trends Chart */}
                                   <div className="col-span-5 glass-card rounded-xl p-2 md:p-3">
                                      <h3 className="text-[8px] md:text-[10px] font-semibold text-white/80 mb-2">Task Trends</h3>
                                      <div className="h-16 md:h-20 flex items-end justify-between gap-1 px-1">
                                        <div className="w-full h-[40%] bg-gradient-to-t from-cyan-500/60 to-cyan-400/30 rounded-t"></div>
                                        <div className="w-full h-[65%] bg-gradient-to-t from-cyan-500/60 to-cyan-400/30 rounded-t"></div>
                                        <div className="w-full h-[45%] bg-gradient-to-t from-cyan-500/60 to-cyan-400/30 rounded-t"></div>
                                        <div className="w-full h-[80%] bg-gradient-to-t from-cyan-500/60 to-cyan-400/30 rounded-t"></div>
                                        <div className="w-full h-[55%] bg-gradient-to-t from-cyan-500/60 to-cyan-400/30 rounded-t"></div>
                                        <div className="w-full h-[90%] bg-gradient-to-t from-cyan-500/60 to-cyan-400/30 rounded-t"></div>
                                        <div className="w-full h-[70%] bg-gradient-to-t from-cyan-500/60 to-cyan-400/30 rounded-t"></div>
                                      </div>
                                      <div className="flex justify-between mt-1 px-1">
                                        <span className="text-[6px] text-white/40">Mon</span>
                                        <span className="text-[6px] text-white/40">Tue</span>
                                        <span className="text-[6px] text-white/40">Wed</span>
                                        <span className="text-[6px] text-white/40">Thu</span>
                                        <span className="text-[6px] text-white/40">Fri</span>
                                        <span className="text-[6px] text-white/40">Sat</span>
                                        <span className="text-[6px] text-white/40">Sun</span>
                                      </div>
                                   </div>
                                   
                                   {/* Pie Charts */}
                                   <div className="col-span-3 glass-card rounded-xl p-2 md:p-3 flex flex-col items-center justify-center">
                                      <h3 className="text-[8px] md:text-[10px] font-semibold text-white/80 mb-2 self-start">Priority</h3>
                                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-red-500 border-t-yellow-400 border-r-green-400 border-b-blue-400 relative">
                                        <div className="absolute inset-2 rounded-full bg-black/60 flex items-center justify-center">
                                          <span className="text-[8px] font-bold text-white">100%</span>
                                        </div>
                                      </div>
                                      <div className="flex gap-2 mt-2">
                                        <div className="flex items-center gap-1">
                                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                          <span className="text-[6px] text-white/60">High</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                                          <span className="text-[6px] text-white/60">Med</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                          <span className="text-[6px] text-white/60">Low</span>
                                        </div>
                                      </div>
                                   </div>
                                   
                                   {/* Recent Projects */}
                                   <div className="col-span-4 glass-card rounded-xl p-2 md:p-3">
                                      <h3 className="text-[8px] md:text-[10px] font-semibold text-white/80 mb-2">Recent Projects</h3>
                                      <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                                          <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                                            <span className="text-[7px] font-bold text-white">W</span>
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-[8px] font-medium text-white/90">Website Redesign</p>
                                            <div className="w-full h-1 bg-white/10 rounded-full mt-0.5">
                                              <div className="w-3/4 h-full bg-cyan-400 rounded-full"></div>
                                            </div>
                                          </div>
                                          <span className="text-[7px] text-cyan-400">75%</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                                          <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                                            <span className="text-[7px] font-bold text-white">M</span>
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-[8px] font-medium text-white/90">Mobile App</p>
                                            <div className="w-full h-1 bg-white/10 rounded-full mt-0.5">
                                              <div className="w-1/2 h-full bg-purple-400 rounded-full"></div>
                                            </div>
                                          </div>
                                          <span className="text-[7px] text-purple-400">50%</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                                          <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-red-400 flex items-center justify-center">
                                            <span className="text-[7px] font-bold text-white">A</span>
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-[8px] font-medium text-white/90">API Integration</p>
                                            <div className="w-full h-1 bg-white/10 rounded-full mt-0.5">
                                              <div className="w-1/4 h-full bg-orange-400 rounded-full"></div>
                                            </div>
                                          </div>
                                          <span className="text-[7px] text-orange-400">25%</span>
                                        </div>
                                      </div>
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
            <h2 className="text-4xl font-black text-center mb-16 tracking-tighter text-glass-hero-morph">FEATURES</h2>
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
                  title: "Smart Automation", 
                  description: "Automate repetitive tasks and workflows to boost team efficiency.",
                  iconType: "gear", 
                  color: "#6366F1"
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
            <h2 className="text-4xl font-black text-center mb-16 tracking-tighter text-glass-hero-morph">TESTIMONIALS</h2>
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
                },
                {
                  name: "Emma W.",
                  role: "Project Manager",
                  expertise: "Agile Coach",
                  text: "TaskForge transformed how our team collaborates. The real-time sync is a game-changer for remote work.",
                  color: "#6366F1"
                },
                {
                  name: "David K.",
                  role: "CTO",
                  expertise: "Tech Leader",
                  text: "We evaluated 15 project management tools. TaskForge won hands down for its intuitive design and powerful features.",
                  color: "#10B981"
                },
                {
                  name: "Lisa R.",
                  role: "Marketing Lead",
                  expertise: "Growth Expert",
                  text: "The analytics dashboard gives us insights we never had before. Campaign tracking has never been easier.",
                  color: "#F59E0B"
                },
                {
                  name: "James H.",
                  role: "Startup Founder",
                  expertise: "Entrepreneur",
                  text: "From day one, TaskForge felt like it was built for startups. Fast, flexible, and scales with us.",
                  color: "#EC4899"
                },
                {
                  name: "Anna P.",
                  role: "Team Lead",
                  expertise: "Operations",
                  text: "Our productivity increased by 40% after switching to TaskForge. The automation features are incredible.",
                  color: "#8B5CF6"
                },
                {
                  name: "Chris B.",
                  role: "Freelancer",
                  expertise: "Solo Pro",
                  text: "As a solo professional, I need tools that don't slow me down. TaskForge is fast, minimal, and powerful.",
                  color: "#0EA5E9"
                },
                {
                  name: "Rachel L.",
                  role: "Agency Owner",
                  expertise: "Creative Director",
                  text: "Managing multiple client projects used to be chaos. TaskForge brought structure without killing creativity.",
                  color: "#EF4444"
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
