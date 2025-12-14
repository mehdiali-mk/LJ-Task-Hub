import type { StatsCardProps } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export const StatsCard = ({ data }: { data: StatsCardProps }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass-card border-none shadow-lg hover:bg-white/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-200">Total Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{data?.totalProjects}</div>
          <p className="text-xs text-gray-400 mt-1">
            {data?.totalProjectInProgress} in progress
          </p>
        </CardContent>
      </Card>
      <Card className="glass-card border-none shadow-lg hover:bg-white/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-200">Total Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{data?.totalTasks}</div>
          <p className="text-xs text-gray-400 mt-1">
            {data?.totalTaskCompleted} completed
          </p>
        </CardContent>
      </Card>
      <Card className="glass-card border-none shadow-lg hover:bg-white/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-200">To Do</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{data?.totalTaskToDo}</div>
          <p className="text-xs text-gray-400 mt-1">
            Tasks waiting to be done
          </p>
        </CardContent>
      </Card>
      <Card className="glass-card border-none shadow-lg hover:bg-white/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-200">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{data?.totalTaskInProgress}</div>
          <p className="text-xs text-gray-400 mt-1">
            Tasks currently in progress
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
