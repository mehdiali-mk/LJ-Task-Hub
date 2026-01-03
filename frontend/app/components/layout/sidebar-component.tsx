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
  Layers,
} from "lucide-react";

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
    {
      title: "My Tasks",
      href: "/my-tasks",
      icon: ListCheck,
    },
    {
      title: "Members",
      href: `/members`,
      icon: Users,
    },
    // {
    //   title: "Archived Tasks",
    //   href: `/archived-tasks`,
    //   icon: CheckCircle2,
    // },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
    ...(user?.email === "admin@projectmanager.com" ? [{
        title: "Admin Panel",
        href: "/admin",
        icon: Users,
    }] : []),
  ];

  return (
    <div
      className={cn(
        "flex flex-col border-r border-white/20 bg-white/[0.08] backdrop-blur-2xl transition-all duration-300",
        isCollapsed ? "w-16 md:w[80px]" : "w-16 md:w-[240px]"
      )}
    >
      <div className={cn("flex h-14 items-center border-b mb-4", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
        <Link to="/dashboard" className={cn("flex items-center", isCollapsed && "hidden")}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
              <Layers className="size-5 text-[#00FFFF]" />
            </div>
            <span className="font-semibold text-lg hidden md:block text-white">
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

      <ScrollArea className="flex-1 px-3 py-2">
        <SidebarNav
          items={navItems}
          isCollapsed={isCollapsed}
          className={cn(isCollapsed && "items-center space-y-2")}
          currentWorkspace={currentWorkspace}
        />
      </ScrollArea>

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
