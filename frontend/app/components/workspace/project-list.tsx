import type { Project } from "@/types";
import { NoDataFound } from "../no-data-found";
import { ProjectCard } from "../project/projetc-card";

interface ProjectListProps {
  workspaceId: string;
  projects: Project[];

  onCreateProject: () => void;
  canCreateProject?: boolean;
}

export const ProjectList = ({
  workspaceId,
  projects,
  onCreateProject,
  canCreateProject = false,
}: ProjectListProps) => {
  return (
    <div>
      <h3 className="text-xl font-medium mb-4">Projects</h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <NoDataFound
            title="No projects found"
            description={canCreateProject ? "Create a project to get started" : "No active projects in this workspace"}
            buttonText={canCreateProject ? "Create Project" : undefined}
            buttonAction={canCreateProject ? onCreateProject : undefined}
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
