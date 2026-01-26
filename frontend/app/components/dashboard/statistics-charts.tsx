import type {
  ProjectStatusData,
  StatsCardProps,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import {
  ChartLine,
  ChartPie,
  ChartBarBig,
} from "lucide-react";
import {
  RefractiveCard,
  GlassCutoutText,
} from "../ui/refractive-layout";
import { RefractiveBarChart } from "../ui/refractive-bar-chart";
import { LiquidPieChart } from "../ui/liquid-pie-chart";

// Keep Recharts for Line Chart (Trends) as it wasn't requested to be replaced by a bar chart
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "../ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

interface StatisticsChartsProps {
  stats: StatsCardProps;
  taskTrendsData: TaskTrendsData[];
  projectStatusData: ProjectStatusData[];
  taskPriorityData: TaskPriorityData[];
  workspaceProductivityData: WorkspaceProductivityData[];
}

export const StatisticsCharts = ({
  stats,
  taskTrendsData,
  projectStatusData,
  taskPriorityData,
  workspaceProductivityData,
}: StatisticsChartsProps) => {
  // Transform data for RefractiveBarChart
  const productivityData = workspaceProductivityData.map(d => ({
    label: d.name,
    value: d.completed,
    color: "#3b82f6"
  }));

  // Transform data for LiquidPieChart
  const statusData = projectStatusData.map(d => ({
    label: d.name,
    value: d.value,
    color: d.color
  }));

  const priorityData = taskPriorityData.map(d => ({
    label: d.name,
    value: d.value,
    color: d.color
  }));

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {/* Task Trends - Kept as Line Chart but in Refractive Card */}
      <RefractiveCard className="lg:col-span-2 p-6">
        <div className="flex flex-row items-center justify-between pb-6">
          <div className="space-y-1">
            <GlassCutoutText as="h3" className="text-lg">Task Trends</GlassCutoutText>
            <p className="text-sm text-gray-400">Daily task status changes</p>
          </div>
          <ChartLine className="size-5 text-gray-400/50" />
        </div>
        <div className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
             <ChartContainer
              className="h-[300px] w-full"
              config={{
                completed: { color: "#10b981" },
                inProgress: { color: "#f59e0b" },
                todo: { color: "#3b82f6" },
              }}
            >
              <LineChart data={taskTrendsData}>
                <XAxis
                  dataKey={"name"}
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <CartesianGrid strokeDasharray={"3 3"} vertical={false} stroke="rgba(255,255,255,0.05)" />
                <ChartTooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <Line type="monotone" dataKey={"completed"} stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="inProgress" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="todo" stroke="#6b7280" strokeWidth={2} dot={{ r: 4 }} />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </RefractiveCard>

      {/* Project Status - Liquid Pie Chart */}
      <RefractiveCard className="flex flex-col p-6">
        <div className="flex flex-row items-center justify-between pb-6">
          <div className="space-y-1">
            <GlassCutoutText as="h3" className="text-lg">Project Status</GlassCutoutText>
            <p className="text-sm text-gray-400">Project status breakdown</p>
          </div>
          <ChartPie className="size-5 text-gray-400/50" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <LiquidPieChart 
            data={statusData}
            size={220}
            innerRadius={60}
            showLegend={true}
            className="scale-90"
          />
        </div>
      </RefractiveCard>

      {/* Task Priority - Liquid Pie Chart */}
      <RefractiveCard className="flex flex-col p-6">
        <div className="flex flex-row items-center justify-between pb-6">
          <div className="space-y-1">
            <GlassCutoutText as="h3" className="text-lg">Task Priority</GlassCutoutText>
            <p className="text-sm text-gray-400">Task priority breakdown</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
           <LiquidPieChart 
            data={priorityData}
            size={220}
            innerRadius={0} // Full pie
            showLegend={true}
            className="scale-90"
          />
        </div>
      </RefractiveCard>

      {/* Workspace Productivity - Refractive Bar Chart */}
      <RefractiveCard className="lg:col-span-2 p-6">
        <div className="flex flex-row items-center justify-between pb-6">
          <div className="space-y-1">
            <GlassCutoutText as="h3" className="text-lg">Workspace Productivity</GlassCutoutText>
            <p className="text-sm text-gray-400">Completed tasks by project</p>
          </div>
          <ChartBarBig className="h-5 w-5 text-gray-400/50" />
        </div>
        <div className="w-full">
          <RefractiveBarChart 
            data={productivityData}
            height={300}
            showLabels={true}
            showValues="hover"
            animated={true}
          />
        </div>
      </RefractiveCard>
    </div>
  );
};
