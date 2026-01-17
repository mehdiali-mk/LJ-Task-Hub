import type { Task } from "@/types";
import { Link, useSearchParams } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";

export const UpcomingTasks = ({ data }: { data: Task[] }) => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  return (
    <Card className="glass-card border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Upcoming Tasks</CardTitle>
        <CardDescription className="text-gray-400">Here are the tasks that are due soon</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {data?.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No upcoming tasks yet
          </p>
        ) : (
          data?.map((task) => (
            <Link
              to={`/workspaces/${workspaceId}/projects/${task.project}/tasks/${task._id}`}
              key={task._id}
              className="flex items-start space-x-3 border-b border-white/10 pb-3 last:border-0 hover:bg-white/5 p-2 rounded-lg transition-colors"
            >
              <div
                className={cn(
                  "mt-0.5 rounded-full p-1",
                  task.priority === "High" && "bg-white/[0.08] backdrop-blur-sm text-red-400/90 border border-white/20",
                  task.priority === "Medium" && "bg-white/[0.08] backdrop-blur-sm text-amber-400/90 border border-white/20",
                  task.priority === "Low" && "bg-white/[0.08] backdrop-blur-sm text-blue-400/90 border border-white/20"
                )}
              >
                {task.status === "Done" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>

              <div className="space-y-1">
                <p className="font-medium text-sm md:text-base text-gray-200">{task.title}</p>
                <div className="flex items-center text-xs text-gray-400">
                  <span>{task.status}</span>
                  {task.dueDate && (
                    <>
                      <span className="mx-1"> - </span>
                      <span>
                        {format(new Date(task.dueDate), "MMM d, yyyy")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
};
