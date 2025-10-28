# 🚀 Quick Start Guide

Get EventMesh running in 15 minutes!

---

## Prerequisites

- Node.js 20+ installed
- [Appwrite account](https://cloud.appwrite.io) (free tier works!)
- [OpenAI API key](https://platform.openai.com/api-keys) (optional for AI features)

---

## Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
cd /Users/saikiranbls/Desktop/eventmesh

# Install frontend dependencies
cd app
npm install

# Install function dependencies
cd ../functions/webhook-receiver
npm install

cd ../event-processor
npm install
```

---

## Step 2: Appwrite Setup (10 minutes)

### Create Project

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Click "Create Project"
3. Name it "EventMesh"
4. Copy your **Project ID**

### Create API Key

1. Go to Project Settings → API Keys
2. Click "Create API Key"
3. Name: "EventMesh Server"
4. Scopes: Select all `databases.*` and `functions.*`
5. Copy the API key

### Create Database

1. Go to Databases → Create Database
2. Database ID: `eventmesh-db`
3. Name: "EventMesh Database"

### Create Collections

Run these in order (in Appwrite Console or CLI):

**Collection 1: workspaces**

- Collection ID: `workspaces`
- Permissions: `read("any")` `create("users")` `update("users")` `delete("users")`
- Attributes:
  - `name` (String, 255, required)
  - `slug` (String, 255, required)
  - `ownerId` (String, 255, required)

**Collection 2: flows**

- Collection ID: `flows`
- Attributes:
  - `name` (String, 255, required)
  - `description` (String, 1000)
  - `workspaceId` (String, 255, required)
  - `webhookId` (String, 255, required)
  - `status` (String, 50, required, default: "active")
  - `nodes` (String, 100000)
  - `edges` (String, 100000)

**Collection 3: events**

- Collection ID: `events`
- Attributes:
  - `webhookId` (String, 255, required)
  - `name` (String, 255, required)
  - `payload` (String, 100000, required)
  - `headers` (String, 10000)
  - `status` (String, 50, required)
  - `method` (String, 10, required)
  - `sourceIp` (String, 50)
  - `receivedAt` (DateTime, required)

**Collection 4: executions**

- Collection ID: `executions`
- Attributes:
  - `eventId` (String, 255, required)
  - `flowId` (String, 255, required)
  - `status` (String, 50, required)
  - `steps` (String, 100000)
  - `output` (String, 100000)
  - `error` (String, 5000)
  - `startedAt` (DateTime, required)
  - `completedAt` (DateTime)
  - `duration` (Integer)

**Collection 5: destinations**

- Collection ID: `destinations`
- Attributes:
  - `name` (String, 255, required)
  - `type` (String, 50, required)
  - `workspaceId` (String, 255, required)
  - `config` (String, 10000, required)
  - `status` (String, 50, required, default: "active")

**Collection 6: api_keys**

- Collection ID: `api_keys`
- Attributes:
  - `name` (String, 255, required)
  - `key` (String, 255, required)
  - `workspaceId` (String, 255, required)
  - `status` (String, 50, required, default: "active")
  - `lastUsedAt` (DateTime)

---

## Step 3: Configure Environment (2 minutes)

Create `app/.env.local`:

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id-here

# Database
NEXT_PUBLIC_APPWRITE_DATABASE_ID=eventmesh-db
NEXT_PUBLIC_APPWRITE_COLLECTION_WORKSPACES=workspaces
NEXT_PUBLIC_APPWRITE_COLLECTION_FLOWS=flows
NEXT_PUBLIC_APPWRITE_COLLECTION_EVENTS=events
NEXT_PUBLIC_APPWRITE_COLLECTION_EXECUTIONS=executions
NEXT_PUBLIC_APPWRITE_COLLECTION_DESTINATIONS=destinations
NEXT_PUBLIC_APPWRITE_COLLECTION_API_KEYS=api_keys

# Server (your API key from Step 2)
APPWRITE_API_KEY=your-api-key-here

# OpenAI (optional - for AI transformations)
OPENAI_API_KEY=your-openai-key-here
```

---

## Step 4: Run Locally (1 minute)

```bash
cd app
npm run dev
```

Visit **http://localhost:3000** 🎉

You should see the EventMesh landing page!

---

## Step 5: Deploy Appwrite Functions (Optional)

For full functionality, deploy the Appwrite Functions:

### Deploy webhook-receiver

```bash
cd functions/webhook-receiver

# Create function in Appwrite Console:
# - Runtime: Node.js 20.0
# - Entrypoint: src/main.js
# - Execute access: Any

# Or use CLI:
appwrite functions create \
  --functionId webhook-receiver \
  --name "Webhook Receiver" \
  --runtime node-20.0 \
  --execute any

# Deploy code
appwrite functions createDeployment \
  --functionId webhook-receiver \
  --entrypoint src/main.js \
  --code .
```

### Deploy event-processor

```bash
cd ../event-processor

appwrite functions create \
  --functionId event-processor \
  --name "Event Processor" \
  --runtime node-20.0

appwrite functions createDeployment \
  --functionId event-processor \
  --entrypoint src/main.js \
  --code .
```

Set environment variables for both functions in Appwrite Console:

- `APPWRITE_DATABASE_ID=eventmesh-db`
- `APPWRITE_COLLECTION_*` (all collection IDs)
- `OPENAI_API_KEY` (for event-processor only)

---

## Step 6: Test It Out!

1. **Sign Up**: Go to http://localhost:3000/signup
2. **Create Workspace**: After signup, create a workspace
3. **Create Flow**: Dashboard → Flows → Create Flow
4. **Add Nodes**: Drag Source → Transform → Destination
5. **Test Webhook**: Copy webhook URL and send a test request

```bash
curl -X POST https://cloud.appwrite.io/v1/functions/webhook-receiver/executions \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test.event",
    "data": {
      "message": "Hello EventMesh!"
    }
  }'
```

---

## Deploy to Production (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd app
vercel

# Follow prompts:
# - Setup project
# - Add environment variables (same as .env.local)
# - Deploy!
```

Your app will be live at `https://your-app.vercel.app` 🚀

---

## Troubleshooting

### "Failed to connect to Appwrite"

- Check your Project ID in `.env.local`
- Verify the endpoint is correct
- Make sure collections are created

### "API Key invalid"

- Regenerate API key in Appwrite Console
- Ensure it has correct permissions
- Update `.env.local`

### Functions not executing

- Check function logs in Appwrite Console
- Verify environment variables are set
- Ensure runtime is Node.js 20.0

---

## Next Steps

✅ **You're running!** Now:

- Create your first flow
- Connect real webhooks (GitHub, Stripe)
- Set up Slack/Discord destinations
- Explore the analytics dashboard
- Invite team members

---

## Need Help?

- 📚 [Full Documentation](./DEPLOYMENT.md)
- 🏗️ [Architecture Guide](./ARCHITECTURE.md)
- 🗺️ [Project Roadmap](./PROJECT_ROADMAP.md)
- 📊 [Build Summary](./BUILD_SUMMARY.md)

---

**That's it! You're ready to route events like a pro! 🎉**
