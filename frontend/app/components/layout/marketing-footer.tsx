import { Link } from "react-router";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export function MarketingFooter() {
  return (
    <footer className="relative mt-12 py-16 border-t border-white/10 
      bg-black/40 backdrop-blur-2xl
      shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-white/50 flex items-center justify-center overflow-hidden shadow-lg">
                <DotLottieReact
                  src="https://lottie.host/2bd99e49-b27f-4ad1-a9fd-4c7272da3bbe/hgKC6qcLgu.lottie"
                  loop
                  autoplay
                  style={{ width: '48px', height: '48px', transform: 'scale(1.4)' }}
                />
              </div>
              <h3 className="text-glass-heading-morph text-2xl">TaskHub</h3>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">Project management that flows like music.</p>
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
          <p className="text-white/40 text-sm">© TaskHub. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="footer-glass-link">Twitter</a>
            <a href="#" className="footer-glass-link">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
