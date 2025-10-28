import Link from "next/link";
import {
  ArrowRight,
  Zap,
  GitBranch,
  Bot,
  BarChart3,
  Play,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimatedFlowDemo } from "@/components/landing/AnimatedFlowDemo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">EventMesh</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/docs"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Docs
              </Link>
              <Link
                href="https://github.com/yourusername/eventmesh"
                target="_blank"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24 overflow-hidden">
        {/* Grid Background for entire hero section */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              <span>Powered by Appwrite & AI</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              The Visual Event
              <br />
              <span className="text-primary">Routing Platform</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Capture, transform, and route webhook events in real-time with
              AI-powered intelligence. The developer-first alternative to Zapier
              and Make.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Start Building Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="gap-2">
                  <Play className="h-4 w-4" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Animated Flow Demo - Transparent, blends with background */}
          <div className="w-full">
            <AnimatedFlowDemo />
          </div>
        </div>
      </section>

      {/* Features Section - Why EventMesh? */}
      <section
        id="features"
        className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 overflow-hidden"
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Gradient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              <span>Platform Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Why EventMesh?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to build sophisticated event-driven workflows
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
              <div className="relative">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <GitBranch className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  Visual Flow Builder
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Drag-and-drop nodes to create complex event routing flows. See
                  your data flow in real-time with animated visualizations.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/5">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
              <div className="relative">
                <div className="h-14 w-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Bot className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  AI-Powered Transformations
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Let AI automatically detect payload structure, suggest
                  transformations, and generate code snippets instantly.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
              <div className="relative">
                <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  Real-time Processing
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Process events in real-time with sub-second latency. Watch
                  executions flow through your pipeline live.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
              <div className="relative">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  Analytics & Insights
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track event volume, success rates, latency metrics, and more
                  with beautiful real-time dashboards.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/5">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
              <div className="relative">
                <div className="h-14 w-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  Event Replay
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Replay any event with original or modified payloads. Perfect
                  for debugging and testing.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
              <div className="relative">
                <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  Developer-First
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Built by developers, for developers. Full API access, webhook
                  playground, and extensive documentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 overflow-hidden"
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Gradient Glow */}
        <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] bg-secondary/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <Play className="h-4 w-4" />
              <span>Simple Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started in minutes, scale to millions of events
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative group text-center">
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/80 border-4 border-background flex items-center justify-center shadow-xl">
                  <span className="text-3xl font-bold text-primary-foreground">
                    1
                  </span>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                Create a Flow
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Use our visual builder or AI to generate flows from natural
                language
              </p>

              {/* Connector Line - Hidden on mobile */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-secondary/50" />
            </div>

            {/* Step 2 */}
            <div className="relative group text-center">
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-secondary to-secondary/80 border-4 border-background flex items-center justify-center shadow-xl">
                  <span className="text-3xl font-bold text-secondary-foreground">
                    2
                  </span>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                Send Webhooks
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Point your services to your unique webhook URL and start sending
                events
              </p>

              {/* Connector Line - Hidden on mobile */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-secondary/50 to-primary/50" />
            </div>

            {/* Step 3 */}
            <div className="relative group text-center">
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/80 border-4 border-background flex items-center justify-center shadow-xl">
                  <span className="text-3xl font-bold text-primary-foreground">
                    3
                  </span>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                Watch It Flow
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor events in real-time as they transform and route to
                destinations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 overflow-hidden">
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Subtle Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            <span>Get Started Today</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Build Something Amazing?
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join developers building the future of event-driven architecture.
            Start for free, no credit card required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-base px-8 py-6">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base px-8 py-6"
              >
                View Documentation
              </Button>
            </Link>
          </div>

          {/* Simple Feature List */}
          <p className="mt-8 text-sm text-muted-foreground">
            ✨ 10,000 events/month free · No credit card required · Cancel
            anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border bg-card/30 backdrop-blur-sm">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <span className="text-2xl font-bold">EventMesh</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
                The developer&apos;s global event routing network. Build
                sophisticated event-driven workflows with ease.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="https://github.com/yourusername/eventmesh"
                  target="_blank"
                  className="h-9 w-9 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                >
                  <Github className="h-4 w-4" />
                </Link>
                <Link
                  href="https://twitter.com/eventmesh"
                  target="_blank"
                  className="h-9 w-9 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                >
                  <span className="text-sm font-bold">𝕏</span>
                </Link>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="font-bold mb-4 text-foreground">Product</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/changelog"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-bold mb-4 text-foreground">Company</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="font-bold mb-4 text-foreground">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/security"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 EventMesh. Built with ❤️ using Appwrite.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                href="/status"
                className="hover:text-primary transition-colors"
              >
                Status
              </Link>
              <Link
                href="/sitemap"
                className="hover:text-primary transition-colors"
              >
                Sitemap
              </Link>
              <Link
                href="/cookies"
                className="hover:text-primary transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
