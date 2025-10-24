#!/usr/bin/env node

/**
 * Script to generate a new API key
 * Run with: node scripts/generate-api-key.js
 */

const crypto = require("crypto");

function generateApiKey() {
  const prefix = "pk_live_";
  const randomBytes = crypto.randomBytes(32).toString("hex");
  return prefix + randomBytes;
}

function generateTestKey() {
  const prefix = "pk_test_";
  const randomBytes = crypto.randomBytes(32).toString("hex");
  return prefix + randomBytes;
}

console.log("🔑 Generating API Keys...\n");
console.log("Production Key:");
console.log(generateApiKey());
console.log("\nTest Key:");
console.log(generateTestKey());
console.log("\n✅ Keys generated! Store these securely.");
