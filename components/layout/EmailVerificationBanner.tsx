"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Mail, X, Loader2 } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

export function EmailVerificationBanner() {
  const { user, isEmailVerified, resendVerification } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();

  // Don't show if:
  // 1. No user
  // 2. Email is verified
  // 3. User is OAuth (they're auto-verified)
  // 4. Banner was dismissed
  if (!user || isEmailVerified() || isDismissed) {
    return null;
  }

  // Check if user signed in with OAuth (they have providers in prefs)
  const hasOAuthProvider = user.prefs && Object.keys(user.prefs).length > 0;
  if (hasOAuthProvider) {
    return null;
  }

  const handleResend = async () => {
    setIsSending(true);
    try {
      await resendVerification();
      toast({
        title: "Verification email sent",
        description: `We've sent a verification link to ${user.email}`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Failed to send verification email",
        description: errorMessage || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Please verify your email address
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
                We sent a verification link to <strong>{user.email}</strong>.
                Check your inbox and spam folder.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResend}
              disabled={isSending}
              className="border-amber-500/30 hover:bg-amber-500/10"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Email"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsDismissed(true)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
