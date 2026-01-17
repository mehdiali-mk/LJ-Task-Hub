import { Loader } from "@/components/loader";
import { NoDataFound } from "@/components/no-data-found";
import { Button } from "@/components/ui/button";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { WorkspaceCard } from "@/components/dashboard/workspace-card";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

const Workspaces = () => {
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const { user } = useAuth();
  const { data: workspaces, isLoading } = useGetWorkspacesQuery() as {
    data: Workspace[];
    isLoading: boolean;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-3xl font-bold">Workspaces</h2>

          {user?.isAdmin && (
            <Button 
              onClick={() => setIsCreatingWorkspace(true)}
              className="bg-white/[0.08] backdrop-blur-xl border border-white/20 text-white hover:bg-white/[0.15] hover:border-white/30 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            >
              <PlusCircle className="size-4 mr-2" />
              New Workspace
            </Button>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <WorkspaceCard key={ws._id} workspace={ws} navigateToWorkspaceDetails={true} />
          ))}

          {workspaces.length === 0 && (
            <NoDataFound
              title="No workspaces found"
              description="Create a new workspace to get started"
              buttonText={user?.isAdmin ? "Create Workspace" : undefined}
              buttonAction={user?.isAdmin ? () => setIsCreatingWorkspace(true) : undefined}
            />
          )}
        </div>
      </div>

      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </>
  );
};

export default Workspaces;
