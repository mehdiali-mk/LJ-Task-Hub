import type { User, Workspace } from "@/types";
import { WorkspaceAvatar } from "./workspace-avatar";
import { Button } from "../ui/button";
import { Plus, UserPlus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { deleteData } from "@/lib/fetch-util";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { InviteMembersPrompt } from "./invite-members-prompt";
import { cn } from "@/lib/utils";

interface WorkspaceHeaderProps {
  workspace: Workspace;
  members: {
    _id: string;
    user: User;
    role: "admin" | "member" | "owner" | "viewer";
    joinedAt: Date;
  }[];
  onCreateProject: () => void;
  onInviteMember: () => void;
}

import { useAuth } from "@/provider/auth-context";

export const WorkspaceHeader = ({
  workspace,
  members,
  onCreateProject,
  onInviteMember,
}: WorkspaceHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is Master Admin - SSR safe
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInvitePrompt, setShowInvitePrompt] = useState(false);

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("admin_token"));
  }, []);

  // Role Checks - Only Admin and Workspace Manager have elevated permissions
  // (Owner field removed since only Admin creates workspaces)
  const isManager = user?.managedWorkspaces?.includes(workspace._id);

  // Check if workspace has regular members (excluding the admin who created it)
  const hasRegularMembers = members.filter(m => m.role !== "admin").length > 0;

  // Handle Create Project button click
  const handleCreateProjectClick = () => {
    if (!hasRegularMembers) {
      setShowInvitePrompt(true);
    } else {
      onCreateProject();
    }
  };

  const handleDeleteWorkspace = async () => {
    setIsDeleting(true);
    try {
      await deleteData(`/workspaces/${workspace._id}`);
      toast.success("Workspace deleted successfully");
      navigate("/workspaces");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete workspace");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-3">
          <div className="flex md:items-center gap-3">
            {workspace.color && (
              <WorkspaceAvatar color={workspace.color} name={workspace.name} />
            )}

            <h2 className="text-xl md:text-2xl font-semibold">
              {workspace.name}
            </h2>
          </div>

            {/* Action Buttons: Visible only to Admin or Workspace Manager */}
            {(isAdmin || isManager) && (
              <div className="flex items-center gap-3 justify-between md:justify-start mb-4 md:mb-0">
                <Button
                  variant={"outline"}
                  onClick={onInviteMember}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                >
                  <UserPlus className="size-4 mr-2" />
                  Invite
                </Button>
                <Button
                  onClick={handleCreateProjectClick}
                  className={cn(
                    "bg-white/[0.08] backdrop-blur-xl border border-white/20 text-white transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
                    hasRegularMembers 
                      ? "hover:bg-white/[0.15] hover:border-white/30" 
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Plus className="size-4 mr-2" />
                  Create Project
                </Button>
                {/* Delete Button - Admin Only */}
                {isAdmin && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                    title="Delete Workspace"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {workspace.description && (
          <p className="text-sm md:text-base text-muted-foreground">
            {workspace.description}
          </p>
        )}


      {/* Only show members section if there are regular (non-admin) members */}
      {hasRegularMembers && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Members</span>

          <div className="flex space-x-2">
            {members.filter(m => m.role !== "admin").map((member) => {
              // Skip if member.user is null/undefined
              if (!member.user) return null;
              
              // Check if this member is the workspace manager
              const isMemberManager = workspace.manager?._id === member.user._id || 
                               workspace.manager?.toString() === member.user._id?.toString();
              
              return (
                <Avatar
                  key={member._id}
                  className="relative h-8 w-8 rounded-full overflow-hidden"
                  style={{
                    border: isMemberManager 
                      ? `3px solid ${workspace.color || '#3b82f6'}` 
                      : '2px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: isMemberManager ? `0 0 8px ${workspace.color || '#3b82f6'}40` : 'none'
                  }}
                  title={isMemberManager ? `${member.user.name} (Workspace Manager)` : member.user.name}
                >
                  <AvatarImage
                    src={member.user.profilePicture}
                    alt={member.user.name}
                  />
                  <AvatarFallback>{member.user.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl font-bold">Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete "{workspace.name}"? This will permanently delete the workspace, all its projects, and all tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkspace}
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border border-white/20"
            >
              {isDeleting ? "Deleting..." : "Delete Workspace"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Members Prompt Popup */}
      <InviteMembersPrompt
        isOpen={showInvitePrompt}
        onClose={() => setShowInvitePrompt(false)}
        onInviteClick={onInviteMember}
      />
    </div>
  );
};
