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
  workspaces: Workspace[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  deleteWorkspace: (
    workspaceId: string,
    confirmationText: string
  ) => Promise<void>;
  resendVerification: () => Promise<void>;
  isEmailVerified: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadWorkspaces = async (userId: string, selectFirst = true) => {
    try {
      const response = await databases.listDocuments<Workspace>(
        APPWRITE_DATABASE_ID,
        COLLECTION_IDS.WORKSPACES,
        [Query.equal("owner_id", userId), Query.orderDesc("$createdAt")]
      );

      setWorkspaces(response.documents);

      if (response.documents.length > 0) {
        // Check for saved workspace in localStorage
        const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");
        const savedWorkspace = savedWorkspaceId
          ? response.documents.find((w) => w.$id === savedWorkspaceId)
          : null;

        // Use saved workspace, or first one if selectFirst is true
        if (savedWorkspace) {
          setWorkspace(savedWorkspace);
        } else if (selectFirst) {
          setWorkspace(response.documents[0]);
          localStorage.setItem("currentWorkspaceId", response.documents[0].$id);
        }
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
          setWorkspaces([newWorkspace]);
          setWorkspace(newWorkspace);
          localStorage.setItem("currentWorkspaceId", newWorkspace.$id);
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
          setWorkspaces([tempWorkspace]);
          setWorkspace(tempWorkspace);
        }
      }
    } catch (error) {
      console.error("Failed to load workspaces:", error);
    }
  };

  const switchWorkspace = async (workspaceId: string) => {
    const selectedWorkspace = workspaces.find((w) => w.$id === workspaceId);
    if (selectedWorkspace) {
      setWorkspace(selectedWorkspace);
      localStorage.setItem("currentWorkspaceId", workspaceId);
    }
  };

  const refreshWorkspaces = async () => {
    if (user?.$id) {
      await loadWorkspaces(user.$id, false);
    }
  };

  const deleteWorkspace = async (
    workspaceId: string,
    confirmationText: string
  ) => {
    if (!user?.$id) {
      throw new Error("User not authenticated");
    }

    const response = await fetch("/api/workspace/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        userId: user.$id,
        confirmationText,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to delete workspace");
    }

    // Remove from local state
    const updatedWorkspaces = workspaces.filter((w) => w.$id !== workspaceId);
    setWorkspaces(updatedWorkspaces);

    // If deleted workspace was the current one, switch to another
    if (workspace?.$id === workspaceId) {
      if (updatedWorkspaces.length > 0) {
        setWorkspace(updatedWorkspaces[0]);
        localStorage.setItem("currentWorkspaceId", updatedWorkspaces[0].$id);
      } else {
        setWorkspace(null);
        localStorage.removeItem("currentWorkspaceId");
      }
    }

    return data;
  };

  const checkSession = async () => {
    try {
      const session = await account.get();

      // Check if user has no name (common with OAuth logins)
      // Try to update it from their prefs or email
      if (
        !session.name ||
        session.name === "" ||
        session.name === session.email
      ) {
        try {
          // For GitHub OAuth users, try to get name from prefs
          const prefs = session.prefs as any;
          let newName = "";

          // GitHub stores name in different possible locations
          if (prefs?.name) {
            newName = prefs.name;
          } else if (prefs?.login) {
            // GitHub username
            newName = prefs.login;
          } else {
            // Fallback to email username
            newName = session.email.split("@")[0];
          }

          // Update the user's name if we found one
          if (newName && newName !== session.name) {
            await account.updateName(newName);
            // Re-fetch session to get updated name
            const updatedSession = await account.get();
            setUser(updatedSession);
            await loadWorkspaces(updatedSession.$id);
          } else {
            setUser(session);
            await loadWorkspaces(session.$id);
          }
        } catch (updateError) {
          console.error("Could not update user name:", updateError);
          setUser(session);
          await loadWorkspaces(session.$id);
        }
      } else {
        setUser(session);
        await loadWorkspaces(session.$id);
      }
    } catch (error) {
      setUser(null);
      setWorkspace(null);
      setWorkspaces([]);
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
      await loadWorkspaces(session.$id);

      // Check if email is verified for email/password users
      // OAuth users are automatically verified
      if (!session.emailVerification) {
        console.warn("Email not verified");
        // Still allow login but show warning in UI
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      // Create user account
      const newUser = await account.create(ID.unique(), email, password, name);

      // Send verification email
      try {
        await account.createVerification(
          `${
            typeof window !== "undefined" ? window.location.origin : ""
          }/verify-email`
        );
      } catch (verifyError) {
        console.error("Failed to send verification email:", verifyError);
        // Don't fail signup if verification email fails
      }

      // Log the user in
      await login(email, password);
    } catch (error: unknown) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const resendVerification = async () => {
    if (!user) {
      throw new Error("No user logged in");
    }

    try {
      await account.createVerification(
        `${
          typeof window !== "undefined" ? window.location.origin : ""
        }/verify-email`
      );
    } catch (error: unknown) {
      console.error("Failed to resend verification:", error);
      throw error;
    }
  };

  const isEmailVerified = (): boolean => {
    if (!user) return false;
    return user.emailVerification;
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setWorkspace(null);
      setWorkspaces([]);
      localStorage.removeItem("currentWorkspaceId");
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
        workspaces,
        loading,
        login,
        signup,
        logout,
        checkSession,
        switchWorkspace,
        refreshWorkspaces,
        deleteWorkspace,
        resendVerification,
        isEmailVerified,
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
