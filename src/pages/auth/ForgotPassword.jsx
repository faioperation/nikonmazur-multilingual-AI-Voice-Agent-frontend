import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, KeyRound, ArrowLeft, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const forgotPasswordMutation = useMutation({
    mutationFn: (data) => api.post("/auth/forgot-password/", data),
    onSuccess: () => {
      // Save email to local storage so it persists even if they refresh the OTP page
      localStorage.setItem("reset_email", email);
      toast.success("Please check your email for the verification code.");
      navigate("/otp-verify");
    },
    onError: (err) => {
      console.error("Forgot password failed:", err);
      toast.error(err.response?.data?.message || "Failed to send OTP. Please try again.");
    }
  });

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!email) return;
    forgotPasswordMutation.mutate({ email });
  };

  const isLoading = forgotPasswordMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
      
      <div className="w-full max-w-md z-10 glow-border rounded-2xl bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Forgot Password</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter your email address and we'll send you an OTP to reset your password.</p>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-5">
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

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2.5 flex justify-center items-center gap-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all mt-6 shadow-[0_0_15px_rgba(var(--primary),0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
