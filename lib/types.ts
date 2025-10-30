import { Models } from "appwrite";

// ============================================================================
// CORE TYPES
// ============================================================================

export type NodeType = "source" | "transform" | "destination";
export type FlowStatus = "active" | "paused" | "draft";
export type EventStatus = "pending" | "processing" | "completed" | "failed";
export type ExecutionStatus = "running" | "success" | "failed";
 export type DestinationType =
  | "slack"
  | "discord"
  | "webhook"
  | "email"
  | "test";
export type TransformType = "javascript" | "ai" | "passthrough";

// ============================================================================
// DATABASE MODELS
// ============================================================================

export interface Workspace extends Models.Document {
  name: string;
  owner_id: string;
  created_at: string;
  settings: string; // JSON string of { timezone: string, retention_days: number }
}

export interface Flow extends Models.Document {
  workspace_id: string;
  name: string;
  description: string;
  status: FlowStatus;
  nodes: FlowNode[];
  edges: FlowEdge[];
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  data: NodeData;
  position: { x: number; y: number };
}

export interface NodeData {
  label: string;
  config: SourceConfig | TransformConfig | DestinationConfig;
}

export interface SourceConfig {
  type: "webhook";
  webhook_path?: string;
  api_key_id?: string;
  schema?: Record<string, unknown>; // JSON Schema for payload validation
}

export interface TransformConfig {
  type: TransformType;
  code?: string;
  ai_prompt?: string;
}

export interface DestinationConfig {
  destination_id: string;
  mapping?: Record<string, string>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface Event extends Models.Document {
  workspace_id: string;
  flow_id: string;
  source: string;
  event_type: string;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
  received_at: string;
  status: EventStatus;
  execution_id?: string;
}

export interface Execution extends Models.Document {
  event_id: string;
  flow_id: string;
  status: ExecutionStatus;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  node_executions: NodeExecution[]; // Stored as JSON string in DB, parsed to array in app
  metrics: {
    total_nodes: number;
    successful_nodes: number;
    failed_nodes: number;
  };
}

export interface NodeExecution {
  node_id: string;
  status: ExecutionStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string;
  duration_ms: number;
}

export interface Destination extends Models.Document {
  workspace_id: string;
  type: DestinationType;
  name: string;
  config: DestinationConfigDetails;
  auth?: {
    type: "bearer" | "oauth" | "apikey";
    credentials: Record<string, unknown>;
  };
  created_at: string;
}

export interface DestinationConfigDetails {
  webhook_url?: string;
  channel?: string;
  email?: string;
  [key: string]: unknown;
}

export interface ApiKey extends Models.Document {
  workspace_id: string;
  key_hash: string;
  name: string;
  permissions: string[];
  last_used_at?: string;
  created_at: string;
  expires_at?: string;
}

export interface Analytics extends Models.Document {
  workspace_id: string;
  flow_id: string;
  date: string;
  hour: number;
  metrics: {
    total_events: number;
    successful_executions: number;
    failed_executions: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
    p99_latency_ms: number;
  };
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface FlowBuilderState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNode: FlowNode | null;
  isAIAssistantOpen: boolean;
  setNodes: (nodes: FlowNode[]) => void;
  setEdges: (edges: FlowEdge[]) => void;
  selectNode: (node: FlowNode | null) => void;
  toggleAIAssistant: () => void;
}

export interface EventStreamState {
  events: Event[];
  filter: EventFilter;
  setEvents: (events: Event[]) => void;
  setFilter: (filter: EventFilter) => void;
}

export interface EventFilter {
  status?: EventStatus;
  flow_id?: string;
  source?: string;
  search?: string;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface WebhookPayload {
  flow_id: string;
  source: string;
  event_type: string;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
}

export interface AITransformRequest {
  payload: Record<string, unknown>;
  source?: string;
  instructions?: string;
}

export interface AITransformResponse {
  schema: Record<string, unknown>;
  suggestions: TransformationSuggestion[];
  transformed_payload?: Record<string, unknown>;
  code?: string;
}

export interface TransformationSuggestion {
  field: string;
  suggestion: string;
  confidence: number;
}

export interface AIFlowGenerationRequest {
  intent: string;
  context?: string;
}

export interface AIFlowGenerationResponse {
  nodes: FlowNode[];
  edges: FlowEdge[];
  confidence: number;
  explanation: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const COLLECTION_IDS = {
  WORKSPACES: "workspaces",
  FLOWS: "flows",
  EVENTS: "events",
  EXECUTIONS: "executions",
  DESTINATIONS: "destinations",
  API_KEYS: "api_keys",
  ANALYTICS: "analytics",
} as const;

export const BUCKET_IDS = {
  EVENT_PAYLOADS: "event-payloads",
  EXECUTION_LOGS: "execution-logs",
  FLOW_SNAPSHOTS: "flow-snapshots",
} as const;

export const FUNCTION_IDS = {
  WEBHOOK_RECEIVER: "webhook-receiver",
  EVENT_PROCESSOR: "event-processor",
  AI_TRANSFORMER: "ai-transformer",
  ROUTER_EXECUTOR: "router-executor",
  ANALYTICS_AGGREGATOR: "analytics-aggregator",
} as const;
