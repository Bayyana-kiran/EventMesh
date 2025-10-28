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

### The Solution

EventMesh provides:

- 🎨 **Visual Flow Builder** - Design event pipelines with drag-and-drop
- 🤖 **AI Transformations** - Let GPT-4 write your transformation code
- ⚡ **Real-time Processing** - See events flow through your system live
- 📊 **Built-in Analytics** - Track performance and success rates
- 🔄 **Event Replay** - Debug and test with historical events
- 🎯 **Multi-Destination Routing** - Send to Slack, Discord, APIs, and more

---

## ✨ Key Features

### 1. Visual Flow Builder

Build complex event routing workflows with an intuitive drag-and-drop interface powered by React Flow.

```
[GitHub Webhook] → [Transform] → [Slack Notification]
                 ↘ [Filter]    → [Database]
```

**Node Types:**

- **Source Nodes** - Webhook receivers with unique URLs
- **Transform Nodes** - JavaScript or AI-powered data transformation
- **Destination Nodes** - Slack, Discord, Webhooks, Email

### 2. AI-Powered Transformations

Describe what you want in plain English, and GPT-4 generates the transformation code.

**Example:**

```
User: "Extract the PR number and author from GitHub webhook"
AI: Generates JavaScript transformation code automatically
```

### 3. Real-Time Event Streaming

Watch events flow through your system with live animations and execution tracking.

### 4. Comprehensive Analytics

- Event volume trends
- Success/failure rates
- Response time distribution
- Flow performance metrics

### 5. Developer-First Experience

- Built-in webhook tester
- cURL command generator
- API documentation
- Event replay for debugging

---

## 🏗️ Architecture

EventMesh is built on a modern, scalable stack:

### Frontend

- **Next.js 14** (App Router, Server Components)
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **React Flow** - Visual flow builder
- **Zustand** - State management

### Backend

- **Appwrite** - Complete backend platform
  - **Functions** - Serverless event processing
  - **Database** - Event and flow storage
  - **Realtime** - Live event streaming
  - **Auth** - User authentication
  - **Storage** - Event payload archiving

### AI

- **OpenAI GPT-4** - Intelligent transformations and code generation

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Appwrite account ([sign up free](https://cloud.appwrite.io))
- OpenAI API key

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

### 3. Configure Environment Variables

Create `app/.env.local`:

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

# Server-side Appwrite
APPWRITE_API_KEY=your-api-key

# OpenAI
OPENAI_API_KEY=your-openai-key
```

### 4. Set Up Appwrite Backend

Follow the [complete deployment guide](./app/docs/DEPLOYMENT.md) to:

- Create database and collections
- Deploy Appwrite Functions
- Configure authentication

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

---

## 📖 Usage Examples

### Example 1: GitHub to Slack Notifications

Route GitHub push events to a Slack channel:

1. Create a new flow
2. Add a **Source Node** (generates webhook URL)
3. Add a **Transform Node** with JavaScript:
   ```javascript
   return {
     text: `New push to ${payload.repository.name}`,
     author: payload.pusher.name,
     commits: payload.commits.length,
   };
   ```
4. Add a **Destination Node** (Slack webhook)
5. Connect and activate

### Example 2: Stripe to CRM Sync

Automatically sync Stripe payments to your CRM:

1. Source: Stripe webhook
2. Transform (AI): "Extract customer email and amount"
3. Destination: Custom API endpoint

### Example 3: Form Submissions to Multiple Channels

Distribute form submissions to email, Slack, and database:

```
[Form Webhook] → [Transform] → [Email]
               ↘ [Format]    → [Slack]
               ↘ [Validate]  → [Database API]
```

---

## 🎯 Use Cases

- **DevOps Automation** - Deploy notifications, CI/CD triggers
- **Customer Communication** - Order confirmations, support tickets
- **Data Integration** - Sync between SaaS tools
- **Monitoring & Alerts** - System health, error tracking
- **Analytics Pipelines** - Event collection and processing
- **Multi-Channel Notifications** - Slack, Discord, Email, SMS

---

## 🛠️ Development

### Project Structure

See the detailed [codebase structure documentation](./app/docs/CODEBASE_STRUCTURE.md) for a complete overview.

```
eventmesh/
├── app/                      # Next.js frontend
│   ├── app/                  # App router pages
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── login/            # Auth pages
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components
│   │   ├── flow/             # Flow builder components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                  # Utilities and configs
│   │   ├── appwrite/         # Appwrite SDK setup
│   │   ├── types.ts          # TypeScript definitions
│   │   └── utils.ts          # Helper functions
│   └── package.json
│
├── docs/                     # Complete documentation
│   ├── README.md             # Docs index
│   ├── QUICKSTART.md         # Quick start guide
│   ├── DEPLOYMENT.md         # Deployment guide
│   ├── ARCHITECTURE.md       # System architecture
│   ├── CODEBASE_STRUCTURE.md # Code organization
│   ├── TESTING_GUIDE.md      # Testing documentation
│   ├── api-reference.md      # API documentation
│   ├── flow-builder.md       # Flow builder guide
│   ├── webhooks.md           # Webhook guide
│   └── transformations.md    # Transformation guide
│
├── functions/                # Appwrite Functions
│   ├── webhook-receiver/     # Receives webhooks
│   ├── event-processor/      # Processes events through flows
│   └── ai-transformer/       # AI-powered transformations
│
└── README.md                 # This file
```

### Available Scripts

**Frontend:**

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

**Functions:**

```bash
cd functions/webhook-receiver
npm install          # Install dependencies
npm run format       # Format code with Prettier
```

### Contributing

We welcome contributions! See our [contribution guide](./CONTRIBUTING.md) for guidelines.

---

## 📊 Performance

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90
- **Event Processing Latency**: < 200ms avg

---

## 🔒 Security

- ✅ API key authentication for webhooks
- ✅ CORS configuration
- ✅ Input validation on all endpoints
- ✅ Rate limiting per workspace
- ✅ Encrypted environment variables
- ✅ Secure Appwrite Functions execution

---

## 🗺️ Roadmap

### v1.0 (Current) ✅

- Visual flow builder
- Basic transformations
- Slack/Discord destinations
- Analytics dashboard

### v1.1 (Next)

- [ ] Flow templates marketplace
- [ ] Webhook signature verification
- [ ] Advanced filtering and routing
- [ ] Team collaboration features

### v2.0 (Future)

- [ ] CLI tool (`npx eventmesh init`)
- [ ] GraphQL API
- [ ] Native integrations (Stripe SDK, GitHub App)
- [ ] Flow versioning and rollback
- [ ] Custom node plugins

[See full roadmap](./app/docs/roadmap.md)

---

## 🤝 Built With

- [Next.js](https://nextjs.org/) - React framework
- [Appwrite](https://appwrite.io/) - Backend platform
- [React Flow](https://reactflow.dev/) - Flow visualization
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [OpenAI](https://openai.com/) - AI transformations
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Recharts](https://recharts.org/) - Analytics charts

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- Appwrite team for an amazing backend platform
- React Flow team for the flow visualization library
- shadcn for the beautiful component library
- The open-source community

---

## 🔗 Links

- **Live Demo**: [eventmesh.dev](#)
- **Documentation**: [docs.eventmesh.dev](#)
- **Discord**: [discord.gg/eventmesh](#)
- **Twitter**: [@eventmesh](#)

---

<div align="center">

**Made with ❤️ by developers, for developers**

[⬆ Back to Top](#eventmesh-)

</div>
