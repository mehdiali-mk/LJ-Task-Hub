import { Link } from "react-router";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 mt-12 bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">TaskHub</h3>
            <p className="text-gray-400 text-sm">Project management that flows like music.</p>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-gray-300 font-semibold text-sm uppercase tracking-wider mb-4">Company</h4>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-gray-400 hover:text-[#00FFFF] transition-colors text-sm">About</Link>
              <Link to="/contact" className="text-gray-400 hover:text-[#00FFFF] transition-colors text-sm">Contact</Link>
            </div>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-gray-300 font-semibold text-sm uppercase tracking-wider mb-4">Support</h4>
            <div className="flex flex-col gap-2">
              <Link to="/support" className="text-gray-400 hover:text-[#00FFFF] transition-colors text-sm">Help Center</Link>
            </div>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="text-gray-300 font-semibold text-sm uppercase tracking-wider mb-4">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link to="/privacy" className="text-gray-400 hover:text-[#00FFFF] transition-colors text-sm">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-[#00FFFF] transition-colors text-sm">Terms of Service</Link>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10 opacity-60 hover:opacity-100 transition-opacity">
          <p className="text-white text-sm">© TaskHub. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-white hover:text-[#00FFFF] transition-colors">Twitter</a>
            <a href="#" className="text-white hover:text-[#00FFFF] transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
