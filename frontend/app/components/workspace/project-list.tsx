import type { Project } from "@/types";
import { NoDataFound } from "../no-data-found";
import { ProjectCard } from "../project/projetc-card";

interface ProjectListProps {
  workspaceId: string;
  projects: Project[];
  onCreateProject: () => void;
  canCreateProject?: boolean;
  hasMembers?: boolean;
  onShowInvitePrompt?: () => void;
}

export const ProjectList = ({
  workspaceId,
  projects,
  onCreateProject,
  canCreateProject = false,
  hasMembers = true,
  onShowInvitePrompt,
}: ProjectListProps) => {
  // Determine the correct action when clicking the button
  const handleButtonClick = () => {
    if (!hasMembers && onShowInvitePrompt) {
      onShowInvitePrompt();
    } else {
      onCreateProject();
    }
  };

  // Determine description based on member status
  const getDescription = () => {
    if (!canCreateProject) return "No active projects in this workspace";
    if (!hasMembers) return "Invite members first to create projects";
    return "Create a project to get started";
  };

  return (
    <div>
      <h3 className="text-xl font-medium mb-4">Projects</h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <NoDataFound
            title="No projects found"
            description={getDescription()}
            buttonText={canCreateProject ? "Create Project" : undefined}
            buttonAction={canCreateProject ? handleButtonClick : undefined}
            disabled={!hasMembers}
          />
        ) : (
          projects.map((project) => {
            const projectProgress = project.progress || 0;

            return (
              <ProjectCard
                key={project._id}
                project={project}
                progress={projectProgress}
                workspaceId={workspaceId}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
