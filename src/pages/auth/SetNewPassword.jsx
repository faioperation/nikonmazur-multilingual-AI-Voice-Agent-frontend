import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function SetNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const email = localStorage.getItem("reset_email");

  const resetPasswordMutation = useMutation({
    mutationFn: (data) => api.post("/auth/reset-password/", data),
    onSuccess: () => {
      toast.success("Password reset successfully! Please login.");
      // Clear the email from local storage
      localStorage.removeItem("reset_email");
      navigate("/login");
    },
    onError: (err) => {
      console.error("Reset password failed:", err);
      toast.error(err.response?.data?.message || "Failed to reset password. Please try again.");
    }
  });

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (!email) {
      toast.error("Email not found. Please restart the process.");
      navigate("/forgot-password");
      return;
    }
    
    resetPasswordMutation.mutate({
      email,
      new_password: password,
      confirm_password: confirmPassword
    });
  };

  const isLoading = resetPasswordMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
      
      <div className="w-full max-w-md z-10 glow-border rounded-2xl bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Set New Password</h1>
          <p className="text-sm text-muted-foreground mt-2">Create a new secure password for your account.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-10 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-9 pr-10 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !password || !confirmPassword}
            className="w-full py-2.5 flex justify-center items-center gap-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all mt-6 shadow-[0_0_15px_rgba(var(--primary),0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
