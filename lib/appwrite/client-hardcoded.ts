import { Client, Account, Databases, Storage, Functions } from "appwrite";

// Temporary hardcoded client for testing
const client = new Client();

client
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("68fbf56a0024726bc87e");

console.log("Hardcoded Appwrite client initialized with:", {
  endpoint: "https://nyc.cloud.appwrite.io/v1",
  project: "68fbf56a0024726bc87e",
});

export { client };
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
