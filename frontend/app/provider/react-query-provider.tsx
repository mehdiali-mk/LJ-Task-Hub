import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth-context";

export const queryClient = new QueryClient();

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '16px 20px',
            },
            classNames: {
              toast: 'glass-toast',
              success: '!border-emerald-500/40 !shadow-[0_8px_32px_rgba(16,185,129,0.2)]',
              error: '!border-red-500/40 !shadow-[0_8px_32px_rgba(239,68,68,0.2)]',
              warning: '!border-amber-500/40 !shadow-[0_8px_32px_rgba(245,158,11,0.2)]',
              info: '!border-blue-500/40 !shadow-[0_8px_32px_rgba(59,130,246,0.2)]',
            }
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
