# Flow Builder Guide

## Overview

The Flow Builder is the visual interface for creating event routing workflows. It uses a drag-and-drop canvas where you can add nodes and connect them.

## Node Types

### Source Nodes

Source nodes receive webhook events.

**Features:**

- Auto-generated webhook URL
- API key authentication
- Payload validation
- Event logging

**Configuration:**

```javascript
{
  label: "GitHub Webhook",
  webhookUrl: "https://api.eventmesh.dev/webhooks/abc123"
}
```

### Transform Nodes

Transform nodes modify event payloads.

**Types:**

1. **JavaScript Transform**

```javascript
// Example: Extract specific fields
return {
  user: payload.user.login,
  repo: payload.repository.name,
  branch: payload.ref.split("/").pop(),
};
```

2. **AI Transform**

```
Prompt: "Extract the user email and purchase amount from this Stripe event"
```

### Destination Nodes

Destination nodes send events to external services.

**Supported Destinations:**

- Slack
- Discord
- Webhook (Custom API)
- Email

**Example Slack Configuration:**

```json
{
  "type": "slack",
  "webhookUrl": "https://hooks.slack.com/services/...",
  "channel": "#engineering"
}
```

## Creating a Flow

### Step 1: Add Source Node

1. Click "Add Source Node"
2. Name your webhook
3. Copy the generated webhook URL

### Step 2: Add Transform Nodes (Optional)

1. Click "Add Transform Node"
2. Choose JavaScript or AI
3. Write transformation code or prompt

### Step 3: Add Destination Nodes

1. Click "Add Destination Node"
2. Select destination type
3. Configure destination settings

### Step 4: Connect Nodes

1. Drag from output handle of source
2. Drop on input handle of next node
3. Edges auto-connect

### Step 5: Save & Activate

1. Click "Save Flow"
2. Toggle status to "Active"
3. Test with a webhook event

## Best Practices

### Performance

- Keep transformations simple
- Avoid heavy computation
- Use AI transforms sparingly

### Error Handling

- Always validate payloads
- Add error logging
- Set up failure notifications

### Security

- Rotate API keys regularly
- Use webhook signature verification
- Validate all inputs

## Advanced Features

### Conditional Routing

```javascript
// Route based on event type
if (payload.type === "urgent") {
  return { destination: "pagerduty" };
} else {
  return { destination: "slack" };
}
```

### Batch Processing

```javascript
// Collect events and send in batches
const batch = events.map((e) => ({
  id: e.id,
  timestamp: e.timestamp,
}));
return batch;
```

### Data Enrichment

```javascript
// Fetch additional data
const user = await fetch(`/api/users/${payload.userId}`);
return {
  ...payload,
  userDetails: user,
};
```

## Keyboard Shortcuts

| Shortcut               | Action               |
| ---------------------- | -------------------- |
| `Cmd/Ctrl + S`         | Save flow            |
| `Cmd/Ctrl + D`         | Duplicate node       |
| `Delete`               | Delete selected node |
| `Cmd/Ctrl + Z`         | Undo                 |
| `Cmd/Ctrl + Shift + Z` | Redo                 |

## Troubleshooting

### Nodes won't connect

- Ensure nodes are compatible
- Check for circular dependencies
- Verify edge direction

### Transformations failing

- Check JavaScript syntax
- Verify payload structure
- Test with sample data

### Events not flowing

- Verify flow is active
- Check webhook URL
- Validate API key
