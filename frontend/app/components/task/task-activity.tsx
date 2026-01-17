import { fetchData } from "@/lib/fetch-util";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../loader";
import type { ActivityLog } from "@/types";
import { getActivityIcon } from "./task-icon";
import { formatDistanceToNow } from "date-fns";

// Helper to generate human-readable activity descriptions
const getActivityDescription = (activity: ActivityLog): string => {
  // If details.description exists, use it
  if (activity.details?.description) {
    return activity.details.description;
  }

  // Generate description based on action type
  const descriptions: Record<string, string> = {
    created_task: "created this task",
    updated_task: "updated this task",
    created_subtask: "added a subtask",
    updated_subtask: "updated a subtask",
    completed_task: "marked this task as completed",
    created_project: "created the project",
    updated_project: "updated the project",
    completed_project: "completed the project",
    created_workspace: "created a workspace",
    updated_workspace: "updated the workspace",
    added_comment: "added a comment",
    deleted_comment: "deleted a comment",
    added_member: "added a member",
    removed_member: "removed a member",
    joined_workspace: "joined the workspace",
    added_attachment: "added an attachment",
  };

  return descriptions[activity.action] || activity.action.replace(/_/g, " ");
};

export const TaskActivity = ({ resourceId }: { resourceId: string }) => {
  const { data, isPending } = useQuery({
    queryKey: ["task-activity", resourceId],
    queryFn: () => fetchData(`/tasks/${resourceId}/activity`),
  }) as {
    data: ActivityLog[];
    isPending: boolean;
  };

  if (isPending) return <Loader />;

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg text-muted-foreground mb-4">Activity</h3>

      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((activity) => (
            <div key={activity._id} className="flex gap-3 items-start">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {getActivityIcon(activity.action)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user?.name || "Master Admin"}</span>{" "}
                  <span className="text-muted-foreground">{getActivityDescription(activity)}</span>
                </p>
                
                {/* Timestamp */}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.createdAt ? (
                    formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
                  ) : (
                    "Unknown time"
                  )}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
        )}
      </div>
    </div>
  );
};
