# EventMesh Notifier Backend

This folder contains a small TypeScript Node.js function you can deploy as an Appwrite function (or run standalone) to send email notifications using SMTP (nodemailer). It's intentionally self-contained and configurable via environment variables so you can deploy it to Appwrite Functions and customize behavior.

Features

- Send emails via SMTP
- Optionally fetch workspace notification settings from Appwrite (requires Appwrite server API key)

Environment variables

- SMTP_HOST - required for SMTP (e.g. smtp.sendgrid.net or smtp.mailgun.org)
- SMTP_PORT - required (465 for SSL or 587)
- SMTP_USER - optional username for SMTP auth
- SMTP_PASS - optional password for SMTP auth
- NOTIFICATIONS_FROM_EMAIL - optional from address (default: no-reply@eventmesh.local)
- NOTIFICATIONS_FROM_NAME - optional from name (default: EventMesh)
- APPWRITE_ENDPOINT - optional, used to fetch workspace settings
- APPWRITE_PROJECT_ID - optional
- APPWRITE_API_KEY - optional (server key to read workspace settings)
- APPWRITE_DATABASE_ID - optional (defaults to eventmesh-db)
- APPWRITE_WORKSPACES_COLLECTION - optional (defaults to workspaces)

Build & deploy

1. Install dependencies:

   npm install

2. Build:

   npm run build

3. Deploy to Appwrite Functions:

- Zip the `dist/` directory and `node_modules` and upload to Appwrite functions as a Node 16 or 18 runtime (ensure entrypoint is `dist/index.js`).
- Set environment variables in the Appwrite function settings.

Usage

1. Appwrite function: call the function with JSON payload on stdin, for example:

   {
   "workspaceId": "<workspace-id>",
   "subject": "Test",
   "plainText": "This is a test"
   }

   The function will try to read workspace settings for recipients. If not available, provide `to` field:

   {
   "to": ["you@example.com"],
   "subject": "Test",
   "plainText": "This is a test"
   }

2. Local testing (dev): you can run with ts-node (requires dev deps):

   npm run dev

Notes

- For production, use a verified sending domain and proper credentials.
- This file intentionally keeps the Appwrite SDK usage minimal; you can extend it to log notifications to a collection, add retry/backoff logic, or switch to other providers.
