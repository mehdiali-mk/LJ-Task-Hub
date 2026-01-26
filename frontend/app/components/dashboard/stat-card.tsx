import type { StatsCardProps } from "@/types";
import { RefractiveCard } from "../ui/refractive-layout";
import { LiquidProgress } from "../ui/liquid-progress";
import { statusColors, glassGradients, type ColorVariant } from "@/lib/chart-tokens";
import { Briefcase, CheckCircle2, ListTodo, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth end
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
}

interface StatCardItemProps {
  title: string;
  value: number;
  subtitle: string;
  progress: number;
  icon: React.ReactNode;
  color: ColorVariant;
  gradient: string;
  trend?: number;
  delay?: number;
}

function StatCardItem({ 
  title, 
  value, 
  subtitle, 
  progress, 
  icon, 
  color, 
  gradient,
  trend,
  delay = 0 
}: StatCardItemProps) {
  const animatedValue = useAnimatedCounter(value, 1200);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <RefractiveCard className="p-6 hover:translate-y-[-2px] transition-all duration-300 group relative overflow-hidden">
        {/* Background gradient glow */}

        
        <div className="relative z-10">
          {/* Header with icon */}
          <div className="flex flex-row items-center justify-between pb-3">
            <h3 className="text-sm font-medium text-gray-200 tracking-wide">{title}</h3>
            <div 
              className="p-2 rounded-xl"
              style={{ 
                background: `rgba(255, 255, 255, 0.03)`,
                border: `1px solid rgba(255, 255, 255, 0.05)`,
              }}
            >
              <div style={{ color: color.base }}>
                {icon}
              </div>
            </div>
          </div>
          
          {/* Value with animated counter */}
          <div className="mb-1">
            <div className="flex items-baseline gap-2">
              <span 
                className="text-3xl font-bold tracking-tight"
                style={{ 
                  color: 'white',
                  textShadow: `0 0 30px ${color.glow}`,
                }}
              >
                {animatedValue.toLocaleString()}
              </span>
              
              {/* Trend indicator */}
              {trend !== undefined && trend !== 0 && (
                <span 
                  className="flex items-center gap-0.5 text-xs font-medium"
                  style={{ color: trend > 0 ? statusColors.completed.base : statusColors.overdue.base }}
                >
                  {trend > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
          </div>
          
          {/* Subtitle */}
          <p className="text-xs text-gray-400 mb-4">
            {subtitle}
          </p>
          
          {/* Progress bar */}
          <LiquidProgress 
            value={progress} 
            className="h-2" 
            color={color.base}
            showWave={false} 
            showLabel={false}
          />
          
          {/* Progress percentage label - keeping external here for layout adherence, but could move internal */}
          <div className="flex justify-end mt-2">
            <span className="text-[10px] font-medium text-white/60">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
      </RefractiveCard>
    </motion.div>
  );
}

export const StatsCard = ({ data }: { data: StatsCardProps }) => {
  const projectProgress = data?.totalProjects ? (data.totalProjectInProgress / data.totalProjects) * 100 : 0;
  const taskCompletion = data?.totalTasks ? (data.totalTaskCompleted / data.totalTasks) * 100 : 0;
  const todoPercentage = data?.totalTasks ? (data.totalTaskToDo / data.totalTasks) * 100 : 0;
  const inProgressPercentage = data?.totalTasks ? (data.totalTaskInProgress / data.totalTasks) * 100 : 0;

  const stats = [
    {
      title: "Total Projects",
      value: data?.totalProjects ?? 0,
      subtitle: `${data?.totalProjectInProgress ?? 0} currently active`,
      progress: projectProgress,
      icon: <Briefcase className="w-4 h-4" />,
      color: statusColors.inProgress,
      gradient: glassGradients.primary,
      trend: 12,
    },
    {
      title: "Completed Tasks",
      value: data?.totalTaskCompleted ?? 0,
      subtitle: `${taskCompletion.toFixed(0)}% completion rate`,
      progress: taskCompletion,
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: statusColors.completed,
      gradient: glassGradients.success,
      trend: 8,
    },
    {
      title: "To Do",
      value: data?.totalTaskToDo ?? 0,
      subtitle: "Tasks waiting to start",
      progress: todoPercentage,
      icon: <ListTodo className="w-4 h-4" />,
      color: statusColors.todo,
      gradient: glassGradients.warning,
    },
    {
      title: "In Progress",
      value: data?.totalTaskInProgress ?? 0,
      subtitle: "Tasks being worked on",
      progress: inProgressPercentage,
      icon: <Clock className="w-4 h-4" />,
      color: statusColors.active,
      gradient: glassGradients.primary,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCardItem
          key={stat.title}
          {...stat}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
};
