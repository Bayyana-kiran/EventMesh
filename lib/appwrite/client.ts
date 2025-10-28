import { Client, Account, Databases, Storage, Functions } from "appwrite";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/lib/constants";

// Client-side Appwrite client
const client = new Client();

client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);

export { client };
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Helper to get current user
export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

// Helper to create session
export async function createEmailSession(email: string, password: string) {
  return await account.createEmailPasswordSession(email, password);
}

// Helper to create account
export async function createAccount(
  email: string,
  password: string,
  name: string
) {
  return await account.create("unique()", email, password, name);
}

// Helper to logout
export async function logout() {
  return await account.deleteSession("current");
}
