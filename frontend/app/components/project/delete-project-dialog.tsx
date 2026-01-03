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
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the project
            <span className="font-semibold text-white"> "{projectTitle}" </span>
            and all its tasks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
