import React from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

export interface TimelineNodeProps {
  title: string;
  company: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  description?: string;
  isLast?: boolean;
}

export function TimelineNode({
  title,
  company,
  startDate,
  endDate,
  description,
  isLast = false,
}: TimelineNodeProps) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  
  const dateRange = `${format(start, "MMM yyyy")} - ${
    end ? format(end, "MMM yyyy") : "Present"
  }`;

  return (
    <div className="relative pl-8 pb-8 group">
      {/* Vertical Line */}
      {!isLast && (
        <div className="absolute left-[11px] top-[24px] bottom-0 w-[2px] bg-gradient-to-b from-white/20 to-transparent group-hover:from-[var(--primary)]/50 transition-colors duration-500" />
      )}

      {/* Glow Node */}
      <div className="absolute left-0 top-[6px] w-6 h-6 rounded-full border border-white/10 bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.1)] group-hover:shadow-[0_0_20px_var(--primary)] group-hover:border-[var(--primary)]/50 transition-all duration-300 z-10">
        <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-[var(--primary)] transition-colors duration-300" />
      </div>

      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h4 className="text-lg font-semibold text-glass-primary group-hover:text-[var(--primary)] transition-colors duration-300">
              {title}
            </h4>
            <span className="text-sm font-medium text-glass-secondary">{company}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-mono text-glass-muted px-2 py-1 rounded-full deep-glass-sm w-fit">
            <Calendar className="w-3 h-3" />
            {dateRange}
          </div>
        </div>

        {description && (
          <div className="text-sm text-glass-secondary leading-relaxed p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-[var(--primary)]/10 transition-colors">
             {description}
          </div>
        )}
      </div>
    </div>
  );
}
