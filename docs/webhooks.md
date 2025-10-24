# Webhooks Guide

## Overview

Webhooks are HTTP callbacks that allow external services to send real-time events to EventMesh. Each flow in EventMesh has a unique webhook URL.

## Getting Started

### 1. Create a Flow

1. Navigate to Dashboard → Flows
2. Click "Create New Flow"
3. Name your flow and save

### 2. Get Webhook URL

Your webhook URL is automatically generated:

```
https://api.eventmesh.dev/webhooks/{webhookId}
```

### 3. Configure Source

In your external service (GitHub, Stripe, etc.), add the webhook URL and include your API key in the headers.

## Authentication

All webhook requests must include an API key:

```bash
curl -X POST https://api.eventmesh.dev/webhooks/abc123 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_live_your_api_key" \
  -d '{
    "event": "user.created",
    "data": {
      "userId": "123",
      "email": "user@example.com"
    }
  }'
```

## Request Format

### Headers

```
Content-Type: application/json
X-API-Key: your_api_key
X-Event-Signature: sha256_signature (optional)
```

### Body

```json
{
  "event": "event.name",
  "data": {
    // Your event data
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Response Codes

| Code | Description               |
| ---- | ------------------------- |
| 200  | Event received and queued |
| 400  | Invalid payload           |
| 401  | Invalid API key           |
| 404  | Webhook not found         |
| 429  | Rate limit exceeded       |
| 500  | Server error              |

## Signature Verification

For enhanced security, verify webhook signatures:

```javascript
const crypto = require("crypto");

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(JSON.stringify(payload));
  const computed = hmac.digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
}
```

## Common Integrations

### GitHub

```json
{
  "event": "push",
  "repository": "owner/repo",
  "ref": "refs/heads/main",
  "commits": [...]
}
```

**Setup:**

1. Go to Settings → Webhooks
2. Add webhook URL
3. Select events: Push, Pull Request
4. Add secret (optional)

### Stripe

```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 1000,
      "currency": "usd"
    }
  }
}
```

**Setup:**

1. Dashboard → Developers → Webhooks
2. Add endpoint
3. Select events
4. Copy signing secret

### Custom API

```bash
curl -X POST {webhook_url} \
  -H "Content-Type: application/json" \
  -H "X-API-Key: {api_key}" \
  -d '{
    "event": "custom.event",
    "userId": "123",
    "action": "purchase",
    "amount": 99.99
  }'
```

## Best Practices

### Security

✅ Always use HTTPS
✅ Validate signatures
✅ Rotate API keys regularly
✅ Use different keys for dev/prod

### Reliability

✅ Implement retry logic
✅ Handle idempotency
✅ Log all requests
✅ Monitor webhook health

### Performance

✅ Keep payloads small
✅ Process asynchronously
✅ Use batch processing when possible
✅ Set appropriate timeouts

## Troubleshooting

### Events not received

1. Check webhook URL is correct
2. Verify API key is valid
3. Check service is sending events
4. Review logs in Events page

### Authentication errors

- Ensure API key is in headers
- Check key hasn't expired
- Verify workspace access

### Rate limiting

- Default: 100 events/second
- Upgrade for higher limits
- Implement exponential backoff

## Testing

Use the Playground to test webhooks:

```bash
# Test event
curl -X POST http://localhost:3000/api/playground/test \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://api.eventmesh.dev/webhooks/abc123",
    "payload": {
      "event": "test",
      "data": { "test": true }
    }
  }'
```

## Monitoring

Track webhook health:

- Success rate
- Latency
- Error rate
- Event volume

Navigate to Dashboard → Analytics for detailed metrics.

## Support

Need help?

- [API Reference](./api-reference.md)
- [Discord Community](https://discord.gg/eventmesh)
- Email: webhooks@eventmesh.dev
