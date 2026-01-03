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
import { postData, putData } from "@/lib/fetch-util";
import type { Project, User } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

  // Role permissions
  const isWorkspaceManager = user?.managedWorkspaces?.includes(project.workspace._id);
  const isProjectManager = project.members.some(
    (m) => m.user._id === user?._id && m.role === "manager"
  );
  const isAdmin = user?.isAdmin;
  const canManage = isAdmin || isWorkspaceManager || isProjectManager;

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Project Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-3">
            {project.members.map((member) => (
              <div
                key={member.user._id}
                className="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.user.profilePicture} />
                    <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>

                {canManage ? (
                  <Select
                    defaultValue={member.role}
                    onValueChange={(value) =>
                      updateRole({ memberId: member.user._id, role: value })
                    }
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[110px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="contributor">Contributor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs capitalize text-muted-foreground border px-2 py-1 rounded">
                    {member.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
