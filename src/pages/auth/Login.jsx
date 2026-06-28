import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: (credentials) => api.post("/auth/login/", credentials),
    onSuccess: (response) => {
      if (response.data && response.data.tokens) {
        toast.success("Login successful!");
        login(response.data.tokens, response.data.user, response.data.must_change_password);
      } else {
        toast.error("Invalid response from server");
      }
    },
    onError: (err) => {
      console.error("Login failed:", err);
      toast.error(err.response?.data?.message || "Failed to sign in. Please check your credentials.");
    }
  });

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const isLoading = loginMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
      
      <div className="w-full max-w-md z-10 glow-border rounded-2xl bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to your Gloura Analytics account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="name@company.com"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
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
            <Link to="/forgot-password" className="text-xs text-primary hover:underline flex justify-end mt-2">Forgot password?</Link>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2.5 flex justify-center items-center gap-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all mt-6 shadow-[0_0_15px_rgba(var(--primary),0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </button>
        </form>

        
      </div>
    </div>
  );
}
