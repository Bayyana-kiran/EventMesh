# EventMesh Deployment Guide

## 🚀 Complete Setup Instructions

This guide will walk you through deploying EventMesh from scratch.

---

## Prerequisites

- Node.js 20+ installed
- Appwrite Cloud account or self-hosted Appwrite instance
- OpenAI API key (for AI transformations)
- Git installed

---

## Part 1: Appwrite Backend Setup

### Step 1: Create Appwrite Project

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io) and create a new project
2. Note your **Project ID** and **API Endpoint**
3. Create a new API Key with the following scopes:
   - `databases.read`
   - `databases.write`
   - `functions.read`
   - `functions.write`

### Step 2: Create Database and Collections

Run these commands in the Appwrite Console or use the Appwrite CLI:

```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login to Appwrite
appwrite login

# Initialize project
appwrite init project
```

#### Create Database

```bash
appwrite databases create \
  --databaseId eventmesh-db \
  --name "EventMesh Database"
```

#### Create Collections

**1. Workspaces Collection**

```bash
appwrite databases createCollection \
  --databaseId eventmesh-db \
  --collectionId workspaces \
  --name "Workspaces" \
  --permissions 'read("any")' 'create("users")' 'update("users")' 'delete("users")'

# Add attributes
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId workspaces --key name --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId workspaces --key slug --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId workspaces --key ownerId --size 255 --required true
```

**2. Flows Collection**

```bash
appwrite databases createCollection \
  --databaseId eventmesh-db \
  --collectionId flows \
  --name "Flows"

# Add attributes
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId flows --key name --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId flows --key description --size 1000 --required false
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId flows --key workspaceId --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId flows --key webhookId --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId flows --key status --size 50 --required true --default 'active'
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId flows --key nodes --size 100000 --required false
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId flows --key edges --size 100000 --required false
```

**3. Events Collection**

```bash
appwrite databases createCollection \
  --databaseId eventmesh-db \
  --collectionId events \
  --name "Events"

# Add attributes
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId events --key webhookId --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId events --key name --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId events --key payload --size 100000 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId events --key headers --size 10000 --required false
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId events --key status --size 50 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId events --key method --size 10 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId events --key sourceIp --size 50 --required false
appwrite databases createDatetimeAttribute --databaseId eventmesh-db --collectionId events --key receivedAt --required true
```

**4. Executions Collection**

```bash
appwrite databases createCollection \
  --databaseId eventmesh-db \
  --collectionId executions \
  --name "Executions"

# Add attributes
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId executions --key eventId --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId executions --key flowId --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId executions --key status --size 50 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId executions --key steps --size 100000 --required false
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId executions --key output --size 100000 --required false
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId executions --key error --size 5000 --required false
appwrite databases createDatetimeAttribute --databaseId eventmesh-db --collectionId executions --key startedAt --required true
appwrite databases createDatetimeAttribute --databaseId eventmesh-db --collectionId executions --key completedAt --required false
appwrite databases createIntegerAttribute --databaseId eventmesh-db --collectionId executions --key duration --required false
```

**5. Destinations Collection**

```bash
appwrite databases createCollection \
  --databaseId eventmesh-db \
  --collectionId destinations \
  --name "Destinations"

# Add attributes
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId destinations --key name --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId destinations --key type --size 50 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId destinations --key workspaceId --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId destinations --key config --size 10000 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId destinations --key status --size 50 --required true --default 'active'
```

**6. API Keys Collection**

```bash
appwrite databases createCollection \
  --databaseId eventmesh-db \
  --collectionId api_keys \
  --name "API Keys"

# Add attributes
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId api_keys --key name --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId api_keys --key key --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId api_keys --key workspaceId --size 255 --required true
appwrite databases createStringAttribute --databaseId eventmesh-db --collectionId api_keys --key status --size 50 --required true --default 'active'
appwrite databases createDatetimeAttribute --databaseId eventmesh-db --collectionId api_keys --key lastUsedAt --required false
```

### Step 3: Deploy Appwrite Functions

**Deploy Webhook Receiver**

