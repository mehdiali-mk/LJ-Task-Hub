import React from "react";
import { cn } from "@/lib/utils";

export type DesignationType = "Developer" | "Designer" | "Manager" | "Product Owner" | "Other";

interface DesignationLabelProps {
  type: DesignationType | string;
  className?: string;
  editable?: boolean;
  onClick?: () => void;
}

const DESIGNATION_CONFIG: Record<string, { color: string; label: string }> = {
  Developer: { color: "text-emerald-400", label: "Developer" },
  Designer: { color: "text-purple-400", label: "Designer" },
  Manager: { color: "text-amber-400", label: "Manager" },
  "Product Owner": { color: "text-blue-400", label: "Product Owner" },
  Other: { color: "text-gray-400", label: "Professional" },
};

export function DesignationLabel({ type, className, editable, onClick }: DesignationLabelProps) {
  const config = DESIGNATION_CONFIG[type] || DESIGNATION_CONFIG.Other;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center px-4 py-1.5 overflow-hidden rounded-full cursor-default select-none group",
        editable && "cursor-pointer hover:scale-105 active:scale-95 transition-transform",
        className
      )}
    >
      {/* Etched Glass Background */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.2)]" />
      
      {/* Glow Effect on Hover (if editable) */}
      {editable && (
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
      )}

      {/* High Contrast Text */}
      <span
        className={cn(
          "relative text-xs font-bold tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
          config.color
        )}
      >
        {config.label}
      </span>
    </div>
  );
}
