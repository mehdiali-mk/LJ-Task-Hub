import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Workspace } from "@/types";
import { Users } from "lucide-react";
import { useNavigate } from "react-router";

interface WorkspaceCardProps {
  workspace: Workspace;
  navigateToWorkspaceDetails?: boolean;
}

export const WorkspaceCard = ({ workspace, navigateToWorkspaceDetails = false }: WorkspaceCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (navigateToWorkspaceDetails) {
      navigate(`/workspaces/${workspace._id}`);
    } else {
      navigate(`/dashboard?workspaceId=${workspace._id}`);
    }
  };

  return (
    <div 
        onClick={handleClick}
        className="cursor-pointer h-full"
    >
        <div className="glass-card !rounded-xl border-white/10 hover:border-white/20 transition-colors p-4 h-full flex flex-col items-start gap-4">

            <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-3">
                    <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold shadow-md backdrop-blur-sm"
                        style={{ 
                            backgroundColor: `${workspace.color || "#3b82f6"}20`,
                            borderWidth: "2px",
                            borderStyle: "solid",
                            borderColor: workspace.color || "#3b82f6",
                            color: workspace.color || "#3b82f6",
                            boxShadow: `0 0 12px ${workspace.color || "#3b82f6"}30`
                        }}
                    >
                        {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-base font-bold leading-tight text-glass-primary">
                            {workspace.name}
                        </h3>
                    </div>
                </div>
                 <Badge 
                    variant="outline" 
                    className="text-xs font-bold h-6 px-2.5 deep-glass-sm"
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

            <p className="text-sm line-clamp-2 mb-2.5 font-normal leading-relaxed pl-1 tracking-wide text-glass-secondary">
                {workspace.description || "No description provided."}
            </p>

            {workspace.manager && (
                <div className="mb-3 px-1">
                    <div className="flex items-center gap-2.5 bg-purple-500/10 border border-purple-500/20 rounded-md p-2 w-fit">
                         <Avatar className="w-5 h-5 border border-purple-400/50">
                            <AvatarImage src={workspace.manager.profilePicture} />
                            <AvatarFallback className="text-[10px] bg-purple-900 text-purple-200">
                                {workspace.manager.name.charAt(0)}
                            </AvatarFallback>
                         </Avatar>
                         <span className="text-xs text-purple-200 font-medium">
                            Manager: <span className="text-white">{workspace.manager.name}</span>
                         </span>
                    </div>
                </div>
            )}

            <div className="mt-auto w-full pt-3 border-t border-white/10 flex items-center justify-between">
                 <div className="flex gap-1.5">
                    {workspace.members?.slice(0, 4).map((member, i) => {
                      const userName = member.user?.name || 'User';
                      const initial = userName.charAt(0).toUpperCase();
                      
                      return (
                        <Avatar key={i} className="w-6 h-6 border-[1.5px] border-white/20 shadow-sm transition-transform hover:scale-110 hover:z-10">
                          <AvatarImage src={member.user?.profilePicture} />
                          <AvatarFallback className="bg-white/10 text-white/80 text-[10px] font-medium">
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                      );
                    })}
                    {(workspace.members?.length || 0) > 4 && (
                      <div className="w-6 h-6 rounded-full border-[1.5px] border-white/20 bg-white/10 flex items-center justify-center text-[10px] text-white/80 font-medium shadow-sm z-10">
                        +{workspace.members.length - 4}
                      </div>
                    )}
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <Users className="w-3.5 h-3.5 text-white/60" />
                        <span className="text-white/80">{workspace.members?.length || 1}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
