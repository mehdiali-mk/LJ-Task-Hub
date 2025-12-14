import { RecentProjects } from "@/components/dashboard/recnt-projects";
import { StatsCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { Loader } from "@/components/loader";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { useGetWorkspaceStatsQuery } from "@/hooks/use-workspace";
import type {
  Project,
  ProjectStatusData,
  StatsCardProps,
  Task,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import { useSearchParams } from "react-router";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
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

  if (isPending) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (

    <div className="relative min-h-[calc(100vh-4rem)] space-y-8 2xl:space-y-12 p-6 md:p-8 overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-black/20 backdrop-blur-xl">



      {/* Dynamic Background for Dashboard */}
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#00FFFF] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FFA500] rounded-full mix-blend-screen filter blur-[150px] opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-[#00FF00] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex items-center justify-between animate-in slide-in-from-bottom-5 fade-in duration-700">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">Dashboard</h1>
          <p className="text-gray-300 mt-1">Welcome back to your workspace.</p>
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
