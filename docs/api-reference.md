# API Reference

## Authentication

All API requests require authentication using an API key. Include your API key in the request headers:

```bash
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Flows

#### List Flows

```http
GET /api/flows?workspaceId={workspaceId}
```

**Response:**

```json
{
  "documents": [
    {
      "$id": "flow_123",
      "name": "GitHub to Slack",
      "description": "Forward GitHub events",
      "status": "active",
      "webhookId": "wh_abc123",
      "nodes": "[...]",
      "edges": "[...]"
    }
  ]
}
```

#### Create Flow

```http
POST /api/flows
Content-Type: application/json

{
  "name": "My Flow",
  "description": "Description here",
  "workspaceId": "workspace_123",
  "nodes": [],
  "edges": []
}
```

#### Get Flow

```http
GET /api/flows/{flowId}
```

#### Update Flow

```http
PATCH /api/flows/{flowId}
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "paused"
}
```

#### Delete Flow

```http
DELETE /api/flows/{flowId}
```

### Events

#### List Events

```http
GET /api/events?flowId={flowId}&limit=50
```

**Response:**

```json
{
  "documents": [
    {
      "$id": "event_123",
      "name": "github.push",
      "payload": "{...}",
      "status": "processed",
      "receivedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

#### Get Event

```http
GET /api/events/{eventId}
```

### Executions

#### List Executions

```http
GET /api/executions?flowId={flowId}&eventId={eventId}
```

**Response:**

```json
{
  "documents": [
    {
      "$id": "exec_123",
      "eventId": "event_123",
      "flowId": "flow_123",
      "status": "success",
      "steps": "[...]",
      "duration": 234
    }
  ]
}
```

## Webhooks

Send events to your webhook URL:

```bash
curl -X POST https://your-webhook-url \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "event": "user.created",
    "data": {
      "userId": "123",
      "email": "user@example.com"
    }
  }'
```

## Rate Limits

- 1000 requests per minute per API key
- 100 webhook events per second per flow

## Error Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 404  | Not Found             |
| 429  | Rate Limit Exceeded   |
| 500  | Internal Server Error |

## SDKs

Coming soon:

- JavaScript/TypeScript
- Python
- Go
- Ruby
