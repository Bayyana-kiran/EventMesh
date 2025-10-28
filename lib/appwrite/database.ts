import { databases } from "./client";
import { APPWRITE_DATABASE_ID, COLLECTION_IDS } from "@/lib/constants";
import type {
  Flow,
  Event,
  Execution,
  Destination,
  ApiKey,
  Analytics,
  Workspace,
} from "@/lib/types";
import { ID, Query } from "appwrite";

// ============================================================================
// WORKSPACES
// ============================================================================

export async function createWorkspace(name: string, ownerId: string) {
  return await databases.createDocument<Workspace>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.WORKSPACES,
    ID.unique(),
    {
      name,
      owner_id: ownerId,
      created_at: new Date().toISOString(),
      settings: JSON.stringify({
        timezone: "UTC",
        retention_days: 30,
      }),
    }
  );
}

export async function getWorkspacesByUser(userId: string) {
  return await databases.listDocuments<Workspace>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.WORKSPACES,
    [Query.equal("owner_id", userId)]
  );
}

// ============================================================================
// FLOWS
// ============================================================================

export async function createFlow(
  workspaceId: string,
  name: string,
  description: string
) {
  return await databases.createDocument<Flow>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.FLOWS,
    ID.unique(),
    {
      workspace_id: workspaceId,
      name,
      description,
      status: "draft",
      nodes: [],
      edges: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  );
}

export async function updateFlow(flowId: string, data: Partial<Flow>) {
  return await databases.updateDocument<Flow>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.FLOWS,
    flowId,
    {
      ...data,
      updated_at: new Date().toISOString(),
    }
  );
}

export async function getFlow(flowId: string) {
  return await databases.getDocument<Flow>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.FLOWS,
    flowId
  );
}

export async function listFlows(workspaceId: string) {
  return await databases.listDocuments<Flow>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.FLOWS,
    [Query.equal("workspace_id", workspaceId), Query.orderDesc("created_at")]
  );
}

export async function deleteFlow(flowId: string) {
  return await databases.deleteDocument(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.FLOWS,
    flowId
  );
}

// ============================================================================
// EVENTS
// ============================================================================

export async function createEvent(
  data: Omit<
    Event,
    | "$id"
    | "$createdAt"
    | "$updatedAt"
    | "$permissions"
    | "$databaseId"
    | "$collectionId"
  >
) {
  return await databases.createDocument<Event>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.EVENTS,
    ID.unique(),
    data
  );
}

export async function getEvent(eventId: string) {
  return await databases.getDocument<Event>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.EVENTS,
    eventId
  );
}

export async function listEvents(workspaceId: string, limit: number = 50) {
  return await databases.listDocuments<Event>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.EVENTS,
    [
      Query.equal("workspace_id", workspaceId),
      Query.orderDesc("received_at"),
      Query.limit(limit),
    ]
  );
}

export async function listEventsByFlow(flowId: string, limit: number = 50) {
  return await databases.listDocuments<Event>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.EVENTS,
    [
      Query.equal("flow_id", flowId),
      Query.orderDesc("received_at"),
      Query.limit(limit),
    ]
  );
}

// ============================================================================
// EXECUTIONS
// ============================================================================

export async function createExecution(
  data: Omit<
    Execution,
    | "$id"
    | "$createdAt"
    | "$updatedAt"
    | "$permissions"
    | "$databaseId"
    | "$collectionId"
  >
) {
  return await databases.createDocument<Execution>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.EXECUTIONS,
    ID.unique(),
    data
  );
}

export async function updateExecution(
  executionId: string,
  data: Partial<Execution>
) {
  return await databases.updateDocument<Execution>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.EXECUTIONS,
    executionId,
    data
  );
}

export async function getExecution(executionId: string) {
  return await databases.getDocument<Execution>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.EXECUTIONS,
    executionId
  );
}

// ============================================================================
// DESTINATIONS
// ============================================================================

export async function createDestination(
  data: Omit<
    Destination,
    | "$id"
    | "$createdAt"
    | "$updatedAt"
    | "$permissions"
    | "$databaseId"
    | "$collectionId"
  >
) {
  return await databases.createDocument<Destination>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.DESTINATIONS,
    ID.unique(),
    data
  );
}

export async function listDestinations(workspaceId: string) {
  return await databases.listDocuments<Destination>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.DESTINATIONS,
    [Query.equal("workspace_id", workspaceId), Query.orderDesc("created_at")]
  );
}

export async function deleteDestination(destinationId: string) {
  return await databases.deleteDocument(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.DESTINATIONS,
    destinationId
  );
}

// ============================================================================
// API KEYS
// ============================================================================

export async function createApiKey(
  data: Omit<
    ApiKey,
    | "$id"
    | "$createdAt"
    | "$updatedAt"
    | "$permissions"
    | "$databaseId"
    | "$collectionId"
  >
) {
  return await databases.createDocument<ApiKey>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.API_KEYS,
    ID.unique(),
    data
  );
}

export async function listApiKeys(workspaceId: string) {
  return await databases.listDocuments<ApiKey>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.API_KEYS,
    [Query.equal("workspace_id", workspaceId), Query.orderDesc("created_at")]
  );
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function getAnalytics(
  workspaceId: string,
  flowId?: string,
  days: number = 7
) {
  const queries = [
    Query.equal("workspace_id", workspaceId),
    Query.orderDesc("date"),
    Query.limit(days * 24), // hourly data
  ];

  if (flowId) {
    queries.push(Query.equal("flow_id", flowId));
  }

  return await databases.listDocuments<Analytics>(
    APPWRITE_DATABASE_ID,
    COLLECTION_IDS.ANALYTICS,
    queries
  );
}
