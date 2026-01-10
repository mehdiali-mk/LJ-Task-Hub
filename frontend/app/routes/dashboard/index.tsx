import { RecentProjects } from "@/components/dashboard/recnt-projects";
import { StatsCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { Loader } from "@/components/loader";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { useGetWorkspacesQuery, useGetWorkspaceStatsQuery } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import type {
  Project,
  ProjectStatusData,
  StatsCardProps,
  Task,
  TaskPriorityData,
  TaskTrendsData,
  Workspace,
  WorkspaceProductivityData,
} from "@/types";
import { useNavigate, useSearchParams } from "react-router";
import { WorkspaceCard } from "@/components/dashboard/workspace-card";

const WorkspaceList = () => {
    const { data: workspaces, isLoading } = useGetWorkspacesQuery();
    const workspacesList = workspaces as unknown as Workspace[];

    if (isLoading) {
        return <div className="text-white">Loading workspaces...</div>;
    }

    if (!workspacesList || workspacesList.length === 0) {
        return <div className="text-white">No workspaces found.</div>;
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workspacesList.map((workspace: Workspace) => (
                <WorkspaceCard key={workspace._id} workspace={workspace} />
            ))}
        </div>
    );
};

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workspaceId = searchParams.get("workspaceId");

  const { data, isPending } = useGetWorkspaceStatsQuery(workspaceId!) as {
    data: {
      stats: StatsCardProps;
      taskTrendsData: TaskTrendsData[];
      projectStatusData: ProjectStatusData[];
      taskPriorityData: TaskPriorityData[];
      workspaceProductivityData: WorkspaceProductivityData[];
      upcomingTasks: Task[];
      recentProjects: Project[];
    };
    isPending: boolean;
  };

  if (!workspaceId) {
    return (
        <div className="relative min-h-[calc(100vh-4rem)] space-y-8 p-6 md:p-8 overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-black/20 backdrop-blur-xl">
            <div className="flex items-center justify-between animate-in slide-in-from-bottom-5 fade-in duration-700">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">Select a Workspace</h1>
                    <p className="text-gray-300 mt-1">Choose a workspace to view its dashboard.</p>
                </div>
            </div>
            <div className="animate-in slide-in-from-bottom-5 fade-in duration-700 delay-75">
                <WorkspaceList />
            </div>
        </div>
    );
  }

  if (isPending) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] space-y-8 2xl:space-y-12 p-6 md:p-8 overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-black/20 backdrop-blur-xl">

      <div className="flex items-center justify-between animate-in slide-in-from-bottom-5 fade-in duration-700">
        <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white transition-all duration-200"
            >
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">Dashboard</h1>
              <p className="text-gray-300 mt-1">Welcome back to your workspace.</p>
            </div>
        </div>
      </div>

      <div className="animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
        <StatsCard data={data?.stats} />
      </div>

      <div className="animate-in slide-in-from-bottom-7 fade-in duration-700 delay-200">
        <StatisticsCharts
          stats={data?.stats}
          taskTrendsData={data?.taskTrendsData}
          projectStatusData={data?.projectStatusData}
          taskPriorityData={data?.taskPriorityData}
          workspaceProductivityData={data?.workspaceProductivityData}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300">
        <RecentProjects data={data?.recentProjects} />
        <UpcomingTasks data={data?.upcomingTasks} />
      </div>
    </div>
  );
};

export default Dashboard;
