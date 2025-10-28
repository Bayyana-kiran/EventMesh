"use client";

import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
} from "@/lib/constants";
import { client, account } from "@/lib/appwrite/client";
import { useState } from "react";
import { ID } from "appwrite";

export default function DebugPage() {
  const [testResult, setTestResult] = useState<string>("");

  const env = {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_DATABASE_ID,
    RAW_ENV_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    RAW_ENV_PROJECT: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Environment Debug</h1>

      <div>
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
          {JSON.stringify(env, null, 2)}
        </pre>
        {(!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) && (
          <div className="mt-2 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive font-semibold">
              ⚠️ Environment variables are not loaded!
            </p>
            <p className="text-sm mt-2">
              This usually means the .env.local file is not in the correct
              location or the server needs to be restarted.
            </p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Appwrite Client Info</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
          {JSON.stringify(
            {
              clientConfig: {
                endpoint: APPWRITE_ENDPOINT,
                project: APPWRITE_PROJECT_ID,
              },
            },
            null,
            2
          )}
        </pre>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Test Appwrite Connection</h2>
        <div className="space-y-2">
          <button
            onClick={async () => {
              try {
                setTestResult("Testing connection...");
                console.log("Testing with endpoint:", APPWRITE_ENDPOINT);
                console.log("Testing with project:", APPWRITE_PROJECT_ID);

                if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
                  setTestResult("❌ Environment variables not loaded!");
                  return;
                }

                const response = await fetch(`${APPWRITE_ENDPOINT}/health`, {
                  method: "GET",
                  headers: {
                    "X-Appwrite-Project": APPWRITE_PROJECT_ID,
                  },
                });

                if (!response.ok) {
                  throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                  );
                }

                const data = await response.json();
                console.log("Appwrite health check:", data);
                setTestResult(`✅ Success! Appwrite status: ${data.status}`);
              } catch (error: any) {
                console.error("Appwrite health check failed:", error);
                setTestResult(`❌ Failed: ${error.message}`);
              }
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Test Health Endpoint
          </button>

          <button
            onClick={async () => {
              try {
                setTestResult("Testing account creation...");

                if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
                  setTestResult("❌ Environment variables not loaded!");
                  return;
                }

                const testEmail = `test-${Date.now()}@example.com`;
                const testPassword = "Test123456!";
                const testName = "Test User";

                console.log("Creating test account:", { testEmail, testName });
                console.log("Using endpoint:", APPWRITE_ENDPOINT);
                console.log("Using project:", APPWRITE_PROJECT_ID);

                const result = await account.create(
                  ID.unique(),
                  testEmail,
                  testPassword,
                  testName
                );

                console.log("Account created:", result);
                setTestResult(
                  `✅ Account created successfully! ID: ${result.$id}`
                );

                // Clean up - delete the session
                try {
                  await account.deleteSession("current");
                } catch (e) {
                  console.log("No session to delete");
                }
              } catch (error: any) {
                console.error("Account creation failed:", error);
                console.error("Error details:", error);
                setTestResult(
                  `❌ Failed: ${error.message || error.toString()}`
                );
              }
            }}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
          >
            Test Account Creation
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="font-mono text-sm">{testResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}
