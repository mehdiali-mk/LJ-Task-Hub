import { cn } from "@/lib/utils";
import { UserPlus, Users, X } from "lucide-react";
import { Button } from "../ui/button";

interface InviteMembersPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteClick: () => void;
}

export const InviteMembersPrompt = ({
  isOpen,
  onClose,
  onInviteClick,
}: InviteMembersPromptProps) => {
  if (!isOpen) return null;

  const handleInviteClick = () => {
    onClose();
    onInviteClick();
  };

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md animate-in fade-in-0 duration-300"
        onClick={onClose}
      />

      {/* Glassmorphic Popup Container */}
      <div
        className={cn(
          "fixed top-1/2 left-1/2 z-50",
          "w-full max-w-md",
          "-translate-x-1/2 -translate-y-1/2",
          "animate-in fade-in-0 zoom-in-95 duration-300"
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl",
            // Glassmorphism - Frosted Glass Effect
            "bg-white/[0.08] backdrop-blur-3xl",
            "border border-white/20 ring-1 ring-white/10",
            // Shadow for depth
            "shadow-[0_20px_100px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
          )}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-110 group"
          >
            <X className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Icon Container with Glass Effect */}
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/20 flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(245,158,11,0.2)]">
              <Users className="w-10 h-10 text-amber-400" />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-black text-white tracking-tight mb-3">
              No Members Yet
            </h3>

            {/* Description */}
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              You need to invite at least one member to this workspace before you can create projects. The first member you invite will become the workspace manager.
            </p>

            {/* Action Button */}
            <Button
              onClick={handleInviteClick}
              className={cn(
                "w-full py-6 rounded-xl font-bold text-white",
                "bg-gradient-to-r from-amber-500 to-orange-500",
                "border border-white/20",
                "transition-all duration-300",
                "hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(245,158,11,0.4)]",
                "active:scale-[0.98]"
              )}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Invite Members
            </Button>

            {/* Subtle hint */}
            <p className="text-white/40 text-xs mt-4">
              Members can be assigned to projects and tasks
            </p>
          </div>

          {/* Decorative gradient orbs for extra glass depth */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </>
  );
};
