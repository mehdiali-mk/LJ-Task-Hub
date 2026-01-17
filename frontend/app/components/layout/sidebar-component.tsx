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

export const SidebarComponent = ({
  currentWorkspace,
}: {
  currentWorkspace: Workspace | null;
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
        "flex flex-col border-r border-white/10 sidebar-glass transition-all duration-300 overflow-visible",
        isCollapsed ? "w-16 md:w[80px]" : "w-16 md:w-[240px]"
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-white/10 mb-4", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
        <Link to="/" className={cn("flex items-center", isCollapsed && "hidden")}>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-white border border-white/50 flex items-center justify-center overflow-hidden">
              <DotLottieReact
                src="https://lottie.host/2bd99e49-b27f-4ad1-a9fd-4c7272da3bbe/hgKC6qcLgu.lottie"
                loop
                autoplay
                style={{ width: '48px', height: '48px', transform: 'scale(1.4)' }}
              />
            </div>
            <span className="font-semibold text-lg hidden md:block text-glass-primary">
              TaskHub
            </span>
          </div>
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

      <div>
        <Button
          variant={"ghost"}
          size={isCollapsed ? "icon" : "default"}
          onClick={logout}
        >
          <LogOut className={cn("size-4", isCollapsed && "mr-2")} />
          <span className="hidden md:block">Logout</span>
        </Button>
      </div>
    </div>
  );
};
