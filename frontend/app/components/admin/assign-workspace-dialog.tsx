import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postData } from "@/lib/fetch-util";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Workspace {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  managedWorkspaces: string[];
}

interface AssignWorkspaceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  workspaces: Workspace[];
  onSuccess?: () => void;
}

export const AssignWorkspaceDialog = ({
  isOpen,
  onOpenChange,
  user,
  workspaces,
  onSuccess,
}: AssignWorkspaceDialogProps) => {
  const queryClient = useQueryClient();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");

  const { mutate: assignManager, isPending } = useMutation({
    mutationFn: async ({
      userId,
      workspaceId,
    }: {
      userId: string;
      workspaceId: string;
    }) => {
      // Endpoint to assign/unassign manager
      await postData("/admin/assign-manager", { userId, workspaceId });
    },
    onSuccess: (data: any) => {
      const isRemoval = data?.message?.includes("removed");
      toast.success(
        isRemoval ? "Workspace Manager role removed" : "Workspace Manager role assigned"
      );
      if (onSuccess) onSuccess();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update manager role");
    },
  });

  if (!user) return null;

  const handleAssign = () => {
    if (!selectedWorkspaceId) return;
    assignManager({ userId: user._id, workspaceId: selectedWorkspaceId });
  };

  const handleRemove = (workspaceId: string) => {
     assignManager({ userId: user._id, workspaceId });
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Workspace Roles</DialogTitle>
          <DialogDescription>
            Assign or remove workspace management privileges for {user.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Roles */}
          <div>
             <h4 className="text-sm font-medium mb-2 text-muted-foreground">Current Managements</h4>
             <div className="flex flex-wrap gap-2">
                {user.managedWorkspaces.length === 0 ? (
                    <span className="text-xs text-gray-500 italic">No workspaces managed</span>
                ) : (
                    user.managedWorkspaces.map(wsId => {
                        const ws = workspaces.find(w => w._id === wsId);
                        return (
                            <Badge key={wsId} variant="secondary" className="gap-2 pr-1">
                                {ws?.name || "Unknown Workspace"}
                                <button 
                                    onClick={() => handleRemove(wsId)}
                                    disabled={isPending}
                                    className="ml-1 hover:bg-destructive/20 hover:text-destructive rounded-full p-0.5 transition-colors"
                                >
                                    &times;
                                </button>
                            </Badge>
                        );
                    })
                )}
             </div>
          </div>

          <div className="border-t border-white/10 my-2"></div>

          {/* Assign New */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Assign New Workspace</h4>
            <div className="flex gap-2">
                <Select value={selectedWorkspaceId} onValueChange={setSelectedWorkspaceId}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select workspace..." />
                </SelectTrigger>
                <SelectContent>
                    {workspaces
                        .filter(ws => !user.managedWorkspaces.includes(ws._id))
                        .map((ws) => (
                        <SelectItem key={ws._id} value={ws._id}>
                            {ws.name}
                        </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <Button onClick={handleAssign} disabled={!selectedWorkspaceId || isPending}>
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : "Assign"}
                </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
