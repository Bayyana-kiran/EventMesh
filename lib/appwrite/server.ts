import { Client, Databases, Storage, Functions, Users } from "node-appwrite";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/lib/constants";

// Server-side Appwrite client (for API routes and server components)
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY!);

  return {
    client,
    databases: new Databases(client),
    storage: new Storage(client),
    functions: new Functions(client),
    users: new Users(client),
  };
}

// Helper to create session client (for server actions)
export function createSessionClient(session: string) {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setJWT(session);

  return {
    client,
    databases: new Databases(client),
    storage: new Storage(client),
    functions: new Functions(client),
  };
}

// Default admin client instance for API routes
const adminClient = createAdminClient();
export const databases = adminClient.databases;
export const storage = adminClient.storage;
export const functions = adminClient.functions;
export const users = adminClient.users;
