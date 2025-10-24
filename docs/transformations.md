# Transformations Guide

## Overview

Transformations allow you to modify, filter, and enrich event payloads as they flow through your workflows.

## Types of Transformations

### 1. JavaScript Transformations

Write custom JavaScript to transform your data.

**Example: Extract Fields**

```javascript
// Input: GitHub push event
// Output: Simplified message

return {
  message: `New push to ${payload.repository.name}`,
  author: payload.pusher.name,
  branch: payload.ref.split("/").pop(),
  commits: payload.commits.map((c) => ({
    message: c.message,
    author: c.author.name,
  })),
};
```

**Example: Filter Events**

```javascript
// Only process main branch pushes
if (payload.ref !== "refs/heads/main") {
  return null; // Null stops the flow
}

return payload;
```

**Example: Conditional Routing**

```javascript
// Route based on severity
const severity = payload.level;

if (severity === "critical") {
  return {
    ...payload,
    destination: "pagerduty",
  };
} else {
  return {
    ...payload,
    destination: "slack",
  };
}
```

### 2. AI Transformations

Use natural language to transform data with GPT-4.

**Example: Extract Information**

```
Prompt: "Extract the user's email address and purchase amount from this Stripe payment event"

Input: Stripe webhook payload
Output: { email: "user@example.com", amount: 99.99 }
```

**Example: Generate Summary**

```
Prompt: "Create a one-sentence summary of this GitHub issue"

Input: GitHub issue webhook
Output: "Bug report: Login button not working on mobile Safari"
```

**Example: Sentiment Analysis**

```
Prompt: "Analyze the sentiment of this customer feedback and categorize as positive, neutral, or negative"

Input: Customer feedback text
Output: { sentiment: "positive", confidence: 0.92 }
```

## Available Variables

In your transformations, you have access to:

- `payload` - The incoming event data
- `headers` - Request headers
- `meta` - Event metadata (timestamp, id, etc.)

```javascript
return {
  eventId: meta.id,
  receivedAt: meta.timestamp,
  contentType: headers["content-type"],
  data: payload,
};
```

## Data Enrichment

### Fetch External Data

```javascript
// Fetch user details from your API
const userId = payload.userId;
const userResponse = await fetch(`https://api.example.com/users/${userId}`);
const user = await userResponse.json();

return {
  ...payload,
  userDetails: {
    name: user.name,
    email: user.email,
    tier: user.subscription.tier,
  },
};
```

### Database Lookup

```javascript
// Look up customer in your database
const customerId = payload.customer_id;
const customer = await db.customers.findOne({ id: customerId });

return {
  ...payload,
  customer: {
    name: customer.name,
    lifetime_value: customer.totalSpent,
  },
};
```

## Best Practices

### Performance

✅ Keep transformations fast (< 100ms)
✅ Avoid heavy computation
✅ Cache frequently accessed data
✅ Use AI sparingly (slower than JS)

### Error Handling

```javascript
try {
  const result = dangerousOperation(payload);
  return result;
} catch (error) {
  console.error("Transform error:", error);
  return {
    error: true,
    message: error.message,
    original: payload,
  };
}
```

### Testing

```javascript
// Add validation
if (!payload.userId) {
  throw new Error("userId is required");
}

// Test with sample data
const samplePayload = {
  userId: "123",
  action: "purchase",
};

// Verify output structure
const output = transform(samplePayload);
assert(output.message, "message is required");
```

## Common Patterns

### Format for Slack

```javascript
return {
  text: `New deployment to ${payload.environment}`,
  attachments: [
    {
      color: payload.status === "success" ? "good" : "danger",
      fields: [
        { title: "Version", value: payload.version, short: true },
        { title: "Author", value: payload.author, short: true },
      ],
    },
  ],
};
```

### Aggregate Data

```javascript
// Collect multiple events
const events = payload.events || [];
return {
  totalEvents: events.length,
  summary: events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {}),
};
```

### Rate Limiting

```javascript
// Only send at most 1 per minute
const lastSent = await cache.get("last_sent_time");
const now = Date.now();

if (lastSent && now - lastSent < 60000) {
  return null; // Skip this event
}

await cache.set("last_sent_time", now);
return payload;
```

## AI Prompt Tips

### Be Specific

❌ "Transform this data"
✅ "Extract the email, name, and purchase amount from this Stripe event"

### Provide Examples

```
Extract user information in this format:
{
  "email": "user@example.com",
  "name": "John Doe",
  "plan": "pro"
}
```

### Handle Edge Cases

```
If the event doesn't contain a user email, use "unknown@eventmesh.dev"
```

## Testing Transformations

Use the Playground:

1. Go to Dashboard → Playground
2. Paste sample payload
3. Add transformation code
4. Click "Test Transform"
5. View output

## Debugging

### Log Values

```javascript
console.log("Input payload:", payload);
const result = transform(payload);
console.log("Output:", result);
return result;
```

### Use Try/Catch

```javascript
try {
  return complexTransform(payload);
} catch (error) {
  console.error("Error:", error);
  return { error: error.message, payload };
}
```

### Check Types

```javascript
if (typeof payload.amount !== "number") {
  throw new Error("Amount must be a number");
}
```

## Limits

- Max execution time: 5 seconds
- Max response size: 1MB
- AI prompts: 500 tokens max
- External API calls: 3 per transform

## Next Steps

- [Flow Builder Guide](./flow-builder.md)
- [Destinations Guide](./destinations.md)
- [API Reference](./api-reference.md)
