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
import { useNavigate } from "react-router";
import { toast } from "sonner";
import axios from "axios";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
      
      // Force reload or event dispatch might be needed if AuthContext doesn't auto-detect
      // But triggering a navigation usually re-runs auth check if implemented right.
      // Better: use window.location.href or reload to ensure Context picks up the new storage
      // OR: Use the useAuth() hook's login method if accessible. 
      // Since useAuth is not imported here, we'll rely on storage + hard reload/navigate
      
      toast.success("Welcome back, Master Admin");
      // Use window.location to force AuthProvider to re-mount/re-check or just navigate
      // navigate("/admin"); 
      window.location.href = "/admin"; 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900/50 backdrop-blur-sm">
      <Card className="w-full max-w-md border-white/10 bg-black/50 text-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Master Admin Access
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter your credentials to access the system core
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@projectmanager.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Access Control Panel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
