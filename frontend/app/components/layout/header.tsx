import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { Button } from "../ui/button";
import { Bell, PlusCircle, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";

interface HeaderProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
  onMenuClick?: () => void;
}

export const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
  onMenuClick,
}: HeaderProps) => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const loaderData = useLoaderData() as { workspaces?: Workspace[] } | undefined;
  const workspaces = loaderData?.workspaces || [];
  const isOnWorkspacePage = useLocation().pathname.includes("/workspace");

  const handleOnClick = (workspace: Workspace) => {
    onWorkspaceSelected(workspace);
    const location = window.location;

    if (isOnWorkspacePage) {
      navigate(`/workspaces/${workspace._id}`);
    } else {
      const basePath = location.pathname;

      navigate(`${basePath}?workspaceId=${workspace._id}`);
    }
  };

  return (
    <div className="deep-glass-sm sticky top-0 z-40 border-b border-white/10">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Mobile Menu Trigger */}
        <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-white hover:bg-white/10">
                <Menu className="w-6 h-6" />
            </Button>
        </div>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"ghost"}
              className="bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              {selectedWorkspace ? (
                <>
                  {selectedWorkspace.color && (
                    <WorkspaceAvatar
                      color={selectedWorkspace.color}
                      name={selectedWorkspace.name}
                    />
                  )}
                  <span className="font-medium">{selectedWorkspace?.name}</span>
                </>
              ) : (
                <span className="font-medium">Select Workspace</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-56 glass-card border-white/10 bg-black/80 backdrop-blur-xl text-white">
            <DropdownMenuLabel className="text-gray-400">Workspace</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />

            <DropdownMenuGroup>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws._id}
                  onClick={() => handleOnClick(ws)}
                  className="focus:bg-white/10 focus:text-white cursor-pointer"
                >
                  {ws.color && (
                    <WorkspaceAvatar color={ws.color} name={ws.name} />
                  )}
                  <span className="ml-2">{ws.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuGroup>
              {user?.isAdmin && (
                <DropdownMenuItem
                    onClick={onCreateWorkspace}
                    className="focus:bg-white/10 focus:text-white cursor-pointer"
                >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Workspace
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu> */}

        <div className="flex items-center gap-2 ml-auto">
          {false && (
            <Button variant="ghost" size="icon">
              <Bell />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full border border-white/10 p-0.5 w-9 h-9 flex items-center justify-center hover:bg-white/5 transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profilePicture} alt={user?.name} className="object-cover" />
                  <AvatarFallback className="bg-primary text-black font-semibold w-full h-full flex items-center justify-center text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 glass-card border-white/10 bg-black/80 backdrop-blur-xl text-white">
              <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                <Link to="/user/profile" className="w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={logout} className="focus:bg-white/10 focus:text-white cursor-pointer">Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
