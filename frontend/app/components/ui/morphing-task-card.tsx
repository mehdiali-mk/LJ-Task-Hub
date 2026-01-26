import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, Calendar, Clock, ArrowRight } from "lucide-react";
import { GlassCutoutText, useRefractive } from "./refractive-layout";

interface MorphingTaskCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  priority?: "high" | "medium" | "low";
  className?: string;
  onExpand?: () => void;
  onCollapse?: () => void;
}

export function MorphingTaskCard({
  id,
  title,
  description,
  date,
  priority = "medium",
  className,
  onExpand,
  onCollapse
}: MorphingTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Safely get context (in case used outside provider during testing, though root wraps it)
  const { setDeepFocus } = useRefractive();

  const handleExpand = () => {
    setIsExpanded(true);
    setDeepFocus(true);
    onExpand?.();
  };

  const handleCollapse = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsExpanded(false);
    setDeepFocus(false);
    onCollapse?.();
  };
  
  // Cleanup deep focus if component unmounts while expanded
  useEffect(() => {
    return () => {
      if (isExpanded) setDeepFocus(false);
    };
  }, [isExpanded, setDeepFocus]);

  return (
    <>
      <motion.div
        layoutId={`card-${id}`}
        onClick={handleExpand}
        className={cn(
          "relative overflow-hidden cursor-pointer",
          // Liquidate Effect: transition radius
          "rounded-2xl",
          "bg-[rgba(255,255,255,var(--lg-opacity,0.12))]",
          "border border-[rgba(255,255,255,0.1)]",
          "hover:bg-[rgba(255,255,255,calc(var(--lg-opacity,0.12)*1.5))]",
          "transition-colors duration-300",
          className
        )}
        style={{
          // Apply refractive filter to edge only
          backdropFilter: "blur(0px)", // Disable CSS blur
        }}
      >
        {/* Refractive background layer handled by parent or inherited styles */}
        <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />

        <div className="p-5 flex flex-col h-full relative z-10">
          <div className="flex justify-between items-start mb-3">
            <motion.div layoutId={`priority-${id}`}>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium border",
                priority === "high" ? "bg-red-500/20 border-red-500/30 text-red-200" :
                priority === "medium" ? "bg-amber-500/20 border-amber-500/30 text-amber-200" :
                "bg-blue-500/20 border-blue-500/30 text-blue-200"
              )}>
                {priority}
              </span>
            </motion.div>
            <motion.div layoutId={`date-${id}`} className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {date}
            </motion.div>
          </div>

          <motion.h3 
            layoutId={`title-${id}`}
            className="text-lg font-semibold text-white mb-2 leading-tight"
          >
            {title}
          </motion.h3>

          <motion.p 
            layoutId={`desc-${id}`}
            className="text-sm text-gray-400 line-clamp-2"
          >
            {description}
          </motion.p>
          
          <div className="mt-auto pt-4 flex justify-end">
             <div className="text-white/50 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                View Details <ArrowRight className="w-3 h-3" />
             </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <>
             {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={handleCollapse}
            />

            {/* Expanded Card - "Liquidate" into full view */}
            <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                layoutId={`card-${id}`}
                className={cn(
                  "w-full max-w-2xl h-[80vh] pointer-events-auto",
                  "flex flex-col overflow-hidden",
                  "bg-[#0f1115]", // Use solid opaque color or very dark refractive material
                  "border border-white/10",
                  "shadow-2xl"
                )}
                // Morphing radius
                style={{ borderRadius: 24 }}
              >
                {/* Header Image or Gradient */}
                <div className="h-40 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-background relative p-6">
                    <button 
                        onClick={handleCollapse}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <motion.div layoutId={`priority-${id}`} className="absolute top-6 left-6">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border",
                            priority === "high" ? "bg-red-500/20 border-red-500/30 text-red-100" :
                            priority === "medium" ? "bg-amber-500/20 border-amber-500/30 text-amber-100" :
                            "bg-blue-500/20 border-blue-500/30 text-blue-100"
                        )}>
                            {priority.toUpperCase()}
                        </span>
                    </motion.div>
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <motion.h2 
                            layoutId={`title-${id}`}
                            className="text-3xl font-bold text-white tracking-tight"
                        >
                            <GlassCutoutText as="span">{title}</GlassCutoutText>
                        </motion.h2>
                        
                        <motion.div layoutId={`date-${id}`} className="flex items-center gap-2 text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">Due {date}</span>
                        </motion.div>
                    </div>

                    <motion.p 
                        layoutId={`desc-${id}`}
                        className="text-lg text-gray-300 leading-relaxed mb-8"
                    >
                        {description}
                    </motion.p>
                    
                    {/* Placeholder for expanded content */}
                    <div className="space-y-6">
                        <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                        <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
                        
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Subtasks</h4>
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                        <div className="w-4 h-4 rounded-full border border-white/30" />
                                        <div className="h-2 bg-white/10 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
