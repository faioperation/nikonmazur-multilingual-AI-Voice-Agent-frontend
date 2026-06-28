import { useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { UserPlus, MoreVertical, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import toast from "react-hot-toast";

const roles = ["ADMIN", "MANAGER", "VIEWER"];

export default function TeamAccess() {
  const [showInvite, setShowInvite] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "MANAGER" });
  const [userToDelete, setUserToDelete] = useState(null);
  
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['teamUsers'],
    queryFn: async () => {
      const res = await api.get('/auth/users/');
      return res.data?.data || res.data;
    }
  });

  const addUserMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/auth/users/', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("User added successfully!");
      queryClient.invalidateQueries(['teamUsers']);
      setShowInvite(false);
      setFormData({ name: "", email: "", phone: "", role: "MANAGER" });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to add user");
    }
  });

  const handleAddUser = () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and Email are required");
      return;
    }
    addUserMutation.mutate(formData);
  };

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await api.delete(`/auth/users/${userId}/`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries(['teamUsers']);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    }
  });

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Access</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage who can access your AI operations dashboard.</p>
        </div>
        <button 
          onClick={() => isAdmin && setShowInvite(true)} 
          disabled={!isAdmin}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isAdmin ? "bg-primary text-primary-foreground hover:bg-primary/80" : "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed"}`}
        >
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-destructive gap-2">
          <p>Failed to load team members.</p>
          <p className="text-sm opacity-80">{error?.response?.data?.message || error?.message || "Unknown error"}</p>
        </div>
      ) : (
        <div className="glow-border rounded-xl bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-5 py-3 font-medium w-[35%]">Member</th>
                <th className="text-left px-5 py-3 font-medium w-[15%] hidden sm:table-cell">Role</th>
                <th className="text-left px-5 py-3 font-medium w-[20%] hidden md:table-cell">Last Login</th>
                <th className="text-left px-5 py-3 font-medium w-[15%]">Status</th>
                <th className="text-right px-5 py-3 font-medium w-[15%]">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(m => (
                <tr key={m.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium">{m.name || "Unknown User"}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{m.role}</span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs hidden md:table-cell">{m.last_active}</td>
                  <td className="px-5 py-3"><StatusBadge status={m.last_active !== "Never active" ? "Active" : "Pending"} /></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isAdmin && (
                        <button 
                          onClick={() => setUserToDelete(m)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Permissions */}
      <div className="glow-border rounded-xl bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Role Permissions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
          
            { role: "Admin", perms: "Analytics, manage calls, manage agents, invite users" },
            { role: "Manager", perms: "View calls, review recordings, assign follow-ups" },
            { role: "Viewer", perms: "Read-only dashboard access" },
           
          ].map(r => (
            <div key={r.role} className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs font-semibold mb-1">{r.role}</p>
              <p className="text-[11px] text-muted-foreground">{r.perms}</p>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <input 
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input 
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary" 
                placeholder="email@company.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Phone</label>
              <input 
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary" 
                placeholder="+1 (555) 000-0000" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Role</label>
              <select 
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button 
              onClick={handleAddUser}
              disabled={addUserMutation.isPending}
              className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {addUserMutation.isPending ? <Loader2 className="w-4 h-4 mx-auto animate-spin" /> : "Add"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="bg-card border-border sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Delete Team Member</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">{userToDelete?.name}</strong>? This action cannot be undone and they will lose all access to the dashboard.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button 
              onClick={() => setUserToDelete(null)} 
              className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => deleteUserMutation.mutate(userToDelete?.id)} 
              disabled={deleteUserMutation.isPending}
              className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deleteUserMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}