import type { Project } from "@/types";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import { getTaskStatusColor } from "@/lib";
import { Progress } from "../ui/progress";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  progress: number;
  workspaceId: string;
}

export const ProjectCard = ({
  project,
  progress,
  workspaceId,
}: ProjectCardProps) => {

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "On Hold":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Planning":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const projectManager = project.members?.find((m) => m.role === "manager")?.user;

  return (
    <Link to={`/workspaces/${workspaceId}/projects/${project._id}`}>
      <Card className="glass-card transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 hover:scale-[1.02] border-white/5 hover:border-primary/20 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white drop-shadow-sm">{project.title}</CardTitle>
            <span
              className={cn(
                "px-2 py-0.5 text-xs rounded-full font-medium border whitespace-nowrap shrink-0",
                getStatusColor(project.status)
              )}
            >
              {project.status}
            </span>
          </div>
          <CardDescription className="line-clamp-2 text-gray-300">
            {project.description || "No description"}
          </CardDescription>

          {projectManager && (
            <div className="mt-2 flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-md p-1.5 w-fit">
                 <span className="text-[10px] text-indigo-200 font-medium">
                    PM: <span className="text-white">{projectManager.name}</span>
                 </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">Progress:</div>
              <Progress
                value={progress}
                className={cn(
                  "h-2.5 flex-1 bg-white/5 border border-white/10",
                  project.status === "In Progress" && "[&>div]:bg-blue-500/80",
                  project.status === "Completed" && "[&>div]:bg-green-500/80",
                  project.status === "Cancelled" && "[&>div]:bg-red-500/80",
                  project.status === "On Hold" && "[&>div]:bg-yellow-500/80",
                  project.status === "Planning" && "[&>div]:bg-purple-500/80",
                  !["In Progress", "Completed", "Cancelled", "On Hold", "Planning"].includes(project.status) && "[&>div]:bg-cyan-500/80"
                )}
              />
              <span className="text-xs text-gray-400 font-medium">{progress}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm gap-2 text-gray-400">
                <span>{project.tasks.length}</span>
                <span>Tasks</span>
              </div>

              {project.dueDate && (
                <div className="flex items-center text-xs text-gray-400">
                  <CalendarDays className="w-4 h-4 mr-1" />
                  <span>{format(project.dueDate, "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
