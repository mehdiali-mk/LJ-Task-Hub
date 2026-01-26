import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import axios from "axios";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { MeshBackground } from "@/components/ui/mesh-background";
import { Loader2, Eye, EyeOff } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/login`,
        {
          email,
          password,
        }
      );

      // Standard Auth Context for Global Access
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify({
          ...response.data.admin,
          isAdmin: true
      }));

      // Legacy support for admin dashboard specific calls if needed (can be refactored later)
      localStorage.setItem("admin_token", response.data.token);
      localStorage.setItem("admin_user", JSON.stringify(response.data.admin));
      
      toast.success("Welcome back, Master Admin");
      window.location.href = "/admin"; 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MeshBackground />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <Link to="/" className="flex items-center gap-3 mb-8 group cursor-pointer">
          <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 backdrop-blur-md overflow-hidden
            group-hover:bg-white
            group-hover:border-white/70
            group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.2),0_0_20px_rgba(255,255,255,0.15)]
            group-hover:-translate-y-0.5">
             <DotLottieReact
               src="https://lottie.host/2bd99e49-b27f-4ad1-a9fd-4c7272da3bbe/hgKC6qcLgu.lottie"
               loop
               autoplay
               style={{ width: '56px', height: '56px', transform: 'scale(1.4)' }}
             />
          </div>
          <span className="font-bold text-2xl tracking-tighter text-white/90 group-hover:text-white transition-colors">TaskForge</span>
        </Link>
        
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center mb-5">
            <CardTitle className="text-2xl font-bold text-glass-heading-morph">
              Master Admin Access
            </CardTitle>
            <CardDescription className="text-sm text-white/50">
              Enter your credentials to access the system core
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@projectmanager.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {loading ? "Authenticating..." : "Access Control Panel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminLogin;
