import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";
import type { LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { AnimatedIcon } from "../ui/animated-icon";

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
    <nav className={cn("flex flex-col gap-y-1 sidebar-nav-container", className)} {...props}>
      {items.map((el) => {
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
          <button
            key={el.href}
            className={cn(
              "sidebar-glass-link flex items-center w-full group",
              isActive && "active",
              isCollapsed && "justify-center !px-2"
            )}
            onClick={handleClick}
          >
            <AnimatedIcon 
              icon={el.icon} 
              size={18}
              animation="scale"
              className={cn(
                !isCollapsed && "mr-3", 
                isActive 
                  ? "[&_.icon-glass]:text-white [&_.icon-glass]:opacity-100" 
                  : "[&_.icon-glass]:text-white/50 group-hover:[&_.icon-glass]:text-white group-hover:[&_.icon-glass]:opacity-100"
              )}
            />
            {isCollapsed ? (
              <span className="sr-only">{el.title}</span>
            ) : (
              <span className={cn(
                "text-sm transition-colors",
                isActive ? "text-white font-medium" : "text-white/60 group-hover:text-white"
              )}>
                {el.title}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
