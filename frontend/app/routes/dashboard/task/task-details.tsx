import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CommentSection } from "@/components/task/comment-section";
import { DeleteTaskDialog } from "@/components/task/delete-task-dialog";
import { SubTasksDetails } from "@/components/task/sub-tasks";
import { TaskActivity } from "@/components/task/task-activity";
import { TaskAssigneesSelector } from "@/components/task/task-assignees-selector";
import { TaskDescription } from "@/components/task/task-description";
import { TaskPrioritySelector } from "@/components/task/task-priority-selector";
import { TaskStatusSelector } from "@/components/task/task-status-selector";
import { TaskTitle } from "@/components/task/task-title";
import { Watchers } from "@/components/task/watchers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAchievedTaskMutation,
  useTaskByIdQuery,
  useWatchTaskMutation,
} from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import type { Project, Task } from "@/types";
import { format, formatDistanceToNow } from "date-fns";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const TaskDetails = () => {
  const { user } = useAuth();
  const { taskId, projectId, workspaceId } = useParams<{
    taskId: string;
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  // Check if user is Master Admin - SSR safe
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("admin_token"));
  }, []);

  const { data, isLoading } = useTaskByIdQuery(taskId!) as {
    data: {
      task: Task;
      project: Project;
    };
    isLoading: boolean;
  };
  const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: achievedTask, isPending: isAchieved } =
    useAchievedTaskMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Task not found</div>
      </div>
    );
  }

  const { task, project } = data;
  const isUserWatching = task?.watchers?.some(
    (watcher) => watcher._id.toString() === user?._id.toString()
  );

  const goBack = () => navigate(-1);

  const members = task?.assignees || [];

  const handleWatchTask = () => {
    watchTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success("Task watched");
        },
        onError: () => {
          toast.error("Failed to watch task");
        },
      }
    );
  };



  const handleAchievedTask = () => {
    achievedTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success("Task achieved");
        },
        onError: () => {
          toast.error("Failed to achieve task");
        },
      }
    );
  };



  const currentUserMember = project?.members?.find(
    (m) => m.user?._id === user?._id || m.user?.toString() === user?._id?.toString()
  );
  
  // Check if user is a Workspace Manager (has this workspace in their managedWorkspaces)
  const isWorkspaceManager = user?.managedWorkspaces?.some(
    (wsId) => wsId === workspaceId || wsId === project?.workspace?.toString()
  );
  
  // Admin users, Workspace Managers, or Project Managers get manager-level access
  const isManager = isAdmin || isWorkspaceManager || currentUserMember?.role === "manager";

  return (
    <>
    <div className="container mx-auto p-0 py-4 md:px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <BackButton />

          <h1 className="text-xl md:text-2xl font-bold">{task.title}</h1>

          {/* {task.isArchived && (
            <Badge className="ml-2" variant={"outline"}>
              Archived
            </Badge>
          )} */}
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          {false && (
            <Button
              variant={"ghost"}
              size="sm"
              onClick={handleWatchTask}
              className="w-fit bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white transition-all duration-200"
              disabled={isWatching}
            >
              {isUserWatching ? (
                <>
                  <EyeOff className="mr-2 size-4" />
                  Unwatch
                </>
              ) : (
                <>
                  <Eye className="mr-2 size-4" />
                  Watch
                </>
              )}
            </Button>
          )}

          {/* <Button
            variant={"ghost"}
            size="sm"
            onClick={handleAchievedTask}
            className="w-fit bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white transition-all duration-200"
            disabled={isAchieved}
          >
            {task.isArchived ? "Unarchive" : "Archive"}
          </Button> */}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4">
              <div>
                <Badge
                  className={
                    task.priority === "High"
                      ? "bg-white/[0.08] backdrop-blur-sm text-red-400/90 border border-white/20"
                      : task.priority === "Medium"
                      ? "bg-white/[0.08] backdrop-blur-sm text-amber-400/90 border border-white/20"
                      : "bg-white/[0.08] backdrop-blur-sm text-blue-400/90 border border-white/20"
                  }
                >
                  {task.priority} Priority
                </Badge>

                <TaskTitle title={task.title} taskId={task._id} isManager={isManager} />

                <div className="text-sm md:text-base text-muted-foreground">
                  Created at:{" "}
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <TaskStatusSelector status={task.status} taskId={task._id} isManager={isManager} />

                {isManager && (
                    <Button
                    variant={"destructive"}
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="hidden md:flex items-center gap-2"
                    >
                    <Trash2 className="w-4 h-4" />
                    Delete Task
                    </Button>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-0">
                Description
              </h3>

              <TaskDescription
                description={task.description || ""}
                taskId={task._id}
                isManager={isManager}
              />
            </div>

            <TaskAssigneesSelector
              task={task}
              assignees={task.assignees}
              projectMembers={project.members as any}
              isManager={isManager}
            />

            <TaskPrioritySelector priority={task.priority} taskId={task._id} isManager={isManager} />

            <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} />
          </div>

          <CommentSection taskId={task._id} members={project.members as any} canDeleteAnyComment={isManager} />
        </div>

        {/* right side */}
        <div className="w-full">
          {false && <Watchers watchers={task.watchers || []} />}

          <TaskActivity resourceId={task._id} />
        </div>
      </div>
    </div>

      <DeleteTaskDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        taskId={task._id}
        taskTitle={task.title}
      />
    </>
  );
};

export default TaskDetails;
