import { Link } from "react-router";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function MarketingNavbar() {
  // SSR-safe auth check
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!(localStorage.getItem("token") || localStorage.getItem("admin_token")));
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/10 bg-white/5 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/5">
      {/* Refractive Background Layer - Static Glass */}
      <div className="absolute inset-0 pointer-events-none shadow-sm" />
      
      {/* Content Layer */}
      <div className="relative z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 group cursor-pointer nav-glass-logo">
            <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 backdrop-blur-md overflow-hidden relative z-10
              group-hover:bg-white
              group-hover:border-white/70
              group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.2),0_0_20px_rgba(255,255,255,0.15)]
              group-hover:-translate-y-0.5">
               <DotLottieReact
                 src="https://lottie.host/2bd99e49-b27f-4ad1-a9fd-4c7272da3bbe/hgKC6qcLgu.lottie"
                 loop
                 autoplay
                 style={{ width: '56px', height: '56px', transform: 'scale(1.4)' }}
               />
            </div>
            <span className="font-bold text-2xl tracking-tighter text-white/90 group-hover:text-white transition-colors relative z-10">TaskForge</span>
          </Link>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              <Link to="/#features" className="nav-glass-link">Features</Link>
              <Link to="/#testimonials" className="nav-glass-link">Testimonials</Link>
              <Link to="/about" className="nav-glass-link">About</Link>
              <Link to="/support" className="nav-glass-link">Support</Link>
              <Link to="/contact" className="nav-glass-link">Contact</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <Link to="/dashboard" className="nav-glass-link font-bold">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/sign-in" className="nav-glass-link">
                    Log In
                  </Link>
                  <Link to="/sign-up" className="nav-glass-link">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center relative z-50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:bg-white/10"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Frosted Glass */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-0 right-0 h-[calc(100vh-5rem)] z-40 bg-black/60 backdrop-blur-3xl pt-8 px-6 animate-in fade-in slide-in-from-top-2 duration-300 flex flex-col border-t border-white/10">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/#features" 
              className="text-xl font-medium text-white/90 py-3 border-b border-white/10 hover:text-white transition-colors tracking-tight"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/#testimonials" 
              className="text-xl font-medium text-white/90 py-3 border-b border-white/10 hover:text-white transition-colors tracking-tight"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link 
              to="/about" 
              className="text-xl font-medium text-white/90 py-3 border-b border-white/10 hover:text-white transition-colors tracking-tight"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/support" 
              className="text-xl font-medium text-white/90 py-3 border-b border-white/10 hover:text-white transition-colors tracking-tight"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Support
            </Link>
            <Link 
              to="/contact" 
              className="text-xl font-medium text-white/90 py-3 border-b border-white/10 hover:text-white transition-colors tracking-tight"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            <div className="pt-6 flex flex-col gap-3">
              {isLoggedIn ? (
                 <Link 
                   to="/dashboard" 
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="w-full"
                 >
                  <Button className="w-full btn-glass-morph text-lg py-6 font-semibold shadow-lg">
                    Go to Dashboard
                  </Button>
                 </Link>
              ) : (
                <>
                  <Link 
                    to="/sign-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button variant="ghost" className="w-full text-white/80 hover:text-white text-lg py-6 border border-white/10 backdrop-blur-sm">
                      Log In
                    </Button>
                  </Link>
                  <Link 
                    to="/sign-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button className="w-full btn-glass-morph text-lg py-6 font-semibold shadow-lg">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
