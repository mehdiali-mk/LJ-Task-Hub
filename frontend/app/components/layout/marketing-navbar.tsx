import { Link } from "react-router";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function MarketingNavbar() {
  // SSR-safe auth check
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(!!(localStorage.getItem("token") || localStorage.getItem("admin_token")));
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/20 bg-white/[0.08] backdrop-blur-2xl ring-1 ring-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 group cursor-pointer nav-glass-logo">
            <div className="w-14 h-14 rounded-xl bg-white border border-white/50 flex items-center justify-center transition-all duration-300 backdrop-blur-md overflow-hidden
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
            <span className="font-bold text-2xl tracking-tighter text-white/90 group-hover:text-white transition-colors">TaskHub</span>
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
        </div>
      </div>
    </nav>
  );
}
