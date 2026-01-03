import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { Workspace } from "@/types";
import { Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router";

interface WorkspaceCardProps {
  workspace: Workspace;
}

export const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  const navigate = useNavigate();

  return (
    <div 
        onClick={() => navigate(`/dashboard?workspaceId=${workspace._id}`)}
        className="cursor-pointer h-full"
    >
        <SpotlightCard className="!rounded-xl border-white/10 hover:border-white/20 transition-colors p-3">
            <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-2.5">
                    <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border-[2px]"
                        style={{ 
                            backgroundColor: workspace.color || "#3b82f6",
                            borderColor: "rgba(255, 255, 255, 0.8)", // High contrast white border 
                            boxShadow: `0 0 12px ${workspace.color || "#3b82f6"}` 
                        }}
                    >
                        {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white leading-tight">
                            {workspace.name}
                        </h3>
                    </div>
                </div>
                 <Badge 
                    variant="outline" 
                    className="text-[10px] font-bold h-5 px-2 backdrop-blur-md"
                    style={{
                        backgroundColor: workspace.color ? `${workspace.color}40` : "#3b82f640", // Stronger background tint
                        color: "#ffffff", // Pure white text for max contrast
                        borderColor: workspace.color || "#3b82f6", // Solid border matching color
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)" // Shadow to pop text
                    }}
                 >
                    Workspace
                </Badge>
            </div>

            <p className="text-[11px] text-gray-300 line-clamp-1 mb-2.5 font-normal leading-relaxed pl-1 tracking-wide">
                {workspace.description || "No description provided."}
            </p>

            <div className="mt-auto w-full pt-2 border-t border-white/10 flex items-center justify-between">
                 <div className="flex -space-x-1.5 hover:space-x-0.5 transition-all duration-300">
                    {workspace.members?.slice(0, 4).map((member, i) => (
                      <Avatar key={i} className="w-5 h-5 border-[1.5px] border-[#1a1a1a] shadow-lg transition-transform hover:scale-110 hover:z-10">
                        <AvatarImage src={member.user?.profilePicture} />
                        <AvatarFallback className="bg-zinc-700 text-zinc-300 text-[8px] font-bold">
                          {member.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {(workspace.members?.length || 0) > 4 && (
                      <div className="w-5 h-5 rounded-full border-[1.5px] border-[#1a1a1a] bg-zinc-700 flex items-center justify-center text-[8px] text-white font-bold shadow-lg z-10">
                        +{workspace.members.length - 4}
                      </div>
                    )}
                </div>

                <div className="flex items-center gap-3 text-[10px] font-semibold">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                        <Users className="w-3 h-3 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                        <span className="text-blue-100">{workspace.members?.length || 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        <Calendar className="w-3 h-3 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        <span className="text-emerald-100">{new Date(workspace.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
                    </div>
                </div>
            </div>
        </SpotlightCard>
    </div>
  );
};
