export default function DocsLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span>Developer Docs</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">EventMesh — Documentation</h1>

          <p className="text-lg text-muted-foreground mb-8">
            This is a static documentation landing page for the EventMesh project.
            It contains an overview, core concepts, developer instructions, and
            operational notes. No external links or hyperlinks are included on
            this page by design.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 text-left">
            <div className="bg-card/50 border border-border rounded-xl p-6">
              <h3 className="font-bold mb-2">Flow Builder</h3>
              <p className="text-sm text-muted-foreground mb-3">
                The Flow Builder is a visual canvas for composing event-driven
                flows. A flow is a collection of nodes and edges that define how
                incoming events are transformed and routed to destinations.
              </p>
              <div className="text-sm font-medium text-foreground">See section: Flow Builder Guide (below)</div>
            </div>

            <div className="bg-card/50 border border-border rounded-xl p-6">
              <h3 className="font-bold mb-2">API & Integrations</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Core API surfaces include webhook intake endpoints, a flows
                management API, and runtime/executions endpoints. Examples and
                payload shapes are included in the API reference section.
              </p>
              <div className="text-sm font-medium text-foreground">Reference: API Reference (below)</div>
            </div>
          </div>

          <div className="space-y-8 text-left">
            <section className="bg-card/30 border border-border rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-3">Overview</h3>
              <p className="text-sm text-muted-foreground">
                EventMesh is a developer-first, open-source-like event routing
                platform intended for capturing webhook events, allowing
                developers to transform events (JavaScript/AI-assisted
                transforms), and reliably route them to destinations such as
                messaging platforms, email, or other HTTP endpoints.
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card/30 border border-border rounded-xl p-6">
                <h4 className="font-bold mb-2">Core Concepts</h4>
                <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-2">
                  <li>
                    <strong>Flows</strong> — Declarative visual definitions composed of
                    nodes and edges. Flows are versioned and can be executed on
                    demand or on event receipt.
                  </li>
                  <li>
                    <strong>Nodes</strong> — Three types: Sources (ingest),
                    Transforms (map/filter/enrich), Destinations (deliver).
                  </li>
                  <li>
                    <strong>Executions</strong> — Runtime records containing input,
                    step-by-step outputs, logs, and final delivery status for
                    observability and retries.
                  </li>
                  <li>
                    <strong>Destinations</strong> — Configurable endpoints with
                    retries, backoff, and mapping templates.
                  </li>
                </ul>
              </div>

              <div className="bg-card/30 border border-border rounded-xl p-6">
                <h4 className="font-bold mb-2">Contributing & Governance</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Contributions are welcomed via standard git workflows. When
                  contributing, follow repository conventions: descriptive
                  commits, tests for new behavior, and clear PR descriptions.
                </p>
                <div className="text-sm text-muted-foreground">Repository: Bayyana-kiran/EventMesh (no hyperlinks shown)</div>
              </div>
            </section>

            <section className="bg-card/30 border border-border rounded-xl p-6">
              <h4 className="font-bold mb-2">Getting started (local)</h4>
              <ol className="text-sm text-muted-foreground list-decimal ml-5 space-y-2">
                <li>Clone the repository to your machine.</li>
                <li>Install dependencies with your package manager (npm/yarn/pnpm).</li>
                <li>Copy or create a .env file with necessary keys (see README).</li>
                <li>Run the development server and open the app at the indicated port.</li>
                <li>Load sample flows from the examples folder and send test webhooks to verify behavior.</li>
              </ol>
            </section>

            <section className="bg-card/30 border border-border rounded-xl p-6">
              <h4 className="font-bold mb-2">API Reference (summary)</h4>
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Key endpoints and payload shapes (high level):</p>
                <ul className="list-disc ml-5 space-y-2">
                  <li><strong>/api/events</strong> — Ingest webhook events (POST). Include JSON payload and headers as received from the source.</li>
                  <li><strong>/api/flows</strong> — Manage flows (CRUD) and run test executions.</li>
                  <li><strong>/api/executions</strong> — Query execution history, logs, and status for a specific run.</li>
                  <li><strong>/api/destinations</strong> — Configure and test destination endpoints.</li>
                </ul>
                <p className="mt-3">For full, machine-oriented examples consult the repository README and the inline API documentation in the codebase.</p>
              </div>
            </section>

            <section className="bg-card/30 border border-border rounded-xl p-6">
              <h4 className="font-bold mb-2">Development notes</h4>
              <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-2">
                <li>Follow the project's TypeScript settings and lint rules.</li>
                <li>Write unit tests for transform logic and integration tests for flow execution paths.</li>
                <li>Keep migrations and database changes isolated and clearly documented.</li>
              </ul>
            </section>

            <section className="bg-card/30 border border-border rounded-xl p-6">
              <h4 className="font-bold mb-2">Testing & CI</h4>
              <p className="text-sm text-muted-foreground">The project includes automated checks that run on pull requests. Ensure tests pass locally before pushing changes. Add tests that cover new behavior and edge cases.</p>
            </section>

            <section className="bg-card/30 border border-border rounded-xl p-6">
              <h4 className="font-bold mb-2">Deployment & Operations</h4>
              <p className="text-sm text-muted-foreground">Deploy using the repository's recommended platform. Monitor executions and destination failures and configure alerting around delivery error rates and retry saturation.</p>
            </section>

            <section className="bg-card/30 border border-border rounded-xl p-6">
              <h4 className="font-bold mb-2">License & Attribution</h4>
              <p className="text-sm text-muted-foreground">See the repository for license details. This page intentionally omits direct hyperlinks; check the project root for LICENSE and README files for authoritative legal and usage information.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
