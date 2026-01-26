import { useEffect } from 'react';

// Lottie animation URL
const LOTTIE_URL = 'https://lottie.host/2bd99e49-b27f-4ad1-a9fd-4c7272da3bbe/hgKC6qcLgu.lottie';

/**
 * AnimatedFavicon Component
 * Loads the Lottie animation and renders frames to a canvas to create an animated favicon
 * Uses the same scaling as the navbar (56px with 1.4x scale)
 */
export function AnimatedFavicon() {
  useEffect(() => {
    let animationFrame: number;
    let player: any;
    let isDestroyed = false;
    
    const setupAnimatedFavicon = async () => {
      try {
        // Dynamically import dotlottie-player for SSR compatibility
        const { DotLottie } = await import('@lottiefiles/dotlottie-web');
        
        if (isDestroyed) return;
        
        // Create a larger canvas for higher quality (64x64 for retina displays)
        const faviconSize = 64;
        const canvas = document.createElement('canvas');
        canvas.width = faviconSize;
        canvas.height = faviconSize;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        // Create a larger canvas for Lottie rendering (matching navbar: 56px * 1.4 scale = ~78px)
        const lottieSize = 128; // High resolution for quality
        const lottieCanvas = document.createElement('canvas');
        lottieCanvas.width = lottieSize;
        lottieCanvas.height = lottieSize;
        
        // Initialize DotLottie player
        player = new DotLottie({
          canvas: lottieCanvas,
          src: LOTTIE_URL,
          autoplay: true,
          loop: true,
        });
        
        // Create or get favicon link element
        let faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        if (!faviconLink) {
          faviconLink = document.createElement('link');
          faviconLink.rel = 'icon';
          document.head.appendChild(faviconLink);
        }
        faviconLink.type = 'image/png';
        
        // Also update any shortcut icon links
        let shortcutIcon = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
        if (!shortcutIcon) {
          shortcutIcon = document.createElement('link');
          shortcutIcon.rel = 'shortcut icon';
          document.head.appendChild(shortcutIcon);
        }
        shortcutIcon.type = 'image/png';

        // Add apple touch icon for Safari/iOS
        let appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
        if (!appleTouchIcon) {
          appleTouchIcon = document.createElement('link');
          appleTouchIcon.rel = 'apple-touch-icon';
          document.head.appendChild(appleTouchIcon);
        }
        
        // Update favicon function
        const updateFavicon = () => {
          if (isDestroyed) return;
          
          try {
            // Clear canvas with glass-like background
            ctx.clearRect(0, 0, faviconSize, faviconSize);
            
            // Optional: Add a subtle glass background similar to navbar
            // Rounded rectangle background
            const cornerRadius = 12;
            ctx.beginPath();
            ctx.roundRect(0, 0, faviconSize, faviconSize, cornerRadius);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();
            
            // Add subtle border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw the Lottie animation centered and scaled up
            // Scale: we want to fill the canvas with 1.4x zoom like navbar
            const scale = 1.4;
            const drawSize = faviconSize * scale;
            const offset = (faviconSize - drawSize) / 2;
            
            ctx.drawImage(
              lottieCanvas, 
              0, 0, lottieSize, lottieSize,
              offset, offset, drawSize, drawSize
            );
            
            // Update all favicon links
            const dataUrl = canvas.toDataURL('image/png');
            faviconLink.href = dataUrl;
            shortcutIcon.href = dataUrl;
            appleTouchIcon.href = dataUrl;
          } catch (e) {
            // Ignore errors during rendering
          }
          
          animationFrame = requestAnimationFrame(updateFavicon);
        };
        
        // Start updating favicon after player loads
        player.addEventListener('load', () => {
          if (!isDestroyed) {
            updateFavicon();
          }
        });
        
      } catch (error) {
        console.warn('AnimatedFavicon: Could not initialize animated favicon', error);
      }
    };
    
    // Only run on client side
    if (typeof window !== 'undefined') {
      setupAnimatedFavicon();
    }
    
    return () => {
      isDestroyed = true;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (player) {
        player.destroy();
      }
    };
  }, []);
  
  return null;
}

export default AnimatedFavicon;
