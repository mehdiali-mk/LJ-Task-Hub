import type { TaskStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskStatusSelector = ({
  status,
  taskId,
  isManager,
}: {
  status: TaskStatus;
  taskId: string;
  isManager: boolean;
}) => {
  const { mutate, isPending } = useUpdateTaskStatusMutation();

  const handleStatusChange = (value: string) => {
    // Double check even though UI should disable it
    if (!isManager) return; 

    mutate(
      { taskId, status: value as TaskStatus },
      {
        onSuccess: () => {
          toast.success("Status updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };
  return (
    <Select value={status || ""} onValueChange={handleStatusChange} disabled={!isManager || isPending}>
      <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white hover:bg-white/10" disabled={isPending}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>

      <SelectContent className="glass-card bg-black/90 border-white/10 text-white">
        <SelectItem value="To Do" className="focus:bg-white/10 focus:text-white cursor-pointer">To Do</SelectItem>
        <SelectItem value="In Progress" className="focus:bg-white/10 focus:text-white cursor-pointer">In Progress</SelectItem>
        <SelectItem value="Done" className="focus:bg-white/10 focus:text-white cursor-pointer">Done</SelectItem>
      </SelectContent>
    </Select>
  );
};
