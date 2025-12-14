import { useAuth } from "@/provider/auth-context";
import React from "react";
import { Navigate, Outlet } from "react-router";
import { FluidBackground } from "@/components/ui/fluid-background";

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white selection:bg-[#00FFFF]/30 isolate flex items-center justify-center">
      <FluidBackground />
      <div className="w-full flex items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
