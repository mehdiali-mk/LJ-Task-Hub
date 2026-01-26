import { Link } from "react-router";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Github } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="relative mt-12 py-16 border-t border-white/10 
      bg-black/40 backdrop-blur-2xl
      shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 backdrop-blur-md overflow-hidden
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
              <h3 className="font-bold text-2xl tracking-tighter text-white/90 group-hover:text-white transition-colors">TaskForge</h3>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">Seamless Steps to Success.</p>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-white/60 font-semibold text-xs uppercase tracking-widest mb-4">Company</h4>
            <div className="flex flex-col gap-1">
              <Link to="/about" className="footer-glass-link">About</Link>
              <Link to="/contact" className="footer-glass-link">Contact</Link>
            </div>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-white/60 font-semibold text-xs uppercase tracking-widest mb-4">Support</h4>
            <div className="flex flex-col gap-1">
              <Link to="/support" className="footer-glass-link">Help Center</Link>
            </div>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="text-white/60 font-semibold text-xs uppercase tracking-widest mb-4">Legal</h4>
            <div className="flex flex-col gap-1">
              <Link to="/legal/privacy" className="footer-glass-link">Privacy Policy</Link>
              <Link to="/legal/terms" className="footer-glass-link">Terms of Service</Link>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10">
          <p className="text-white/40 text-sm">© TaskForge. All rights reserved.</p>
          <div className="flex gap-4">
            <a 
              href="https://x.com/mehdiali_mk" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors"
              aria-label="X"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a 
              href="https://github.com/mehdiali-mk" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
