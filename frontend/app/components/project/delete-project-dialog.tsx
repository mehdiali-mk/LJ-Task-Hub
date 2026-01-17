import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UseDeleteProject } from "@/hooks/use-project";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  workspaceId: string;
  projectTitle: string;
}

export const DeleteProjectDialog = ({
  isOpen,
  onOpenChange,
  projectId,
  workspaceId,
  projectTitle,
}: DeleteProjectDialogProps) => {
  const { mutate: deleteProject, isPending } = UseDeleteProject();
  const navigate = useNavigate();

  const handleDelete = () => {
    deleteProject(
      { projectId, workspaceId },
      {
        onSuccess: () => {
          toast.success("Project deleted successfully");
          onOpenChange(false);
          // Redirect to workspace details page
          navigate(`/workspaces/${workspaceId}`);
        },
        onError: () => {
          toast.error("Failed to delete project");
        },
      }
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-xl font-bold">Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/60">
            This action cannot be undone. This will permanently delete the project
            <span className="font-semibold text-white"> "{projectTitle}" </span>
            and all its tasks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border border-white/20"
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
