import type {
  ProjectStatusData,
  StatsCardProps,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChartBarBig, ChartLine, ChartPie } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
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
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <Card className="lg:col-span-2 glass-card border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium text-white">Task Trends</CardTitle>
            <CardDescription className="text-gray-400">Daily task status changes</CardDescription>
          </div>
          <ChartLine className="size-5 text-gray-400/50" />
        </CardHeader>
        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[300px] w-full"
              config={{
                completed: { color: "#10b981" }, // green
                inProgress: { color: "#f59e0b" }, // ambe
                todo: { color: "#3b82f6" }, // blue
              }}
            >
              <LineChart data={taskTrendsData}>
                <XAxis
                  dataKey={"name"}
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                <CartesianGrid strokeDasharray={"3 3"} vertical={false} stroke="rgba(255,255,255,0.1)" />
                <ChartTooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />

                <Line
                  type="monotone"
                  dataKey={"completed"}
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="todo"
                  stroke="#6b7280"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />

                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* project status  */}

      <Card className="glass-card border-none shadow-lg flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium text-white">
              Project Status
            </CardTitle>
            <CardDescription className="text-gray-400">Project status breakdown</CardDescription>
          </div>

          <ChartPie className="size-5 text-gray-400/50" />
        </CardHeader>

        <CardContent className="w-full flex-1 flex items-center justify-center overflow-hidden">
          <div className="w-full flex items-center justify-center">
            <ChartContainer
              className="h-[280px] w-full"
              config={{
                Completed: { color: "#10b981" },
                "In Progress": { color: "#3b82f6" },
                Planning: { color: "#f59e0b" },
              }}
            >
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {projectStatusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} 
                />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* task priority  */}
      <Card className="glass-card border-none shadow-lg flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium text-white">
              Task Priority
            </CardTitle>
            <CardDescription className="text-gray-400">Task priority breakdown</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="w-full flex-1 flex items-center justify-center overflow-hidden">
          <div className="w-full flex items-center justify-center">
            <ChartContainer
              className="h-[280px] w-full"
              config={{
                High: { color: "#ef4444" },
                Medium: { color: "#f59e0b" },
                Low: { color: "#6b7280" },
              }}
            >
              <PieChart>
                <Pie
                  data={taskPriorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {taskPriorityData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} 
                />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Workspace Productivity Chart */}
      <Card className="lg:col-span-2 glass-card border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium text-white">
              Workspace Productivity
            </CardTitle>
            <CardDescription className="text-gray-400">Task completion by project</CardDescription>
          </div>
          <ChartBarBig className="h-5 w-5 text-gray-400/50" />
        </CardHeader>
        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-[350px]">
            <ChartContainer
              className="h-[300px] w-full"
              config={{
                completed: { color: "#3b82f6" },
                total: { color: "red" },
              }}
            >
              <BarChart
                data={workspaceProductivityData}
                barGap={0}
                barSize={20}
              >
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <ChartTooltip content={<ChartTooltipContent />} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <Bar
                  dataKey="total"
                  fill="#ffffff"
                  radius={[4, 4, 0, 0]}
                  name="Total Tasks"
                  fillOpacity={0.2}
                />
                <Bar
                  dataKey="completed"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Completed Tasks"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
