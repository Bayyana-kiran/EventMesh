#!/usr/bin/env node

/**
 * Script to set up Appwrite database collections
 * Run with: node scripts/setup-appwrite.js
 */

require("dotenv").config({ path: ".env.local" });
const { Client, Databases, ID } = require("node-appwrite");

console.log(
  "Using Appwrite Project:",
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
);

const client = new Client()
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

const databases = new Databases(client);
const databaseId =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "eventmesh-db";

async function createCollections() {
  console.log("🚀 Setting up Appwrite collections...\n");

  try {
    // Create database
    console.log("Creating database...");
    try {
      await databases.create(databaseId, "EventMesh Database");
      console.log("✅ Database created\n");
    } catch (error) {
      if (error.code === 409) {
        console.log("ℹ️  Database already exists\n");
      } else {
        throw error;
      }
    }

    // Define collections
    const collections = [
      {
        id: "workspaces",
        name: "Workspaces",
        attributes: [
          { key: "name", type: "string", size: 255, required: true },
          { key: "slug", type: "string", size: 255, required: true },
          { key: "ownerId", type: "string", size: 255, required: true },
        ],
      },
      {
        id: "flows",
        name: "Flows",
        attributes: [
          { key: "name", type: "string", size: 255, required: true },
          { key: "description", type: "string", size: 1000, required: false },
          { key: "workspaceId", type: "string", size: 255, required: true },
          { key: "webhookId", type: "string", size: 255, required: true },
          {
            key: "status",
            type: "string",
            size: 50,
            required: true,
            default: "active",
          },
          { key: "nodes", type: "string", size: 100000, required: false },
          { key: "edges", type: "string", size: 100000, required: false },
        ],
      },
      {
        id: "events",
        name: "Events",
        attributes: [
          { key: "webhookId", type: "string", size: 255, required: true },
          { key: "name", type: "string", size: 255, required: true },
          { key: "payload", type: "string", size: 100000, required: true },
          { key: "headers", type: "string", size: 10000, required: false },
          { key: "status", type: "string", size: 50, required: true },
          { key: "method", type: "string", size: 10, required: true },
          { key: "sourceIp", type: "string", size: 50, required: false },
          { key: "receivedAt", type: "datetime", required: true },
        ],
      },
      {
        id: "executions",
        name: "Executions",
        attributes: [
          { key: "eventId", type: "string", size: 255, required: true },
          { key: "flowId", type: "string", size: 255, required: true },
          { key: "status", type: "string", size: 50, required: true },
          { key: "steps", type: "string", size: 100000, required: false },
          { key: "output", type: "string", size: 100000, required: false },
          { key: "error", type: "string", size: 5000, required: false },
          { key: "startedAt", type: "datetime", required: true },
          { key: "completedAt", type: "datetime", required: false },
          { key: "duration", type: "integer", required: false },
        ],
      },
      {
        id: "destinations",
        name: "Destinations",
        attributes: [
          { key: "name", type: "string", size: 255, required: true },
          { key: "type", type: "string", size: 50, required: true },
          { key: "workspaceId", type: "string", size: 255, required: true },
          { key: "config", type: "string", size: 10000, required: true },
          {
            key: "status",
            type: "string",
            size: 50,
            required: true,
            default: "active",
          },
        ],
      },
      {
        id: "api_keys",
        name: "API Keys",
        attributes: [
          { key: "name", type: "string", size: 255, required: true },
          { key: "key", type: "string", size: 255, required: true },
          { key: "workspaceId", type: "string", size: 255, required: true },
          {
            key: "status",
            type: "string",
            size: 50,
            required: true,
            default: "active",
          },
          { key: "lastUsedAt", type: "datetime", required: false },
        ],
      },
    ];

    // Create each collection
    for (const collection of collections) {
      console.log(`Creating collection: ${collection.name}...`);
      try {
        await databases.createCollection(
          databaseId,
          collection.id,
          collection.name
        );
        console.log(`✅ Collection ${collection.name} created`);

        // Create attributes
        for (const attr of collection.attributes) {
          console.log(`  Adding attribute: ${attr.key}`);
          if (attr.type === "string") {
            await databases.createStringAttribute(
              databaseId,
              collection.id,
              attr.key,
              attr.size,
              attr.required,
              attr.default
            );
          } else if (attr.type === "datetime") {
            await databases.createDatetimeAttribute(
              databaseId,
              collection.id,
              attr.key,
              attr.required
            );
          } else if (attr.type === "integer") {
            await databases.createIntegerAttribute(
              databaseId,
              collection.id,
              attr.key,
              attr.required
            );
          }
        }
        console.log(`✅ Attributes added to ${collection.name}\n`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️  Collection ${collection.name} already exists\n`);
        } else {
          throw error;
        }
      }
    }

    console.log("🎉 Setup complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createCollections();
