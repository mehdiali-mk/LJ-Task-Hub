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
  Info,
  HelpCircle,
  Mail,
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
    // {\n    //   title: "Archived Tasks",\n    //   href: `/archived-tasks`,\n    //   icon: CheckCircle2,\n    // },
    // {\n    //   title: "Settings",\n    //   href: "/settings",\n    //   icon: Settings,\n    // },
    ...(user?.email === "admin@projectmanager.com" ? [{
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
        "flex flex-col border-r border-white/10 sidebar-glass transition-all duration-300",
        isCollapsed ? "w-16 md:w[80px]" : "w-16 md:w-[240px]"
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-white/10 mb-4", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
        <Link to="/" className={cn("flex items-center", isCollapsed && "hidden")}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg deep-glass-sm flex items-center justify-center">
              <Layers className="size-5 text-glass-primary" />
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

      <ScrollArea className="flex-1 px-3 py-2">
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
