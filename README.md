# EventMesh 🚀

<div align="center">

![EventMesh Banner](https://via.placeholder.com/1200x400/0a0a0a/00ff00?text=EventMesh+-+Visual+Event+Routing+Platform)

**The Next-Generation Visual Event Routing Platform**

Build complex webhook workflows with drag-and-drop simplicity, AI-powered transformations, and real-time processing.

[![Built with Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Powered by Appwrite](https://img.shields.io/badge/Appwrite-Cloud-f02e65)](https://appwrite.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Live Demo](#) · [Documentation](./app/docs/README.md) · [Quick Start](./app/docs/QUICKSTART.md) · [API Reference](./app/docs/api-reference.md)

</div>

---

## 🌟 What is EventMesh?

EventMesh is a **visual webhook routing platform** that makes event-driven architecture accessible to everyone. Instead of writing complex glue code, you **drag, drop, and connect** nodes to create powerful event processing pipelines.

### The Problem

Traditional webhook management is painful:

- 🔧 Complex integration code for every service
- 🐛 No visibility into event flow
- ⏱️ Time-consuming debugging
- 🔁 Repetitive transformation logic
- 📊 Limited monitoring and analytics

# EventMesh

EventMesh is a developer-first visual event routing platform designed to simplify, test, and operate webhook-driven integrations and event pipelines.

This repository contains the frontend application (Next.js + TypeScript) and supporting libraries for building, running, and testing flows that accept webhooks, run transformations (JavaScript or AI-assisted), and deliver events to destinations such as webhooks, Slack, Discord, or other APIs.

Table of contents

- Overview
- Motivation and value proposition
- Core concepts
- Architecture (high-level)
- Data flow (sequence)
- Features
- How EventMesh helps developers and testers
- Comparison with competing tools
- Quickstart (local development)
- Appwrite backend and collections (summary)
- Deployment notes
- Security considerations
- Contributing
- Roadmap
- License

## Overview

EventMesh provides a visual flow builder and an execution engine to route events from HTTP webhooks through transform steps to one or more destinations. The platform emphasizes developer productivity, observability, and safe experimentation via replay and testing tools.

Key properties:

- Visual flow builder (drag-and-drop)
- Transform nodes: JavaScript-first, optional AI assist for code generation and schema extraction
- Event ingestion via authenticated webhook endpoints
- Execution records and step-level tracing for observability
- Replay, playground, and testing tooling for QA
- Built on Appwrite for data, functions, and realtime subscriptions (configurable)

## Motivation and value proposition

Developers and QA teams often spend significant time wiring webhooks, creating transformation logic, and debugging event delivery problems. EventMesh reduces friction by:

- Offering a visual way to compose event pipelines, reducing boilerplate code
- Providing safe execution contexts for transformations with clear execution logs
- Allowing quick iteration via a built-in playground and event replay
- Offering analytics and success/failure visibility for operational monitoring

This combination shortens feedback loops, reduces integration bugs, and helps teams deliver reliable event-driven integrations faster.

## Core concepts

- Flow: a named DAG of nodes (source → transforms → destinations) saved per workspace.
- Node: a functional block; types include Source, Transform, and Destination.
- Source: generates webhook URLs that external systems post to.
- Transform: user-provided JavaScript or AI-generated code that mutates or filters payloads.
- Destination: an external endpoint (webhook, Slack, Discord) to which transformed payloads are delivered.
- Event: the record created when an external POST hits a Source webhook.
- Execution: the record and trace created when a flow processes an Event.

## Architecture (high-level)

The system separates concerns into Client, Orchestration, Data, and External layers. The following Mermaid diagram shows the high-level architecture.

```mermaid
graph LR
  UI[Client - Next.js App]
  API[Server - Next.js API & Appwrite Functions]
  Processor[Event Processor / Execution Engine]
  DB[Appwrite Database]
  Storage[Appwrite Storage]
  Realtime[Appwrite Realtime]
  AI[AI Services (OpenAI / Gemini)]
  Dest[External Destinations (Slack, Webhook, Discord, Email)]

  UI --> API
  API --> DB
  API --> Storage
  API --> Realtime
  API --> Processor
  Processor --> DB
  Processor --> AI
  Processor --> Dest
  Processor --> Realtime
  Dest -->|Delivery responses| Processor

  classDef infra fill:#f5f5f5,stroke:#333,stroke-width:1px;
  class API,Processor,DB,Storage,Realtime,AI,Dest infra;
```

## Data flow (sequence)

The following sequence diagram illustrates a typical event lifecycle from ingestion to delivery and UI update.

```mermaid
sequenceDiagram
  participant S as Sender (external)
  participant W as Webhook Receiver (API)
  participant DB as Appwrite DB
  participant P as Event Processor
  participant D as Destination
  participant UI as Frontend (Realtime)

  S->>W: POST /api/webhook/{webhookId} + headers
  W->>DB: write event (status: pending)
  W-->>S: 202 Accepted (eventId)
  DB->>P: trigger on event.create (or P polls)
  P->>DB: create execution (status: running)
  P->>P: execute nodes in DAG order (transform / route)
  P->>D: deliver payload
  D-->>P: response / error
  P->>DB: update execution (status: success/failed) and node-level logs
  P->>UI: broadcast updates via Realtime
  UI->>DB: fetch execution details for display
```

## Features

- Visual flow builder with drag-and-drop canvas
- Source nodes with auto-generated webhook URLs and API key authentication
- Transform nodes supporting JavaScript and AI-assisted generation
- Execution tracing with node-level inputs/outputs and errors
- Replay and playground for deterministic testing
- Destinations for webhooks, Slack, Discord, email, and custom APIs
- Analytics: event volume, success/failure rates, latency histograms
- Role- and workspace-based scoping for multi-tenant usage

## How EventMesh helps developers and testers (detailed)

Developer productivity

- Reduce time to integrate by composing flows visually instead of wiring glue code
- Reuse common transformation snippets between flows
- AI-assisted transforms accelerate creating robust parsing/mapping logic

Testing and QA

- Built-in Playground to exercise webhook endpoints with custom payloads and headers
- Event replay capability to re-run historical events against updated flows
- Deterministic executions stored in `executions` collection to inspect behavior

Observability and operations

- Node-level traces and execution durations to identify bottlenecks
- Aggregated analytics for operational health and capacity planning
- Retry and failure tracking for resilient delivery

Security and compliance

- API keys for trusted sources; optional webhook signature verification
- Encrypted storage for destination credentials and secrets
- Rate limiting to protect downstream systems and to enforce quotas

Business value

- Faster integration delivery reduces engineer-hours
- Improved reliability and observability reduces operational costs
- Reusable flow patterns create predictable outcomes across teams

## Comparison with other tools

This table summarizes differences between EventMesh and common existing solutions. The entries are concise; evaluate specifics against your use cases.

| Tool              |                                       Core focus |        Visual builder        |     AI-assisted transforms      |             Self-hostable              |    Open Source    | Pricing model                      | Best for                                                                   |
| ----------------- | -----------------------------------------------: | :--------------------------: | :-----------------------------: | :------------------------------------: | :---------------: | ---------------------------------- | -------------------------------------------------------------------------- |
| EventMesh         | Visual event routing + developer/testing tooling |             Yes              |         Yes (built-in)          | Yes (can self-host alongside Appwrite) | Yes / source repo | Open-source — self-host or managed | Developer teams building & testing webhook integrations and custom routing |
| Zapier            |                      SaaS integration automation |       Yes (task-based)       | Limited (via code steps / apps) |                   No                   |        No         | Subscription SaaS                  | Non-developer business automation                                          |
| Make (Integromat) |              Visual automation & data transforms |             Yes              |             Limited             |                   No                   |        No         | Subscription SaaS                  | Complex multi-app automations for business users                           |
| n8n               |              Workflow automation and integration |             Yes              |     Community nodes for AI      |                  Yes                   |     Yes (OSS)     | Self-host (OSS) + Cloud            | Devs & teams wanting self-hosted automation with extensibility             |
| Pipedream         |         Developer-focused event-driven workflows | Code-first with visual flows |      Supports AI via code       |      Yes (self-hosted enterprise)      |     Partially     | Cloud + Enterprise                 | Developers building programmatic integrations and event processors         |

Notes:

- EventMesh focuses specifically on webhook-first event routing, execution traceability, and testing workflows. It aims to combine the best of visual builders with developer control over transforms and execution artifacts.

## Quickstart (local development)

Prerequisites

- Node.js 20+ and npm
- An Appwrite project (cloud or self-hosted) with a database created
- (Optional) OpenAI API key for AI features

Local steps

1. Clone repository and install dependencies

```bash
cd /path/to/where/you/want
git clone https://github.com/Bayyana-kiran/eventmesh.git
cd eventmesh/app
npm install
```

2. Create `.env.local` in `app/` with required variables (see `app/.env.example` for names). At minimum set:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=eventmesh-db
APPWRITE_API_KEY=your_server_api_key
OPENAI_API_KEY=your_openai_key
```

3. Start the app

```bash
npm run dev
```

4. Visit `http://localhost:3000` and follow the onboarding to create a workspace and flows. Use the Playground to send test webhooks.

## Appwrite backend: collections (summary)

EventMesh expects the following collections in the configured Appwrite database. These are summarized; the docs contain detailed attribute types.

- workspaces — workspace metadata and settings
- flows — stored flow definitions (nodes, edges, webhookId, status)
- events — incoming webhook events (payload, headers, status, receivedAt)
- executions — execution traces and node-level logs
- destinations — destination configs and credentials
- api_keys — stored API keys (hashed) with permissions and last-used metadata
- analytics — aggregated metrics (optional)

Scripts and automation in `app/scripts/` help create collections or seed data when present.

## Deployment notes

- Frontend: deploy the `app/` directory to Vercel, Netlify, or a static hosting provider that supports Next.js Server components (or use the Node server for SSR builds).
- Backend (functions): Appwrite Cloud Functions are the primary recommendation for production-scale event processing; alternatively, adapt processing logic to dedicated serverless platforms.
- Environment variables are required both for the frontend and for serverless functions. Do not commit secrets to source control.

## Security considerations

- API keys: store hashed keys server-side; validate and log usage. Rotate keys periodically.
- Webhook signature verification: support provider signatures and timing-safe comparisons to validate sender authenticity.
- Secrets for destinations must be encrypted at rest and masked in UIs.
- Enforce per-workspace authorization and query scoping to avoid cross-tenant data leakage.
- Rate limiting and throttling: implement limits per API key/workspace to protect downstream systems.

## Contributing

We welcome contributors. Suggested process:

1. Fork the repository and create a topic branch for your change.
2. Open a clear PR with a description of the change and motivation.
3. Keep changes small and focused; add tests for new behavior.
4. Follow TypeScript and linting rules; run `npm run format` / `npm run lint` where available.

Please open issues for feature requests or bugs before a large implementation so maintainers can provide feedback on approach and scope.

## Roadmap

- Improve transform sandboxing and add replay test suites
- Add built-in role and team management for multi-user workspaces
- Expand destination templates and templates marketplace
- Add enterprise-grade rate limiting and billing integrations

## License

This project is provided under the MIT License. See the `LICENSE` file in the repository root.

## Contact and support

For issues and discussion, open an issue in this repository. Include reproduction steps and any logs when reporting bugs.
