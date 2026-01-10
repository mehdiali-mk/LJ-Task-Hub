import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";
import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useLocation, useNavigate } from "react-router";

interface SidebarNavProps extends React.HtmlHTMLAttributes<HTMLElement> {
  items: {
    title: string;
    href: string;
    icon: LucideIcon;
  }[];
  isCollapsed: boolean;
  currentWorkspace: Workspace | null;
  className?: string;
}
export const SidebarNav = ({
  items,
  isCollapsed,
  className,
  currentWorkspace,
  ...props
}: SidebarNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={cn("flex flex-col gap-y-2", className)} {...props}>
      {items.map((el) => {
        const Icon = el.icon;
        const isActive = location.pathname === el.href;

        const handleClick = () => {
          if (el.href === "/workspaces") {
            navigate(el.href);
          } else if (currentWorkspace && currentWorkspace._id) {
            navigate(`${el.href}?workspaceId=${currentWorkspace._id}`);
          } else {
            navigate(el.href);
          }
        };

        return (
          <Button
            key={el.href}
            variant={isActive ? "outline" : "ghost"}
            className={cn(
              "justify-start hover:bg-white/10 transition-colors duration-200 group",
              isActive 
                ? "glass-card border-white/10 font-medium shadow-md bg-white/5" 
                : "border-transparent",
              isCollapsed && "justify-center px-2"
            )}
            onClick={handleClick}
          >
            <Icon className={cn(
              "size-4 transition-all duration-250", 
              !isCollapsed && "mr-2", 
              isActive 
                ? "text-white opacity-100" 
                : "text-white/40 opacity-40 group-hover:text-white group-hover:opacity-100"
            )} />
            {isCollapsed ? (
              <span className="sr-only">{el.title}</span>
            ) : (
              <span className={cn(
                "transition-colors",
                isActive ? "text-white" : "text-gray-400 group-hover:text-white"
              )}>
                {el.title}
              </span>
            )}
          </Button>
        );
      })}
    </nav>
  );
};
