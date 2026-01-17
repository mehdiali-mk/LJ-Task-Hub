import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseProjectQuery } from "@/hooks/use-project";
import { getProjectProgress } from "@/lib";
import { cn } from "@/lib/utils";
import type { Project, Task, TaskStatus } from "@/types";
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ManageProjectMembersDialog } from "@/components/project/manage-project-members-dialog";
import { useAuth } from "@/provider/auth-context";
import { UseUpdateProject } from "@/hooks/use-project";
import { EditProjectDialog } from "@/components/project/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/project/delete-project-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";

const ProjectDetails = () => {
  const { projectId, workspaceId } = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const [isCreateTask, setIsCreateTask] = useState(false);
  const [isManageMembers, setIsManageMembers] = useState(false);
  const [isEditProject, setIsEditProject] = useState(false);
  const [isDeleteProject, setIsDeleteProject] = useState(false);

  // Check if user is Master Admin - SSR safe
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("admin_token"));
  }, []);

  const { user } = useAuth();
  const [taskFilter, setTaskFilter] = useState<TaskStatus | "All">("All");
  const { mutate: updateProject } = UseUpdateProject();

  const { data, isLoading } = UseProjectQuery(projectId!) as {
    data: {
      tasks: Task[];
      project: Project;
    };
    isLoading: boolean;
  };

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  const { project, tasks } = data;
  const projectProgress = getProjectProgress(tasks);

  // Permissions - Admin from localStorage takes priority
  const isWorkspaceManager = user?.managedWorkspaces?.includes(workspaceId!);
  const isProjectManager = project.members.some(m => m.user._id === user?._id && m.role === 'manager');
  
  const canEditProject = isAdmin || isWorkspaceManager;
  const canDeleteProject = isAdmin || isWorkspaceManager;
  const canManageStatus = isAdmin || isWorkspaceManager || isProjectManager;

  const handleTaskClick = (taskId: string) => {
    navigate(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <BackButton />
          <div className="flex items-center gap-3 group">
            <h1 className="text-xl md:text-2xl font-bold">{project.title}</h1>
            {canEditProject && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                    onClick={() => setIsEditProject(true)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            )}
          </div>
          {project.description && (
            <p className="text-sm text-gray-500">{project.description}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 min-w-60">
            <div className="text-sm text-muted-foreground">Progress:</div>
            <div className="flex-1">
              <Progress 
                value={projectProgress} 
                className={cn(
                  "h-3 bg-white/5 border border-white/10",
                  project.status === "In Progress" && "[&>div]:bg-blue-500/80",
                  project.status === "Completed" && "[&>div]:bg-green-500/80",
                  project.status === "Cancelled" && "[&>div]:bg-red-500/80",
                  project.status === "On Hold" && "[&>div]:bg-yellow-500/80",
                  project.status === "Planning" && "[&>div]:bg-purple-500/80",
                  !["In Progress", "Completed", "Cancelled", "On Hold", "Planning"].includes(project.status) && "[&>div]:bg-cyan-500/80"
                )} 
              />
            </div>
            <span className="text-sm text-gray-400 font-medium">
              {projectProgress}%
            </span>
          </div>

          {canManageStatus && (
            <Button 
              onClick={() => setIsCreateTask(true)} 
              className="bg-white/[0.08] backdrop-blur-xl border border-white/20 text-white hover:bg-white/[0.15] hover:border-white/30 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            >
              Add Task
            </Button>
          )}
          {canManageStatus && (
            <>
                <Select
                    value={project.status}
                    onValueChange={(value) => {
                        updateProject({ projectId: project._id, status: value });
                    }}
                >
                    <SelectTrigger className="w-[140px] bg-white/5 border-white/10 h-10">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={() => setIsManageMembers(true)} variant="outline">Manage Members</Button>
            </>
          )}
          {canDeleteProject && (
              <Button 
                variant="destructive" 
                size="icon" 
                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                onClick={() => setIsDeleteProject(true)}
              >
                  <Trash2 className="h-4 w-4" />
              </Button>
          )}
          {!canManageStatus && (
            <Badge variant="outline" className="h-10 px-4 text-base font-medium bg-white/5 border-white/10">
                {project.status}
            </Badge>
          )}
        </div>
      </div>
      
      <ManageProjectMembersDialog 
        isOpen={isManageMembers} 
        onOpenChange={setIsManageMembers} 
        project={project} 
      />

      <EditProjectDialog
        isOpen={isEditProject}
        onOpenChange={setIsEditProject}
        project={project}
      />

      <DeleteProjectDialog
        isOpen={isDeleteProject}
        onOpenChange={setIsDeleteProject}
        projectId={projectId!}
        workspaceId={workspaceId!}
        projectTitle={project.title}
      />

      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger 
                value="all" 
                onClick={() => setTaskFilter("All")}
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-gray-400"
              >
                All Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="todo" 
                onClick={() => setTaskFilter("To Do")}
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-gray-400"
              >
                To Do
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                onClick={() => setTaskFilter("In Progress")}
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-gray-400"
              >
                In Progress
              </TabsTrigger>
              <TabsTrigger 
                value="done" 
                onClick={() => setTaskFilter("Done")}
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-gray-400"
              >
                Done
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center text-sm">
              <span className="text-muted-foreground mr-2">Status:</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-white/5 border-white/10 text-white">
                  {tasks.filter((task) => task.status === "To Do").length} To Do
                </Badge>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-white">
                  {tasks.filter((task) => task.status === "In Progress").length}{" "}
                  In Progress
                </Badge>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-white">
                  {tasks.filter((task) => task.status === "Done").length} Done
                </Badge>
              </div>
            </div>
          </div>

          <TabsContent value="all" className="m-0">
            <div className="grid grid-cols-3 gap-4">
              <TaskColumn
                title="To Do"
                tasks={tasks.filter((task) => task.status === "To Do")}
                onTaskClick={handleTaskClick}
              />

              <TaskColumn
                title="In Progress"
                tasks={tasks.filter((task) => task.status === "In Progress")}
                onTaskClick={handleTaskClick}
              />

              <TaskColumn
                title="Done"
                tasks={tasks.filter((task) => task.status === "Done")}
                onTaskClick={handleTaskClick}
              />
            </div>
          </TabsContent>

          <TabsContent value="todo" className="m-0">
            <div className="grid md:grid-cols-1 gap-4">
              <TaskColumn
                title="To Do"
                tasks={tasks.filter((task) => task.status === "To Do")}
                onTaskClick={handleTaskClick}
                isFullWidth
              />
            </div>
          </TabsContent>

          <TabsContent value="in-progress" className="m-0">
            <div className="grid md:grid-cols-1 gap-4">
              <TaskColumn
                title="In Progress"
                tasks={tasks.filter((task) => task.status === "In Progress")}
                onTaskClick={handleTaskClick}
                isFullWidth
              />
            </div>
          </TabsContent>

          <TabsContent value="done" className="m-0">
            <div className="grid md:grid-cols-1 gap-4">
              <TaskColumn
                title="Done"
                tasks={tasks.filter((task) => task.status === "Done")}
                onTaskClick={handleTaskClick}
                isFullWidth
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* create    task dialog */}
      <CreateTaskDialog
        open={isCreateTask}
        onOpenChange={setIsCreateTask}
        projectId={projectId!}
        projectMembers={project.members as any}
      />
    </div>
  );
};

export default ProjectDetails;

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  isFullWidth?: boolean;
}

