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

  return (
    <Link to={`/workspaces/${workspaceId}/projects/${project._id}`}>
      <Card className="glass-card transition-all duration-300 hover:shadow-md hover:translate-y-1 border-0">
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
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>

              <Progress
                value={progress}
                className={cn(
                  "h-2",
                  project.status === "In Progress" && "[&>div]:bg-blue-500/80 bg-blue-500/20",
                  project.status === "Completed" && "[&>div]:bg-green-500/80 bg-green-500/20",
                  project.status === "Cancelled" && "[&>div]:bg-red-500/80 bg-red-500/20",
                  project.status === "On Hold" && "[&>div]:bg-yellow-500/80 bg-yellow-500/20",
                  project.status === "Planning" && "[&>div]:bg-purple-500/80 bg-purple-500/20",
                  // fallback to cyan/primary if none match or default
                  !["In Progress", "Completed", "Cancelled", "On Hold", "Planning"].includes(project.status) && "[&>div]:bg-cyan-500/80 bg-cyan-500/20"
                )}
              />
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
