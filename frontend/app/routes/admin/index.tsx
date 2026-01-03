import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "sonner";
import { LogOut, ShieldCheck } from "lucide-react";
import { Loader } from "@/components/loader";
import { AssignWorkspaceDialog } from "@/components/admin/assign-workspace-dialog";
import { fetchData } from "@/lib/fetch-util";

interface User {
  _id: string;
  name: string;
  email: string;

  managedWorkspaces: string[];
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
      if ((error as any).response?.status === 401 || (error as any).response?.status === 403) {
          localStorage.removeItem("admin_token");
          navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Dialog State
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);

  const openAssignDialog = async (user: User) => {
    setSelectedUser(user);
    // Fetch workspaces if not loaded
    if (workspaces.length === 0) {
        try {
            const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
            // Call getWorkspaces endpoint which behaves correctly for admin
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/workspaces`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkspaces(res.data); // Expecting list of workspaces
        } catch(e) {
            toast.error("Failed to fetch workspaces");
        }
    }
    setIsAssignDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
    toast.success("Logged out successfully");
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-red-500">Master Admin Panel</h1>
            <p className="text-gray-400">System overview and user management</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-red-500/50 text-red-400 hover:bg-red-950">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="bg-gray-900/50 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">User Registry</h2>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Role</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-400 border-green-400/30">Active</Badge>
                  </TableCell>
                  <TableCell>
                         {user.managedWorkspaces && user.managedWorkspaces.length > 0 ? (
                             <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30">Workspace Manager</Badge>
                         ) : (
                             <Badge variant="secondary" className="bg-gray-800 text-gray-300">User</Badge>
                         )}
                  </TableCell>
                  <TableCell>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openAssignDialog(user)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Manage Roles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AssignWorkspaceDialog 
            isOpen={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
            user={selectedUser}
            workspaces={workspaces}
            onSuccess={() => fetchUsers()}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
