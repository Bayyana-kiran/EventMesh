export const APPWRITE_ENDPOINT =
  process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || "";
export const APPWRITE_DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID || "eventmesh-db";

// Collection IDs
export const COLLECTION_IDS = {
  WORKSPACES: "workspaces",
  FLOWS: "flows",
  EVENTS: "events",
  EXECUTIONS: "executions",
  DESTINATIONS: "destinations",
  API_KEYS: "api_keys",
  ANALYTICS: "analytics",
  NOTIFICATIONS: "notifications",
} as const;