```bash
cd functions/webhook-receiver
npm install

appwrite functions create \
  --functionId webhook-receiver \
  --name "Webhook Receiver" \
  --runtime node-20.0 \
  --execute any

appwrite functions createDeployment \
  --functionId webhook-receiver \
  --entrypoint src/main.js \
  --code .

# Set environment variables
appwrite functions updateVariables \
  --functionId webhook-receiver \
  --variables APPWRITE_DATABASE_ID=eventmesh-db APPWRITE_COLLECTION_EVENTS=events APPWRITE_COLLECTION_API_KEYS=api_keys
```

**Deploy Event Processor**

```bash
cd ../event-processor
npm install

appwrite functions create \
  --functionId event-processor \
  --name "Event Processor" \
  --runtime node-20.0

appwrite functions createDeployment \
  --functionId event-processor \
  --entrypoint src/main.js \
  --code .

# Set environment variables
appwrite functions updateVariables \
  --functionId event-processor \
  --variables APPWRITE_DATABASE_ID=eventmesh-db APPWRITE_COLLECTION_EVENTS=events APPWRITE_COLLECTION_FLOWS=flows APPWRITE_COLLECTION_EXECUTIONS=executions OPENAI_API_KEY=your-openai-key
```

---

## Part 2: Frontend Deployment

### Step 1: Configure Environment Variables

Create `.env.local` in the `app` directory:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id

# Database Configuration
NEXT_PUBLIC_APPWRITE_DATABASE_ID=eventmesh-db
NEXT_PUBLIC_APPWRITE_COLLECTION_WORKSPACES=workspaces
NEXT_PUBLIC_APPWRITE_COLLECTION_FLOWS=flows
NEXT_PUBLIC_APPWRITE_COLLECTION_EVENTS=events
NEXT_PUBLIC_APPWRITE_COLLECTION_EXECUTIONS=executions
NEXT_PUBLIC_APPWRITE_COLLECTION_DESTINATIONS=destinations
NEXT_PUBLIC_APPWRITE_COLLECTION_API_KEYS=api_keys

# Server-side Appwrite (for API routes)
APPWRITE_API_KEY=your-api-key

# OpenAI (for AI transformations)
OPENAI_API_KEY=your-openai-key
```

### Step 2: Install Dependencies and Run

```bash
cd app
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

### Step 3: Deploy to Vercel (Production)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Or use CLI:
vercel env add NEXT_PUBLIC_APPWRITE_ENDPOINT
vercel env add NEXT_PUBLIC_APPWRITE_PROJECT_ID
# ... add all other env vars
```

---

## Part 3: Initial Configuration

### Step 1: Create Your First Workspace

1. Visit your deployed app
2. Sign up for an account
3. Create a workspace

### Step 2: Generate API Keys

1. Go to Settings → API Keys
2. Generate a new API key
3. Save it securely (you'll need it for webhooks)

### Step 3: Create Your First Flow

1. Go to Flows → Create Flow
2. Add a Source node (this generates a webhook URL)
3. Add Transform nodes (JavaScript or AI)
4. Add Destination nodes (Slack, Discord, etc.)
5. Connect the nodes
6. Save and activate the flow

### Step 4: Test Your Webhook

```bash
curl -X POST https://your-appwrite-endpoint/functions/webhook-receiver/execution \
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

## Part 4: Monitoring and Maintenance

### Real-time Event Monitoring

EventMesh uses Appwrite Realtime to stream events. To enable:

1. Go to your Appwrite Console
2. Navigate to your project settings
3. Enable Realtime for your database collections

### Setting Up Alerts

Configure notification preferences in Settings → Notifications:

- Flow failure alerts
- High volume alerts
- Weekly performance reports

---

## Troubleshooting

### Common Issues

**1. Webhooks not being received**

- Check your API key is valid and active
- Verify the webhook receiver function is deployed
- Check Appwrite function logs

**2. Events not processing**

- Verify event processor function is deployed
- Check OpenAI API key if using AI transformations
- Review execution logs in the Events page

**3. Database connection errors**

- Verify all collection IDs match your environment variables
- Check Appwrite API key has correct permissions

---

## Next Steps

- [Read the Architecture Documentation](./ARCHITECTURE.md)
- [Check the Project Roadmap](./PROJECT_ROADMAP.md)
- [Join our Discord Community](#)
- [Read API Documentation](#)

---

## Support

For issues and questions:

- GitHub Issues: [github.com/eventmesh/eventmesh/issues](#)
- Discord: [discord.gg/eventmesh](#)
- Email: support@eventmesh.dev
