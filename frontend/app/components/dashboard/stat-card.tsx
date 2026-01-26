import type { StatsCardProps } from "@/types";
import { RefractiveCard } from "../ui/refractive-layout";
import { LiquidProgress } from "../ui/liquid-progress";

export const StatsCard = ({ data }: { data: StatsCardProps }) => {
  const projectProgress = data?.totalProjects ? (data.totalProjectInProgress / data.totalProjects) * 100 : 0;
  const taskCompletion = data?.totalTasks ? (data.totalTaskCompleted / data.totalTasks) * 100 : 0;
  const todoPercentage = data?.totalTasks ? (data.totalTaskToDo / data.totalTasks) * 100 : 0;
  const inProgressPercentage = data?.totalTasks ? (data.totalTaskInProgress / data.totalTasks) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <RefractiveCard className="p-6 hover:translate-y-[-2px] transition-transform duration-300">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-gray-200">Total Projects</h3>
        </div>
        <div>
          <div className="text-2xl font-bold text-white mb-2">{data?.totalProjects}</div>
          <p className="text-xs text-gray-400 mb-3">
            {data?.totalProjectInProgress} in progress
          </p>
          <LiquidProgress value={projectProgress} className="h-2" showWave={false} />
        </div>
      </RefractiveCard>
      
      <RefractiveCard className="p-6 hover:translate-y-[-2px] transition-transform duration-300">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-gray-200">Total Tasks</h3>
        </div>
        <div>
          <div className="text-2xl font-bold text-white mb-2">{data?.totalTasks}</div>
          <p className="text-xs text-gray-400 mb-3">
            {data?.totalTaskCompleted} completed
          </p>
          <LiquidProgress value={taskCompletion} className="h-2" showWave={false} />
        </div>
      </RefractiveCard>
      
      <RefractiveCard className="p-6 hover:translate-y-[-2px] transition-transform duration-300">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-gray-200">To Do</h3>
        </div>
        <div>
          <div className="text-2xl font-bold text-white mb-2">{data?.totalTaskToDo}</div>
          <p className="text-xs text-gray-400 mb-3">
            Tasks waiting to be done
          </p>
          <LiquidProgress value={todoPercentage} className="h-2" color="hsl(35, 100%, 55%)" showWave={false} />
        </div>
      </RefractiveCard>
      
      <RefractiveCard className="p-6 hover:translate-y-[-2px] transition-transform duration-300">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-gray-200">In Progress</h3>
        </div>
        <div>
          <div className="text-2xl font-bold text-white mb-2">{data?.totalTaskInProgress}</div>
          <p className="text-xs text-gray-400 mb-3">
            Tasks currently in progress
          </p>
          <LiquidProgress value={inProgressPercentage} className="h-2" color="hsl(200, 100%, 50%)" showWave={true} />
        </div>
      </RefractiveCard>
    </div>
  );
};
