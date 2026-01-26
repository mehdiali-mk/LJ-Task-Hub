import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/provider/auth-context";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { putData } from "@/lib/fetch-util";
import type { Project } from "@/types";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { UseAddProjectMember, UseRemoveProjectMember } from "@/hooks/use-project";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ManageProjectMembersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export const ManageProjectMembersDialog = ({
  isOpen,
  onOpenChange,
  project,
}: ManageProjectMembersDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>("");

  // Helper to get workspace ID safely
  const getWorkspaceId = (workspace: any) => {
      if (typeof workspace === 'string') return workspace;
      return workspace._id;
  };

  const workspaceId = getWorkspaceId(project.workspace);
  const { data: workspaceData } = useGetWorkspaceDetailsQuery(workspaceId) as { data: any };
  const workspaceMembers = workspaceData?.members || [];

  // Filter out members with null user objects
  const validWorkspaceMembers = workspaceMembers.filter((wm: any) => wm.user && wm.user._id);
  const validProjectMembers = project.members.filter((pm: any) => pm.user && pm.user._id);

  // Filter out users who are already in the project
  const availableUsers = validWorkspaceMembers.filter(
      (wm: any) => !validProjectMembers.some((pm: any) => pm.user._id === wm.user._id)
  );

  // Role permissions
  const isWorkspaceManager = user?.managedWorkspaces?.includes(workspaceId);
  const isProjectManager = validProjectMembers.some(
    (m: any) => m.user._id === user?._id && m.role === "manager"
  );
  const isAdmin = user?.isAdmin;
  const canManage = isAdmin || isWorkspaceManager || isProjectManager;

  const { mutate: addMember, isPending: isAdding } = UseAddProjectMember();
  const { mutate: removeMember, isPending: isRemoving } = UseRemoveProjectMember();

  const handleAddMember = (userId: string) => {
      addMember(
          { projectId: project._id, userId, role: "contributor" },
          {
              onSuccess: () => {
                  toast.success("Member added successfully");
                  setSelectedUserToAdd("");
              },
              onError: () => toast.error("Failed to add member"),
          }
      );
  };

  const { mutate: updateRole, isPending: isUpdating } = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: string;
    }) => {
      await putData(`/projects/${project._id}/members/${memberId}`, { role });
    },
    onSuccess: () => {
      toast.success("Member role updated");
      queryClient.invalidateQueries({ queryKey: ["project", project._id] });
    },
    onError: () => {
      toast.error("Failed to update role");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Project Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
            {/* Add Member Section */}
            {canManage && (
                <div className="flex gap-2 items-center">
                    <Select value={selectedUserToAdd} onValueChange={setSelectedUserToAdd}>
                        <SelectTrigger className="flex-1 bg-white/5 border-white/10">
                            <SelectValue placeholder="Select user to add..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableUsers.length === 0 ? (
                                <div className="p-2 text-sm text-gray-500 text-center">No matching members found</div>
                            ) : (
                                availableUsers.map((wm: any) => (
                                    <SelectItem key={wm.user._id} value={wm.user._id}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={wm.user.profilePicture} />
                                                <AvatarFallback>{wm.user.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{wm.user.name}</span>
                                        </div>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <Button 
                        disabled={!selectedUserToAdd || isAdding}
                        onClick={() => handleAddMember(selectedUserToAdd)}
                    >
                        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </div>
            )}

          <div className="flex flex-col gap-3">
             <h3 className="text-sm font-medium text-gray-400">Current Members ({validProjectMembers.length})</h3>
            {validProjectMembers.map((member: any) => (
              <div
                key={member.user._id}
                className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between p-3 rounded-lg border border-white/5 bg-white/5"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Avatar>
                    <AvatarImage src={member.user.profilePicture} />
                    <AvatarFallback>{member.user.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{member.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 md:justify-start">
                    {canManage ? (
                    <Select
                        defaultValue={member.role}
                        onValueChange={(value) =>
                        updateRole({ memberId: member.user._id, role: value })
                        }
                        disabled={isUpdating}
                    >
                        <SelectTrigger className="w-[110px] h-8 text-xs bg-transparent border-white/10">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="contributor">Contributor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                    </Select>
                    ) : (
                    <span className="text-xs capitalize text-muted-foreground border border-white/10 px-2 py-1 rounded">
                        {member.role}
                    </span>
                    )}
                    
                    {canManage && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => {
                                removeMember({ projectId: project._id, memberId: member.user._id }, {
                                    onSuccess: () => toast.success("Member removed"),
                                    onError: () => toast.error("Failed to remove member")
                                });
                            }}
                            disabled={isRemoving}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
