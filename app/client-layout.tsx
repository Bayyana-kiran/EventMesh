"use client";

import { AuthProvider } from "@/lib/auth/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/lib/providers";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </Providers>
  );
}
