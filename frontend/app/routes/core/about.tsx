import React from "react";
import { Layers, Users, Zap, Globe } from "lucide-react";

export function meta({}: any) {
  return [
    { title: "About Us - TaskHub" },
    { name: "description", content: "About TaskHub" },
  ];
}

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 space-y-24">
       {/* Hero */}
       <div className="text-center space-y-6">
           <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-glass-heading">
               We Orchestrate <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#00FF00]">Productivity.</span>
           </h1>
           <p className="text-xl text-glass-secondary max-w-2xl mx-auto leading-relaxed">
               TaskHub isn't just a project management tool. It's a rhythm engine for teams that want to move fast and stay in sync.
           </p>
       </div>

       {/* Mission Grid */}
       <div className="grid md:grid-cols-2 gap-8">
           <div className="rounded-3xl p-6 md:p-8 deep-glass hover:-translate-y-1 transition-all duration-300 group">
               <div className="w-12 h-12 rounded-2xl deep-glass-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                   <Zap className="w-6 h-6 text-[#FFA500]" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-4">Speed is Silence</h3>
               <p className="text-glass-secondary leading-relaxed">
                   We believe the best tools get out of your way. Our interface is designed to reduce friction to zero, allowing your ideas to flow directly into action.
               </p>
           </div>
           <div className="rounded-3xl p-6 md:p-8 deep-glass hover:-translate-y-1 transition-all duration-300 group">
               <div className="w-12 h-12 rounded-2xl deep-glass-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                   <Users className="w-6 h-6 text-[#00FFFF]" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-4">Radical Transparency</h3>
               <p className="text-glass-secondary leading-relaxed">
                   Silos kill momentum. TaskHub connects every member of your organization in a unified workspace where context is shared and barriers are dissolved.
               </p>
           </div>
       </div>

       {/* Stats */}
       <div className="rounded-[2rem] p-[1px] bg-gradient-to-b from-white/20 to-white/5 shadow-[0_20px_100px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_100px_rgba(0,255,255,0.1)] transition-shadow duration-700">
           <div className="rounded-[1.9rem] bg-white/[0.08] backdrop-blur-xl p-12 flex flex-col md:flex-row justify-around items-center gap-12 text-center md:text-left relative overflow-hidden">
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00FFFF]/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFA500]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
               <div className="relative z-10">
                   <div className="text-5xl font-black text-white mb-2 tracking-tighter">10k+</div>
                   <div className="text-glass-secondary font-medium uppercase tracking-widest text-sm">Teams Synced</div>
               </div>
               <div className="w-full h-px md:w-px md:h-24 bg-white/10"></div>
               <div className="relative z-10">
                   <div className="text-5xl font-black text-white mb-2 tracking-tighter">1M+</div>
                   <div className="text-glass-secondary font-medium uppercase tracking-widest text-sm">Tasks Completed</div>
               </div>
               <div className="w-full h-px md:w-px md:h-24 bg-white/10"></div>
               <div className="relative z-10">
                   <div className="text-5xl font-black text-white mb-2 tracking-tighter">99.9%</div>
                   <div className="text-glass-secondary font-medium uppercase tracking-widest text-sm">Uptime</div>
               </div>
           </div>
       </div>


    </div>
  );
}
