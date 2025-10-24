#!/usr/bin/env node

/**
 * Script to clean up old events and executions
 * Run with: node scripts/cleanup-old-data.js [days]
 * Example: node scripts/cleanup-old-data.js 30
 */

const { Client, Databases, Query } = require("node-appwrite");

const client = new Client()
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

const databases = new Databases(client);
const databaseId =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "eventmesh-db";

async function cleanupOldData(daysOld = 30) {
  console.log(`🧹 Cleaning up data older than ${daysOld} days...\n`);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  const cutoffISO = cutoffDate.toISOString();

  try {
    // Clean up old events
    console.log("Cleaning up events...");
    const events = await databases.listDocuments(databaseId, "events", [
      Query.lessThan("receivedAt", cutoffISO),
    ]);

    for (const event of events.documents) {
      await databases.deleteDocument(databaseId, "events", event.$id);
    }
    console.log(`✅ Deleted ${events.documents.length} old events`);

    // Clean up old executions
    console.log("Cleaning up executions...");
    const executions = await databases.listDocuments(databaseId, "executions", [
      Query.lessThan("startedAt", cutoffISO),
    ]);

    for (const execution of executions.documents) {
      await databases.deleteDocument(databaseId, "executions", execution.$id);
    }
    console.log(`✅ Deleted ${executions.documents.length} old executions`);

    console.log("\n🎉 Cleanup complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

const daysArg = process.argv[2] ? parseInt(process.argv[2]) : 30;
cleanupOldData(daysArg);
