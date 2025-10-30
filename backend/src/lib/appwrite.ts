import { Client, Databases } from "node-appwrite";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "../lib/constants";

// Server-side Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY!);

export const databases = new Databases(client);
