import { useState, useEffect } from "react";
import { company } from "../lib/demoData";
import { Switch } from "@/components/ui/switch";
import { X, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const notifOptions = [
  { label: "Daily call report", desc: "Receive a summary every morning", default: true },
  { label: "Weekly performance report", desc: "Sent every Monday", default: true },
  { label: "Failed call alerts", desc: "Instant notification on failed calls", default: true },
  { label: "High-intent lead alerts", desc: "When a lead scores above 80%", default: false },
  { label: "Human escalation alerts", desc: "When AI escalates to a human", default: true },
  { label: "Billing alerts", desc: "Invoice and payment notifications", default: true },
];

export default function AccountSettings() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch User Profile
  const queryClient = useQueryClient();
  const { data: profile, isLoading: isLoadingProfile, isError, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me/');
        console.log("Profile Data Fetched:", res.data);
        // Sometimes APIs wrap the response in a `data` key, e.g. { data: { id: 1 ... } }
        return res.data?.data || res.data;
      } catch (err) {
        console.error("Profile Fetch Error:", err);
        throw err;
      }
    },
    retry: false
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || "",
        phone: profile.phone || ""
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.patch('/auth/me/', data),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (err) => {
      console.error("Update profile failed:", err.response?.data);
      const data = err.response?.data;
      let errMsg = "Failed to update profile. Please try again.";
      if (data) {
        if (data.message) {
          errMsg = data.message;
        } else if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          if (Array.isArray(data[firstKey])) {
            errMsg = data[firstKey][0];
          } else if (typeof data[firstKey] === 'string') {
            errMsg = data[firstKey];
          } else if (data.error) {
            errMsg = data.error;
          }
        }
      }
      toast.error(errMsg);
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => api.post("/auth/change-password/", data),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      closePasswordModal();
    },
    onError: (err) => {
      console.error("Change password failed:", err.response?.data);
      const data = err.response?.data;
      let errMsg = "Failed to change password. Please try again.";
      if (data) {
        if (data.message) {
          errMsg = data.message;
        } else if (typeof data === 'object') {
          // Extract the first error message if it's an object of field errors (e.g. Django)
          const firstKey = Object.keys(data)[0];
          if (Array.isArray(data[firstKey])) {
            errMsg = data[firstKey][0];
          } else if (typeof data[firstKey] === 'string') {
            errMsg = data[firstKey];
          } else if (data.error) {
            errMsg = data.error;
          }
        }
      }
      toast.error(errMsg);
    }
  });

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    changePasswordMutation.mutate({
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    });
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your company profile and preferences.</p>
      </div>

      {/* User Profile */}
      <div className="glow-border rounded-xl bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">User Profile</h3>
          {!isEditingProfile && !isLoadingProfile && (
            <button 
              onClick={() => setIsEditingProfile(true)} 
              className="px-3 py-1.5 rounded-lg bg-secondary text-sm hover:bg-muted transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
        
        {isLoadingProfile ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-8 text-sm text-destructive">
            Failed to load profile data: {error?.response?.data?.message || error?.message || "Unknown error"}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <input 
                value={isEditingProfile ? editForm.name : (profile?.name || "")}
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                readOnly={!isEditingProfile} 
                className={`w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none transition-colors ${isEditingProfile ? 'focus:border-primary' : 'opacity-80 cursor-default'}`} 
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input 
                value={profile?.email || ""} 
                readOnly 
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none opacity-60 cursor-not-allowed" 
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Phone</label>
              <input 
                value={isEditingProfile ? editForm.phone : (profile?.phone || "")}
                onChange={e => setEditForm({...editForm, phone: e.target.value})}
                readOnly={!isEditingProfile} 
                className={`w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none transition-colors ${isEditingProfile ? 'focus:border-primary' : 'opacity-80 cursor-default'}`} 
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Role</label>
              <input 
                value={profile?.role || ""} 
                readOnly 
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none opacity-60 cursor-not-allowed uppercase" 
              />
            </div>
          </div>
        )}
        
        {isEditingProfile && (
          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={() => {
                setIsEditingProfile(false);
                setEditForm({ name: profile?.name || "", phone: profile?.phone || "" });
              }} 
              className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                updateProfileMutation.mutate({
                  name: editForm.name,
                  phone: editForm.phone
                });
              }}
              disabled={updateProfileMutation.isPending}
              className="px-4 py-2 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none"
            >
              {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="glow-border rounded-xl bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Notification Preferences</h3>
        <div className="space-y-3">
          {notifOptions.map(n => (
            <div key={n.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <Switch defaultChecked={n.default} />
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="glow-border rounded-xl bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Security</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-sm">Change Password</p>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-secondary text-sm hover:bg-muted transition-colors"
            >
              Change
            </button>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">Coming soon</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm">Active Sessions</p>
              <p className="text-xs text-muted-foreground">1 active session</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-secondary text-sm hover:bg-muted transition-colors">Manage</button>
          </div>
        </div>
      </div>
      
      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/30">
              <h3 className="font-semibold">Change Password</h3>
              <button onClick={closePasswordModal} className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type={showOld ? "text" : "password"} 
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none" tabIndex="-1">
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type={showNew ? "text" : "password"} 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none" tabIndex="-1">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type={showConfirm ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none" tabIndex="-1">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={closePasswordModal} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors focus:outline-none">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={changePasswordMutation.isPending || !oldPassword || !newPassword || !confirmPassword}
                  className="px-4 py-2 flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none"
                >
                  {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}