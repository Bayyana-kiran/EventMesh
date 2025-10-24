# Getting Started with EventMesh

Welcome! This guide will help you set up EventMesh and create your first event flow.

## Prerequisites

- Node.js 18+ and npm
- An Appwrite account (free tier works)
- 15 minutes of your time

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/eventmesh.git
cd eventmesh
```

### 2. Install Dependencies

```bash
cd app
npm install
```

### 3. Environment Setup

Create `.env.local`:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=eventmesh-db
APPWRITE_API_KEY=your_api_key
OPENAI_API_KEY=your_openai_key
```

### 4. Set Up Appwrite

```bash
node scripts/setup-appwrite.js
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Create Your First Flow

### Step 1: Sign Up

1. Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Create your account
3. Login

### Step 2: Create a Flow

1. Go to Dashboard → Flows
2. Click "Create New Flow"
3. Name it "GitHub to Slack"
4. Click Create

### Step 3: Add Nodes

**Add Source Node:**

1. Click "Add Source Node"
2. Label: "GitHub Webhook"
3. Copy the webhook URL

**Add Transform Node:**

1. Click "Add Transform Node"
2. Type: JavaScript
3. Code:

```javascript
return {
  message: `New push to ${payload.repository.name}`,
  author: payload.pusher.name,
  commits: payload.commits.length,
};
```

**Add Destination Node:**

1. Click "Add Destination Node"
2. Type: Slack
3. Webhook URL: Your Slack webhook
4. Channel: #engineering

### Step 4: Connect & Save

1. Drag connections between nodes
2. Click "Save Flow"
3. Set status to "Active"

### Step 5: Test It!

```bash
curl -X POST http://localhost:3000/webhooks/{your_webhook_id} \
  -H "Content-Type: application/json" \
  -H "X-API-Key: {your_api_key}" \
  -d '{
    "repository": { "name": "eventmesh" },
    "pusher": { "name": "John" },
    "commits": [{"message": "Initial commit"}]
  }'
```

Check Slack for your message!

## Next Steps

- [Read the Flow Builder Guide](./flow-builder.md)
- [Explore Transformations](./transformations.md)
- [Set Up More Destinations](./destinations.md)
- [View Analytics](./analytics.md)

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Appwrite Connection Failed

- Verify your API key
- Check project ID
- Ensure network access

### Events Not Flowing

- Verify flow is active
- Check API key in webhook headers
- Review logs in Events page

## Getting Help

- [Full Documentation](./README.md)
- [Discord Community](https://discord.gg/eventmesh)
- [GitHub Issues](https://github.com/yourusername/eventmesh/issues)

Happy routing! 🚀
