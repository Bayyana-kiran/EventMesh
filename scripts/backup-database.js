#!/usr/bin/env node

/**
 * Script to backup database collections
 * Run with: node scripts/backup-database.js
 */

const { Client, Databases } = require("node-appwrite");
const fs = require("fs");
const path = require("path");

const client = new Client()
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

const databases = new Databases(client);
const databaseId =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "eventmesh-db";

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(__dirname, "..", "backups", timestamp);

  console.log(`📦 Creating backup in ${backupDir}...\n`);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const collections = [
    "workspaces",
    "flows",
    "events",
    "executions",
    "destinations",
    "api_keys",
  ];

  try {
    for (const collectionId of collections) {
      console.log(`Backing up ${collectionId}...`);

      let allDocuments = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await databases.listDocuments(
          databaseId,
          collectionId,
          [],
          limit,
          offset
        );

        allDocuments = allDocuments.concat(response.documents);
        offset += limit;
        hasMore = response.documents.length === limit;
      }

      const filePath = path.join(backupDir, `${collectionId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(allDocuments, null, 2));
      console.log(
        `✅ Backed up ${allDocuments.length} documents from ${collectionId}`
      );
    }

    console.log(`\n🎉 Backup complete! Saved to ${backupDir}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

backupDatabase();
