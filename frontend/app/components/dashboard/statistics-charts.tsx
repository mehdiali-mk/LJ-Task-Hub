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
  Target,
} from "lucide-react";
import {
  RefractiveCard,
  GlassCutoutText,
} from "../ui/refractive-layout";
import { RefractiveBarChart } from "../ui/refractive-bar-chart";
import { LiquidPieChart } from "../ui/liquid-pie-chart";
import { statusColors, chartAccents, tooltipStyles } from "@/lib/chart-tokens";
import { motion } from "framer-motion";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "../ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatisticsChartsProps {
  stats: StatsCardProps;
  taskTrendsData: TaskTrendsData[];
  projectStatusData: ProjectStatusData[];
  taskPriorityData: TaskPriorityData[];
  workspaceProductivityData: WorkspaceProductivityData[];
}

// Custom glass tooltip component
function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      style={{
        ...tooltipStyles,
        minWidth: 180,
      }}
    >
      <p className="text-white/90 font-medium mb-2 text-sm border-b border-white/10 pb-2">
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ 
                  backgroundColor: entry.color,
                  boxShadow: `0 0 8px ${entry.color}50`,
                }} 
              />
              <span className="text-white/70 text-xs capitalize">
                {entry.dataKey.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
            <span className="text-white font-semibold text-sm">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export const StatisticsCharts = ({
  stats,
  taskTrendsData,
  projectStatusData,
  taskPriorityData,
  workspaceProductivityData,
}: StatisticsChartsProps) => {
  // Transform data for RefractiveBarChart with dynamic colors
  const productivityData = workspaceProductivityData.map((d, i) => ({
    label: d.name,
    value: d.completed,
    color: chartAccents[i % chartAccents.length],
  }));

  // PURE FUNCTION MAPS - Enforce consistent colors based on Label Name using priorityColors tokens
  const getFixedStatusColor = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes('complete') || lower.includes('done')) return '#22c55e'; // Green
    if (lower.includes('progress') || lower.includes('active')) return '#0096FF'; // Electric Blue
    if (lower.includes('todo') || lower.includes('pending') || lower.includes('plan')) return '#fbbf24'; // Yellow
    return chartAccents[0];
  };

  const getFixedPriorityColor = (label: string) => {
    const lower = label.toLowerCase();
    // Using exact brand colors from priorityColors tokens
    if (lower === 'high' || lower === 'urgent') return '#E60000';     // Vibrant Red (priorityColors.high.base)
    if (lower === 'medium') return '#fbbf24';        // Yellow (priorityColors.medium.base)
    if (lower === 'low') return '#22c55e';           // Green (priorityColors.low.base)
    return chartAccents[0];
  };

  // Transform data using FIXED colors (ignoring incoming D.color to prevent mismatch)
  const statusData = projectStatusData.map((d) => ({
    label: d.name,
    value: d.value,
    color: getFixedStatusColor(d.name),
  }));

  const priorityData = taskPriorityData.map((d) => ({
    label: d.name,
    value: d.value,
    color: getFixedPriorityColor(d.name),
  }));

  // Calculate totals for center labels
  const totalProjects = projectStatusData.reduce((sum, d) => sum + d.value, 0);
  const totalPriorityTasks = taskPriorityData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {/* Task Trends - Area Chart with gradients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-2"
      >
        <RefractiveCard className="p-6 h-full">
          <div className="flex flex-row items-center justify-between pb-6">
            <div className="space-y-1">
              <GlassCutoutText as="h3" className="text-lg">Task Trends</GlassCutoutText>
              <p className="text-sm text-gray-400">Daily task status over time</p>
            </div>
            <div 
              className="p-2 rounded-xl"
              style={{ 
                background: `rgba(255, 255, 255, 0.03)`,
                border: `1px solid rgba(255, 255, 255, 0.05)`,
              }}
            >
              <ChartLine className="size-5" style={{ color: statusColors.inProgress.base }} />
            </div>
          </div>
          
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={taskTrendsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={statusColors.completed.base} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={statusColors.completed.base} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradientInProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={statusColors.inProgress.base} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={statusColors.inProgress.base} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradientTodo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={statusColors.todo.base} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={statusColors.todo.base} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="rgba(255,255,255,0.06)" 
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  width={40}
                />
                <Tooltip content={<GlassTooltip />} />
                
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke={statusColors.completed.base}
                  strokeWidth={2}
                  fill="url(#gradientCompleted)"
                  dot={{ r: 4, fill: statusColors.completed.base, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: statusColors.completed.light, stroke: statusColors.completed.base, strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="inProgress" 
                  stroke={statusColors.inProgress.base}
                  strokeWidth={2}
                  fill="url(#gradientInProgress)"
                  dot={{ r: 4, fill: statusColors.inProgress.base, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: statusColors.inProgress.light, stroke: statusColors.inProgress.base, strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="todo" 
                  stroke={statusColors.todo.base}
                  strokeWidth={2}
                  fill="url(#gradientTodo)"
                  dot={{ r: 4, fill: statusColors.todo.base, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: statusColors.todo.light, stroke: statusColors.todo.base, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Custom Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/5">
            <LegendItem color={statusColors.completed.base} label="Completed" />
            <LegendItem color={statusColors.inProgress.base} label="In Progress" />
            <LegendItem color={statusColors.todo.base} label="To Do" />
          </div>
        </RefractiveCard>
      </motion.div>

      {/* Project Status - Donut Chart with center label */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <RefractiveCard className="flex flex-col p-6 h-full">
          <div className="flex flex-row items-center justify-between pb-6">
            <div className="space-y-1">
              <GlassCutoutText as="h3" className="text-lg">Project Status</GlassCutoutText>
              <p className="text-sm text-gray-400">Current project breakdown</p>
            </div>
            <div 
              className="p-2 rounded-xl"
              style={{ 
                background: `rgba(255, 255, 255, 0.03)`,
                border: `1px solid rgba(255, 255, 255, 0.05)`,
              }}
            >
              <ChartPie className="size-5" style={{ color: chartAccents[1] }} />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <LiquidPieChart 
              data={statusData}
              size={200}
              innerRadius={45} // Thicker band for better label fit
              showLegend={true}
              className="scale-95"
              centerValue={totalProjects}
              centerLabel="Total"
            />
          </div>
        </RefractiveCard>
      </motion.div>

      {/* Task Priority - Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <RefractiveCard className="flex flex-col p-6 h-full">
          <div className="flex flex-row items-center justify-between pb-6">
            <div className="space-y-1">
              <GlassCutoutText as="h3" className="text-lg">Task Priority</GlassCutoutText>
              <p className="text-sm text-gray-400">Priority distribution</p>
            </div>
            <div 
              className="p-2 rounded-xl"
              style={{ 
                background: `rgba(255, 255, 255, 0.03)`,
                border: `1px solid rgba(255, 255, 255, 0.05)`,
              }}
            >
              <Target className="size-5" style={{ color: statusColors.overdue.base }} />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <LiquidPieChart 
              data={priorityData}
              size={200}
              innerRadius={45} // Thicker band for better label fit
              showLegend={true}
              className="scale-95"
              centerValue={totalPriorityTasks}
              centerLabel="Tasks"
            />
          </div>
        </RefractiveCard>
      </motion.div>

      {/* Workspace Productivity - Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="lg:col-span-2"
      >
        <RefractiveCard className="p-6">
          <div className="flex flex-row items-center justify-between pb-6">
            <div className="space-y-1">
              <GlassCutoutText as="h3" className="text-lg">Workspace Productivity</GlassCutoutText>
              <p className="text-sm text-gray-400">Completed tasks by project</p>
            </div>
            <div 
              className="p-2 rounded-xl"
              style={{ 
                background: `rgba(255, 255, 255, 0.03)`,
                border: `1px solid rgba(255, 255, 255, 0.05)`,
              }}
            >
              <ChartBarBig className="h-5 w-5" style={{ color: chartAccents[0] }} />
            </div>
          </div>
          <div className="w-full">
            <RefractiveBarChart 
              data={productivityData}
              height={280}
              showLabels={true}
              showValues="hover"
              animated={true}
            />
          </div>
        </RefractiveCard>
      </motion.div>
    </div>
  );
};

// Helper components
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-3 h-3 rounded-full"
        style={{ 
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}40`,
        }}
      />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

// Helper functions to map labels to colors
function getStatusColorForLabel(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes('complete') || lower.includes('done')) return statusColors.completed.base;
  if (lower.includes('progress') || lower.includes('active')) return statusColors.inProgress.base;
  if (lower.includes('todo') || lower.includes('pending') || lower.includes('plan')) return statusColors.todo.base;
  if (lower.includes('hold') || lower.includes('pause')) return chartAccents[1];
  return chartAccents[0];
}

function getPriorityColorForLabel(label: string): string {
  const lower = label.toLowerCase();
  if (lower === 'high' || lower === 'urgent' || lower === 'critical') return statusColors.overdue.base;
  if (lower === 'medium' || lower === 'normal') return statusColors.todo.base;
  if (lower === 'low') return statusColors.completed.base;
  return chartAccents[0];
}
