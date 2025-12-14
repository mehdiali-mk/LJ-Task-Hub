import type { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getProjectProgress, getTaskStatusColor } from "@/lib";
import { Link, useSearchParams } from "react-router";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";

export const RecentProjects = ({ data }: { data: Project[] }) => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

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
    <Card className="lg:col-spa-2 glass-card border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Recent Projects</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {data?.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No Recent project yet
          </p>
        ) : (
          data?.map((project) => {
            const projectProgress = getProjectProgress(project.tasks);

            return (
              <div key={project._id} className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to={`/workspaces${workspaceId}/projects/${project._id}`}
                  >
                    <h3 className="font-medium text-gray-100 hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                  </Link>

                  <span
                    className={cn(
                      "px-2 py-1 text-xs rounded-full font-semibold border",
                      getStatusColor(project.status)
                    )}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3 line-clamp-3">
                  {project.description}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Progress</span>
                    <span>{projectProgress}%</span>
                  </div>

                  <Progress
                    value={projectProgress}
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
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
