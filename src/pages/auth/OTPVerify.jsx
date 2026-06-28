import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function OTPVerify() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("reset_email");

  const verifyMutation = useMutation({
    mutationFn: (data) => api.post("/auth/verify-otp/", data),
    onSuccess: (response) => {
      toast.success("OTP verified successfully!");
      // Navigate to set new password, passing only the OTP since email is in local storage
      navigate("/set-new-password", { state: { otp } });
    },
    onError: (err) => {
      console.error("OTP verification failed:", err);
      toast.error(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  });

  const resendOtpMutation = useMutation({
    mutationFn: () => api.post("/auth/resend-otp/", { email }),
    onSuccess: () => {
      toast.success("OTP resent successfully! Please check your email.");
    },
    onError: (err) => {
      console.error("Resend OTP failed:", err);
      toast.error(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    }
  });

  const handleVerify = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email not found. Please restart the process.");
      navigate("/forgot-password");
      return;
    }
    if (!otp) return;
    
    verifyMutation.mutate({ email, otp });
  };

  const handleResend = () => {
    if (!email) {
      toast.error("Email not found. Please restart the process.");
      navigate("/forgot-password");
      return;
    }
    resendOtpMutation.mutate();
  };

  const isLoading = verifyMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
      
      <div className="w-full max-w-md z-10 glow-border rounded-2xl bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify OTP</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter the 6-digit code we sent to your email.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6 flex flex-col items-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-12 h-12 text-lg border-border bg-secondary/50" />
              <InputOTPSlot index={1} className="w-12 h-12 text-lg border-border bg-secondary/50" />
              <InputOTPSlot index={2} className="w-12 h-12 text-lg border-border bg-secondary/50" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} className="w-12 h-12 text-lg border-border bg-secondary/50" />
              <InputOTPSlot index={4} className="w-12 h-12 text-lg border-border bg-secondary/50" />
              <InputOTPSlot index={5} className="w-12 h-12 text-lg border-border bg-secondary/50" />
            </InputOTPGroup>
          </InputOTP>

          <button 
            type="submit" 
            disabled={isLoading || otp.length < 4}
            className="w-full py-2.5 flex justify-center items-center gap-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Code"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive a code?{" "}
            <button 
              onClick={handleResend}
              disabled={resendOtpMutation.isPending}
              className="text-primary hover:underline font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {resendOtpMutation.isPending ? "Resending..." : "Resend OTP"}
            </button>
          </p>
          <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Change Email
          </Link>
        </div>
      </div>
    </div>
  );
}
