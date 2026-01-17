import React from "react";
import { Outlet } from "react-router";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default function CoreLayout() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white selection:bg-white/30 isolate flex flex-col">
       {/* Background is handled by MeshBackground in root.tsx */}
       
       <MarketingNavbar />
       
       <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
         <div className="animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
            <Outlet />
         </div>
       </main>

       <MarketingFooter />
    </div>
  );
}
