#!/usr/bin/env node

/**
 * Script to seed the database with sample data
 * Run with: node scripts/seed-data.js
 */

const { Client, Databases, ID } = require("node-appwrite");

const client = new Client()
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

const databases = new Databases(client);
const databaseId =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "eventmesh-db";

async function seedData() {
  console.log("🌱 Seeding database with sample data...\n");

  try {
    // Create sample workspace
    console.log("Creating sample workspace...");
    const workspace = await databases.createDocument(
      databaseId,
      "workspaces",
      ID.unique(),
      {
        name: "Demo Workspace",
        slug: "demo-workspace",
        ownerId: "demo-user",
      }
    );
    console.log("✅ Workspace created:", workspace.$id);

    // Create sample flows
    console.log("\nCreating sample flows...");
    const flow1 = await databases.createDocument(
      databaseId,
      "flows",
      ID.unique(),
      {
        name: "GitHub to Slack",
        description: "Forward GitHub push events to Slack #engineering",
        workspaceId: workspace.$id,
        webhookId: "wh_demo_" + Date.now(),
        status: "active",
        nodes: JSON.stringify([
          {
            id: "1",
            type: "source",
            position: { x: 100, y: 100 },
            data: { label: "GitHub Webhook" },
          },
          {
            id: "2",
            type: "transform",
            position: { x: 300, y: 100 },
            data: { label: "Format Message" },
          },
          {
            id: "3",
            type: "destination",
            position: { x: 500, y: 100 },
            data: { label: "Slack" },
          },
        ]),
        edges: JSON.stringify([
          { id: "e1-2", source: "1", target: "2" },
          { id: "e2-3", source: "2", target: "3" },
        ]),
      }
    );
    console.log("✅ Flow created:", flow1.name);

    // Create sample destination
    console.log("\nCreating sample destination...");
    const destination = await databases.createDocument(
      databaseId,
      "destinations",
      ID.unique(),
      {
        name: "Slack Engineering",
        type: "slack",
        workspaceId: workspace.$id,
        config: JSON.stringify({
          webhookUrl: "https://hooks.slack.com/services/DEMO/WEBHOOK/URL",
          channel: "#engineering",
        }),
        status: "active",
      }
    );
    console.log("✅ Destination created:", destination.name);

    console.log("\n🎉 Seeding complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

seedData();
