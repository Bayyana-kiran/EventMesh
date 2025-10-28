"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  const verifyEmail = useCallback(
    async (userId: string, secret: string) => {
      try {
        await account.updateVerification(userId, secret);
        setStatus("success");
        setMessage(
          "Your email has been verified successfully! You can now access all features."
        );

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (error: unknown) {
        console.error("Verification failed:", error);
        setStatus("error");

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("expired")) {
          setMessage(
            "This verification link has expired. Please request a new one from your dashboard."
          );
        } else if (errorMessage.includes("Invalid")) {
          setMessage(
            "This verification link is invalid. Please check your email or request a new verification link."
          );
        } else {
          setMessage(
            "Failed to verify your email. Please try again or contact support if the problem persists."
          );
        }
      }
    },
    [router]
  );

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    if (!userId || !secret) {
      setStatus("error");
      setMessage(
        "Invalid verification link. Please check your email for the correct link."
      );
      return;
    }

    verifyEmail(userId, secret);
  }, [searchParams, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>
          <CardTitle>
            {status === "loading" && "Verifying Your Email"}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your email address...
            </p>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Redirecting you to the dashboard...
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
