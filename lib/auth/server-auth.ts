/**
 * Server-side authentication and authorization utilities
 * Use these in API routes to verify user identity and workspace access
 */

import { cookies } from "next/headers";
import { Account, Client, Databases, Query } from "node-appwrite";
import { APPWRITE_DATABASE_ID, COLLECTION_IDS } from "@/lib/constants";

/**
 * Get the authenticated user from the session
 * Returns null if no valid session
 */
export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(
      `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
    );

    if (!session) {
      return null;
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

    // Set the session
    client.setSession(session.value);

    const account = new Account(client);
    const user = await account.get();

    return user;
  } catch (error) {
    console.error("Failed to get authenticated user:", error);
    return null;
  }
}

/**
 * Get the user's workspace
 * Returns null if user not authenticated or workspace not found
 */
export async function getUserWorkspace(userId: string) {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);

    const workspaces = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.WORKSPACES,
      [Query.equal("owner_id", userId)]
    );

    if (workspaces.documents.length === 0) {
      return null;
    }

    return workspaces.documents[0];
  } catch (error) {
    console.error("Failed to get user workspace:", error);
    return null;
  }
}

/**
 * Verify that the workspaceId belongs to the authenticated user
 * Throws error if not authorized
 */
export async function verifyWorkspaceAccess(
  workspaceId: string,
  userId: string
) {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);

    const workspace = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTION_IDS.WORKSPACES,
      workspaceId
    );

    if (workspace.owner_id !== userId) {
      throw new Error("Unauthorized access to workspace");
    }

    return workspace;
  } catch (error) {
    console.error("Workspace access verification failed:", error);
    throw new Error("Unauthorized access to workspace");
  }
}

/**
 * Verify that a resource (flow, event, etc.) belongs to the user's workspace
 */
export async function verifyResourceAccess(
  collectionId: string,
  resourceId: string,
  userId: string
) {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);

    // Get the resource
    const resource = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      collectionId,
      resourceId
    );

    // Get user's workspace
    const workspace = await getUserWorkspace(userId);

    if (!workspace) {
      throw new Error("User workspace not found");
    }

    // Check if resource belongs to user's workspace
    if (resource.workspace_id !== workspace.$id) {
      throw new Error("Unauthorized access to resource");
    }

    return resource;
  } catch (error) {
    console.error("Resource access verification failed:", error);
    throw new Error("Unauthorized access to resource");
  }
}

/**
 * Get authenticated user and their workspace in one call
 * Returns { user, workspace } or null if not authenticated
 */
export async function getAuthContext() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return null;
    }

    const workspace = await getUserWorkspace(user.$id);
    if (!workspace) {
      return null;
    }

    return { user, workspace };
  } catch (error) {
    console.error("Failed to get auth context:", error);
    return null;
  }
}
