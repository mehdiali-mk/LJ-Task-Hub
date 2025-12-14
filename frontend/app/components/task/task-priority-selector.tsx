import type { TaskPriority, TaskStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  useUpdateTaskPriorityMutation,
  useUpdateTaskStatusMutation,
} from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskPrioritySelector = ({
  priority,
  taskId,
}: {
  priority: TaskPriority;
  taskId: string;
}) => {
  const { mutate, isPending } = useUpdateTaskPriorityMutation();

  const handleStatusChange = (value: string) => {
    mutate(
      { taskId, priority: value as TaskPriority },
      {
        onSuccess: () => {
          toast.success("Priority updated successfully");
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
    <Select value={priority || ""} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white hover:bg-white/10" disabled={isPending}>
        <SelectValue placeholder="Priority" />
      </SelectTrigger>

      <SelectContent className="glass-card bg-black/90 border-white/10 text-white">
        <SelectItem value="Low" className="focus:bg-white/10 focus:text-white cursor-pointer">Low</SelectItem>
        <SelectItem value="Medium" className="focus:bg-white/10 focus:text-white cursor-pointer">Medium</SelectItem>
        <SelectItem value="High" className="focus:bg-white/10 focus:text-white cursor-pointer">High</SelectItem>
      </SelectContent>
    </Select>
  );
};
