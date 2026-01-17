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
import { useDeleteTaskMutation } from "@/hooks/use-task";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface DeleteTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskTitle: string;
}

export const DeleteTaskDialog = ({
  isOpen,
  onOpenChange,
  taskId,
  taskTitle,
}: DeleteTaskDialogProps) => {
  const { mutate: deleteTask, isPending } = useDeleteTaskMutation();
  const navigate = useNavigate();

  const handleDelete = () => {
    deleteTask(taskId, {
      onSuccess: () => {
        toast.success("Task deleted successfully");
        onOpenChange(false);
        navigate(-1);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete task");
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-xl font-bold">Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/60">
            This action cannot be undone. This will permanently delete the task
            <span className="font-semibold text-white"> "{taskTitle}" </span>
            and all its subtasks.
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
            {isPending ? "Deleting..." : "Delete Task"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
