"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { account, databases } from "@/lib/appwrite/client";
import { APPWRITE_DATABASE_ID, COLLECTION_IDS } from "@/lib/constants";
import { Models, ID, Query } from "appwrite";
import { useRouter } from "next/navigation";
import type { Workspace } from "@/lib/types";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  workspace: Workspace | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadWorkspace = async (userId: string) => {
    try {
      const response = await databases.listDocuments<Workspace>(
        APPWRITE_DATABASE_ID,
        COLLECTION_IDS.WORKSPACES,
        [Query.equal("owner_id", userId)]
      );

      if (response.documents.length > 0) {
        setWorkspace(response.documents[0]);
      } else {
        // Create workspace if none exists
        try {
          const newWorkspace = await databases.createDocument<Workspace>(
            APPWRITE_DATABASE_ID,
            COLLECTION_IDS.WORKSPACES,
            ID.unique(),
            {
              name: "My Workspace",
              owner_id: userId,
              created_at: new Date().toISOString(),
              settings: JSON.stringify({
                timezone: "UTC",
                retention_days: 30,
              }),
            }
          );
          setWorkspace(newWorkspace);
        } catch (createError: any) {
          console.error("Failed to create workspace:", createError);
          console.error(
            "Please set permissions on the 'workspaces' collection in Appwrite Console"
          );
          // Set a temporary workspace object so the app doesn't break
          const tempWorkspace: any = {
            $id: "temp-workspace",
            name: "Temporary Workspace (Fix Permissions)",
            owner_id: userId,
            created_at: new Date().toISOString(),
            settings: JSON.stringify({
              timezone: "UTC",
              retention_days: 30,
            }),
          };
          setWorkspace(tempWorkspace);
        }
      }
    } catch (error) {
      console.error("Failed to load workspace:", error);
    }
  };

  const checkSession = async () => {
    try {
      const session = await account.get();
      setUser(session);
      await loadWorkspace(session.$id);
    } catch (error) {
      setUser(null);
      setWorkspace(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    // Listen for OAuth callback completion
    // When user returns from OAuth provider, check session again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const session = await account.get();
      setUser(session);
      await loadWorkspace(session.$id);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      await account.create(ID.unique(), email, password, name);
      await login(email, password);
    } catch (error: any) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setWorkspace(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        loading,
        login,
        signup,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
