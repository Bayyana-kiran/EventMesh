export const APP_NAME = "EventMesh";
export const APP_DESCRIPTION = "The developer's global event routing network";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
export const APPWRITE_DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "eventmesh-db";

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Collection IDs
export const COLLECTION_IDS = {
  WORKSPACES: "workspaces",
  FLOWS: "flows",
  EVENTS: "events",
  EXECUTIONS: "executions",
  DESTINATIONS: "destinations",
  API_KEYS: "api_keys",
  ANALYTICS: "analytics",
  NOTIFICATIONS: "notifications",
} as const;

// Bucket IDs
export const BUCKET_IDS = {
  EVENT_PAYLOADS: "event-payloads",
  EXECUTION_LOGS: "execution-logs",
  FLOW_SNAPSHOTS: "flow-snapshots",
} as const;

// Function IDs
export const FUNCTION_IDS = {
  WEBHOOK_RECEIVER: "webhook-receiver",
  EVENT_PROCESSOR: "event-processor",
  AI_TRANSFORMER: "ai-transformer",
  ROUTER_EXECUTOR: "router-executor",
  ANALYTICS_AGGREGATOR: "analytics-aggregator",
} as const;

// Node type colors
export const NODE_COLORS = {
  source: "#10b981", // green
  transform: "#f59e0b", // amber
  destination: "#3b82f6", // blue
} as const;

// Event status colors
export const STATUS_COLORS = {
  pending: "#94a3b8", // gray
  processing: "#f59e0b", // amber
  completed: "#10b981", // green
  failed: "#ef4444", // red
  running: "#3b82f6", // blue
  success: "#10b981", // green
  active: "#10b981", // green
  paused: "#94a3b8", // gray
  draft: "#64748b", // slate
} as const;

// Destination templates
export const DESTINATION_TEMPLATES = {
  slack: {
    name: "Slack",
    type: "slack" as const,
    icon: "MessageSquare",
    fields: [
      {
        name: "webhook_url",
        label: "Webhook URL",
        type: "url",
        required: true,
      },
      {
        name: "channel",
        label: "Channel (optional)",
        type: "text",
        required: false,
      },
    ],
  },
  discord: {
    name: "Discord",
    type: "discord" as const,
    icon: "MessageCircle",
    fields: [
      {
        name: "webhook_url",
        label: "Webhook URL",
        type: "url",
        required: true,
      },
    ],
  },
  webhook: {
    name: "Custom Webhook",
    type: "webhook" as const,
    icon: "Webhook",
    fields: [
      { name: "url", label: "Webhook URL", type: "url", required: true },
      {
        name: "method",
        label: "HTTP Method",
        type: "select",
        options: ["POST", "PUT", "PATCH"],
        required: true,
      },
      {
        name: "headers",
        label: "Custom Headers (JSON)",
        type: "textarea",
        required: false,
      },
    ],
  },
  email: {
    name: "Email",
    type: "email" as const,
    icon: "Mail",
    fields: [
      { name: "to", label: "To Email", type: "email", required: true },
      {
        name: "subject",
        label: "Subject Template",
        type: "text",
        required: true,
      },
    ],
  },
} as const;

// Flow templates
export const FLOW_TEMPLATES = [
  {
    id: "github-to-slack",
    name: "GitHub to Slack",
    description: "Forward GitHub webhooks to Slack",
    icon: "Github",
    category: "Development",
  },
  {
    id: "stripe-to-crm",
    name: "Stripe to CRM",
    description: "Sync Stripe payments to your CRM",
    icon: "CreditCard",
    category: "Payments",
  },
  {
    id: "form-to-email",
    name: "Form Submission to Email",
    description: "Send form submissions via email",
    icon: "FormInput",
    category: "Forms",
  },
  {
    id: "custom",
    name: "Start from Scratch",
    description: "Build a custom flow",
    icon: "Plus",
    category: "Custom",
  },
] as const;

// Transformation examples
export const TRANSFORM_EXAMPLES = {
  javascript: `// Transform the payload
function transform(input) {
  return {
    message: \`New event from \${input.source}\`,
    timestamp: new Date().toISOString(),
    data: input.payload
  }
}

return transform(payload)`,
  ai: "Extract the user's email and name, then format as a welcome message",
} as const;

// API permissions
export const API_PERMISSIONS = [
  { value: "events:read", label: "Read Events" },
  { value: "events:write", label: "Write Events" },
  { value: "flows:read", label: "Read Flows" },
  { value: "flows:write", label: "Write Flows" },
  { value: "destinations:read", label: "Read Destinations" },
  { value: "destinations:write", label: "Write Destinations" },
] as const;

// Rate limits
export const RATE_LIMITS = {
  free: {
    events_per_hour: 100,
    flows_max: 5,
    destinations_max: 10,
  },
  pro: {
    events_per_hour: 10000,
    flows_max: 50,
    destinations_max: 100,
  },
  enterprise: {
    events_per_hour: -1, // unlimited
    flows_max: -1,
    destinations_max: -1,
  },
} as const;
