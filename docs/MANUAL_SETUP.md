# 🚀 QUICK MANUAL SETUP GUIDE

Since the automated script has region issues, follow these steps in Appwrite Console:

## Step 1: Go to Appwrite Console

Visit your Appwrite Console at: `https://cloud.appwrite.io/console`

Navigate to your project.

## Step 2: Create Database

1. Click "Databases" in left sidebar
2. Click "Create database"
3. Database ID: `eventmesh-db`
4. Name: `EventMesh Database`
5. Click "Create"

## Step 3: Create Collections

### Collection 1: workspaces

- Collection ID: `workspaces`
- Name: `Workspaces`
- Permissions: Read (Any), Create/Update/Delete (Users)

**Attributes:**

- `name` - String, Size: 255, Required
- `owner_id` - String, Size: 255, Required
- `created_at` - String, Size: 50, Required
- `settings` - String, Size: 10000, Not Required

### Collection 2: flows

- Collection ID: `flows`
- Name: `Flows`

**Attributes:**

- `workspace_id` - String, Size: 255, Required
- `name` - String, Size: 255, Required
- `description` - String, Size: 1000, Not Required
- `status` - String, Size: 50, Required, Default: "draft"
- `nodes` - String, Size: 100000, Not Required
- `edges` - String, Size: 100000, Not Required
- `webhook_url` - String, Size: 500, Not Required
- `created_at` - String, Size: 50, Required
- `updated_at` - String, Size: 50, Required

### Collection 3: events

- Collection ID: `events`
- Name: `Events`
- Permissions: Read/Create (Any), Update/Delete (Users)

**Attributes:**

- `workspace_id` - String, Size: 255, Required
- `flow_id` - String, Size: 255, Required
- `source` - String, Size: 255, Not Required
- `event_type` - String, Size: 255, Not Required
- `payload` - String, Size: 100000, Required
- `headers` - String, Size: 10000, Not Required
- `received_at` - String, Size: 50, Required
- `status` - String, Size: 50, Required
- `execution_id` - String, Size: 255, Not Required

### Collection 4: executions

- Collection ID: `executions`
- Name: `Executions`

**Attributes:**

- `event_id` - String, Size: 255, Required
- `flow_id` - String, Size: 255, Required
- `status` - String, Size: 50, Required
- `started_at` - String, Size: 50, Required
- `completed_at` - String, Size: 50, Not Required
- `duration_ms` - Integer, Not Required
- `node_executions` - String, Size: 100000, Not Required
- `metrics` - String, Size: 10000, Not Required
- `error` - String, Size: 5000, Not Required

### Collection 5: destinations

- Collection ID: `destinations`
- Name: `Destinations`

**Attributes:**

- `workspace_id` - String, Size: 255, Required
- `type` - String, Size: 50, Required
- `name` - String, Size: 255, Required
- `config` - String, Size: 10000, Required
- `auth` - String, Size: 10000, Not Required
- `created_at` - String, Size: 50, Required

### Collection 6: api_keys

- Collection ID: `api_keys`
- Name: `API Keys`

**Attributes:**

- `workspace_id` - String, Size: 255, Required
- `key_hash` - String, Size: 255, Required
- `name` - String, Size: 255, Required
- `permissions` - String, Size: 10000, Not Required
- `last_used_at` - String, Size: 50, Not Required
- `created_at` - String, Size: 50, Required
- `expires_at` - String, Size: 50, Not Required

### Collection 7: analytics

- Collection ID: `analytics`
- Name: `Analytics`

**Attributes:**

- `workspace_id` - String, Size: 255, Required
- `flow_id` - String, Size: 255, Required
- `date` - String, Size: 50, Required
- `hour` - Integer, Required
- `metrics` - String, Size: 10000, Required

## Step 4: Enable Auth

1. Go to "Auth" section
2. Enable "Email/Password" authentication

## Done! ✅

Once collections are created, come back and we'll continue building!

**IMPORTANT:** Please do this step now (takes ~10 minutes) while I prepare the authentication code.
