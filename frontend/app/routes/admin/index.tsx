import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "sonner";
import { LogOut, ShieldCheck, Search, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Loader } from "@/components/loader";
import { AssignWorkspaceDialog } from "@/components/admin/assign-workspace-dialog";
import { fetchData } from "@/lib/fetch-util";

interface User {
  _id: string;
  name: string;
  email: string;
  managedWorkspaces: string[];
  isOnline?: boolean;
  lastActiveAt?: string;
  role?: string;
}

type SortField = 'name' | 'status' | 'role';
type SortOrder = 'asc' | 'desc';

// Helper function to format time difference (only minutes, hours, days)
const formatTimeDifference = (dateString: string | undefined): string => {
  if (!dateString) return "Unknown";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
  }
};

const AdminDashboard = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]); // All users from API
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const navigate = useNavigate();

  // Fetch users only once on mount
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
      setAllUsers(response.data);
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

  // Client-side filtering and sorting using useMemo for instant results
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...allUsers];

    // Apply search filter (case-insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) ||
        (user.email && user.email.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'status':
          // Sort by isOnline (online first when ascending)
          const aOnline = a.isOnline ? 1 : 0;
          const bOnline = b.isOnline ? 1 : 0;
          comparison = bOnline - aOnline; // Online first
          // If same status, sort by name
          if (comparison === 0) {
            comparison = a.name.localeCompare(b.name);
          }
          break;
        case 'role':
          // Sort by isWorkspaceManager (managers first when ascending)
          const aManager = (a.managedWorkspaces && a.managedWorkspaces.length > 0) ? 1 : 0;
          const bManager = (b.managedWorkspaces && b.managedWorkspaces.length > 0) ? 1 : 0;
          comparison = bManager - aManager; // Managers first
          // If same role, sort by name
          if (comparison === 0) {
            comparison = a.name.localeCompare(b.name);
          }
          break;
        case 'name':
        default:
          comparison = a.name.localeCompare(b.name);
          break;
      }

      // Apply sort order
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [allUsers, searchQuery, sortBy, sortOrder]);

  // Handle sorting click
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle sort order if clicking same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get sort icon for a field
  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
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

  // Delete User Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh the list after delete
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  // Instant search - no loading, no API call
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section - Glassmorphic */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-3xl border border-white/20 ring-1 ring-white/10 shadow-[0_20px_100px_rgba(0,0,0,0.5)] p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">
                <span className="text-glass-hero-morph">Master</span>{" "}
                <span className="text-glass-heading-morph">Admin Panel</span>
              </h1>
              <p className="text-white/50 mt-3 font-light text-lg">System overview and user management</p>
            </div>
            <Button 
              onClick={handleLogout} 
              className="bg-white/[0.08] backdrop-blur-xl border border-white/20 text-red-400/80 hover:bg-white/[0.12] hover:border-white/30 hover:text-red-400 transition-all duration-300"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        {/* User Registry Table - Glassmorphic */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-3xl border border-white/20 ring-1 ring-white/10 shadow-[0_20px_100px_rgba(0,0,0,0.5)] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-white">User Registry</h2>
            
            {/* Search Bar - Glassmorphic */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 bg-white/[0.08] backdrop-blur-xl border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20 rounded-xl transition-all duration-300"
              />
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 bg-white/[0.03] hover:bg-white/[0.05]">
                  <TableHead 
                    className="text-white/60 cursor-pointer select-none hover:text-white transition-colors font-semibold"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead className="text-white/60 font-semibold">Email</TableHead>
                  <TableHead 
                    className="text-white/60 cursor-pointer select-none hover:text-white transition-colors font-semibold"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-white/60 cursor-pointer select-none hover:text-white transition-colors font-semibold"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center">
                      Role
                      {getSortIcon('role')}
                    </div>
                  </TableHead>
                  <TableHead className="text-white/60 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-white/40 py-12">
                      {searchQuery ? "No users found matching your search." : "No users registered yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedUsers.map((user) => (
                    <TableRow key={user._id} className="border-white/10 hover:bg-white/[0.05] transition-colors">
                      <TableCell className="font-medium text-white">{user.name}</TableCell>
                      <TableCell className="text-white/70">{user.email}</TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="focus:outline-none">
                              {user.isOnline ? (
                                <Badge 
                                  variant="outline" 
                                  className="text-emerald-400 border-emerald-400/40 bg-emerald-500/10 cursor-pointer hover:bg-emerald-500/20 transition-all duration-300"
                                >
                                  Online
                                </Badge>
                              ) : (
                                <Badge 
                                  variant="outline" 
                                  className="text-white/50 border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 transition-all duration-300"
                                >
                                  Offline
                                </Badge>
                              )}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3 bg-white/[0.08] backdrop-blur-3xl border-white/20 text-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                            {user.isOnline ? (
                              <p className="text-sm text-emerald-400">
                                Online from last {formatTimeDifference(user.lastActiveAt)}.
                              </p>
                            ) : (
                              <p className="text-sm text-white/60">
                                Last Online {formatTimeDifference(user.lastActiveAt)} ago.
                              </p>
                            )}
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                           {user.managedWorkspaces && user.managedWorkspaces.length > 0 ? (
                               <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all duration-300">Workspace Manager</Badge>
                           ) : (
                               <Badge variant="secondary" className="bg-white/10 text-white/60 border border-white/20 hover:bg-white/15 transition-all duration-300">User</Badge>
                           )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openAssignDialog(user)}
                              className="bg-white/[0.06] backdrop-blur-sm border border-white/10 text-blue-400/80 hover:bg-white/[0.1] hover:border-white/20 hover:text-blue-400 transition-all duration-300 rounded-lg"
                          >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Manage Roles
                          </Button>
                          <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openDeleteDialog(user)}
                              className="bg-white/[0.06] backdrop-blur-sm border border-white/10 text-red-400/80 hover:bg-white/[0.1] hover:border-white/20 hover:text-red-400 transition-all duration-300 rounded-lg"
                          >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <AssignWorkspaceDialog 
            isOpen={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
            user={selectedUser}
            workspaces={workspaces}
            onSuccess={() => fetchUsers()}
        />

        {/* Delete User Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white text-xl font-bold">Delete User</AlertDialogTitle>
              <AlertDialogDescription className="text-white/60">
                Are you sure you want to delete <span className="font-semibold text-white">"{userToDelete?.name}"</span>? 
                This action cannot be undone and will permanently remove this user's account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                disabled={isDeleting}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteUser();
                }}
                disabled={isDeleting}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border border-white/20"
              >
                {isDeleting ? "Deleting..." : "Delete User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