const TaskColumn = ({
  title,
  tasks,
  onTaskClick,
  isFullWidth = false,
}: TaskColumnProps) => {
  return (
    <div
      className={
        isFullWidth
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : ""
      }
    >
      <div
        className={cn(
          "space-y-4",
          !isFullWidth ? "h-full" : "col-span-full mb-4"
        )}
      >
        {!isFullWidth && (
          <div className="flex items-center justify-between">
            <h1 className="font-medium">{title}</h1>
            <Badge variant="outline">{tasks.length}</Badge>
          </div>
        )}

        <div
          className={cn(
            "space-y-3",
            isFullWidth && "grid grid-cols-2 lg:grid-cols-3 gap-4"
          )}
        >
          {tasks.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No tasks yet
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => onTaskClick(task._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onClick }: { task: Task; onClick: () => void }) => {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md transition-all duration-300 hover:translate-y-1"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge
            className={
              task.priority === "High"
                ? "bg-white/[0.08] backdrop-blur-sm text-red-400/90 border border-white/20"
                : task.priority === "Medium"
                ? "bg-white/[0.08] backdrop-blur-sm text-amber-400/90 border border-white/20"
                : "bg-white/[0.08] backdrop-blur-sm text-blue-400/90 border border-white/20"
            }
          >
            {task.priority}
          </Badge>

          <div className="flex gap-1">
            {task.status !== "To Do" && (
              <Button
                variant={"ghost"}
                size={"icon"}
                className="size-6 text-gray-400 hover:text-white hover:bg-white/10"
                onClick={() => {
                  console.log("mark as to do");
                }}
                title="Mark as To Do"
              >
                <AlertCircle className={cn("size-4")} />
                <span className="sr-only">Mark as To Do</span>
              </Button>
            )}
            {task.status !== "In Progress" && (
              <Button
                variant={"ghost"}
                size={"icon"}
                className="size-6 text-gray-400 hover:text-white hover:bg-white/10"
                onClick={() => {
                  console.log("mark as in progress");
                }}
                title="Mark as In Progress"
              >
                <Clock className={cn("size-4")} />
                <span className="sr-only">Mark as In Progress</span>
              </Button>
            )}
            {task.status !== "Done" && (
              <Button
                variant={"ghost"}
                size={"icon"}
                className="size-6 text-gray-400 hover:text-white hover:bg-white/10"
                onClick={() => {
                  console.log("mark as done");
                }}
                title="Mark as Done"
              >
                <CheckCircle className={cn("size-4")} />
                <span className="sr-only">Mark as Done</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <h4 className="ont-medium mb-2 text-white">{task.title}</h4>

        {task.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 5).map((member) => (
                  <Avatar
                    key={member._id}
                    className="relative size-8 bg-gray-700 rounded-full border-2 border-white/10 overflow-hidden"
                    title={member.name}
                  >
                    <AvatarImage src={member.profilePicture} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}

                {task.assignees.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    + {task.assignees.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          {task.dueDate && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Calendar className="size-3 mr-1" />
              {format(new Date(task.dueDate), "MMM d, yyyy")}
            </div>
          )}
        </div>
        {/* 5/10 subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {task.subtasks.filter((subtask) => subtask.completed).length} /{" "}
            {task.subtasks.length} subtasks
          </div>
        )}
      </CardContent>
    </Card>
  );
};
