import { FluidBackground } from "@/components/ui/fluid-background";
import { Outlet } from "react-router";

const UserLayout = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white selection:bg-[#00FFFF]/30 isolate">
      <FluidBackground />
      <div className="container max-w-3xl mx-auto py-8 md:py-16 relative z-10">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;
