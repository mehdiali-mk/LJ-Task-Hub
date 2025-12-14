import { Link } from "react-router";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GlassNavbar() {
  return (
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
              <Link to="/#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Features</Link>
              <Link to="/#testimonials" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Testimonials</Link>
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
  );
}
