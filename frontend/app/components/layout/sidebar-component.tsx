import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import {
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  ListCheck,
  LogOut,
  Settings,
  Users,
  Info,
  HelpCircle,
  Mail,
} from "lucide-react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarNav } from "./sidebar-nav";
import { AnimatedIcon } from "../ui/animated-icon";

export const SidebarComponent = ({
  currentWorkspace,
  className,
}: {
  currentWorkspace: Workspace | null;
  className?: string;
}) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = user?.email === "admin@projectmanager.com";

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Workspaces",
      href: "/workspaces",
      icon: Users,
    },
    // Only show My Tasks for non-admin users
    ...(!isAdmin ? [{
      title: "My Tasks",
      href: "/my-tasks",
      icon: ListCheck,
    }] : []),
    {
      title: "Members",
      href: `/members`,
      icon: Users,
    },
    // Admin Panel - only for admin users
    ...(isAdmin ? [{
        title: "Admin Panel",
        href: "/admin",
        icon: Users,
    }] : []),
  ];

  const coreItems = [
    {
      title: "About",
      href: "/about",
      icon: Info,
    },
    {
      title: "Support",
      href: "/support",
      icon: HelpCircle,
    },
    {
      title: "Contact",
      href: "/contact",
      icon: Mail,
    },
  ];

  return (
    <div
      className={cn(
        "relative hidden md:flex flex-col transition-all duration-300 overflow-visible",
        isCollapsed ? "w-16 md:w[80px]" : "w-16 md:w-[240px]",
        className
      )}
    >
      {/* Refractive Background Layer */}
      <div className="absolute inset-0 refract-sidebar border-r border-white/20 pointer-events-none" />

      {/* Content Layer - Z-index ensures it sits above the refraction */}
      <div className="relative z-10 flex flex-col h-full">
        <div className={cn("flex h-14 items-center border-b border-white/10 mb-4", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
          <Link to="/" className={cn("flex items-center gap-3 group", isCollapsed && "hidden")}>
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 backdrop-blur-md overflow-hidden
              group-hover:bg-white
              group-hover:border-white/70
              group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.2),0_0_20px_rgba(255,255,255,0.15)]
              group-hover:-translate-y-0.5">
               <DotLottieReact
                 src="https://lottie.host/2bd99e49-b27f-4ad1-a9fd-4c7272da3bbe/hgKC6qcLgu.lottie"
                 loop
                 autoplay
                 style={{ width: '44px', height: '44px', transform: 'scale(1.4)' }}
               />
            </div>
            <span className="font-bold text-xl tracking-tighter text-white/90 group-hover:text-white transition-colors hidden md:block">
              TaskForge
            </span>
          </Link>

          {/* When collapsed, we only show the toggle button centered */}
          <Button
            variant={"ghost"}
            size="icon"
            className={cn(
              "hidden md:flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors",
              !isCollapsed && "ml-auto"
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronsRight className="size-5" />
            ) : (
              <ChevronsLeft className="size-5" />
            )}
          </Button>
        </div>

        <div className="flex-1 px-3 py-2 overflow-y-auto overflow-x-visible">
          <SidebarNav
            items={navItems}
            isCollapsed={isCollapsed}
            className={cn(isCollapsed && "items-center space-y-2")}
            currentWorkspace={currentWorkspace}
          />
          
          {/* Core Pages Section */}
          <div className={cn("mt-6 pt-4 border-t border-white/10", isCollapsed && "mx-2")}>
            {!isCollapsed && (
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-2 block">
                Info & Support
              </span>
            )}
            <SidebarNav
              items={coreItems}
              isCollapsed={isCollapsed}
              className={cn(isCollapsed && "items-center space-y-2", "mt-2")}
              currentWorkspace={null}
            />
          </div>
        </div>

        <div className="px-3 py-2 border-t border-white/10 mt-auto">
          <button
            onClick={logout}
            className={cn(
              "sidebar-glass-link flex items-center w-full group",
              isCollapsed && "justify-center !px-2"
            )}
          >
            <AnimatedIcon 
              icon={LogOut} 
              size={18}
              animation="scale"
              className={cn(
                !isCollapsed && "mr-3", 
                "[\&_.icon-glass]:text-white/50 group-hover:[\&_.icon-glass]:text-white group-hover:[\&_.icon-glass]:opacity-100"
              )}
            />
            {isCollapsed ? (
              <span className="sr-only">Logout</span>
            ) : (
              <span className="text-sm transition-colors text-white/60 group-hover:text-white">
                Logout
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
