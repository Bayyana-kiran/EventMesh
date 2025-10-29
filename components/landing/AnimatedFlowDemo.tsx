"use client";

import { useEffect, useState } from "react";
import {
  Webhook,
  Zap,
  Send,
  CheckCircle2,
  Code2,
  Sparkles,
} from "lucide-react";

interface Particle {
  id: number;
  progress: number;
  stage: number; // 0: source->transform, 1: transform->destination
}

export function AnimatedFlowDemo() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    // Create particles continuously
    const particleInterval = setInterval(() => {
      const newParticle: Particle = {
        id: Date.now() + Math.random(),
        progress: 0,
        stage: 0,
      };
      setParticles((prev) => [...prev, newParticle]);
    }, 2500);

    // Animate particles
    const animationInterval = setInterval(() => {
      setParticles((prev) => {
        const updated = prev
          .map((particle) => {
            const newProgress = particle.progress + 2;

            // Stage 0: source to transform (0-100)
            if (particle.stage === 0) {
              if (newProgress >= 100) {
                setActiveNode(1); // Transform node active
                return { ...particle, progress: 0, stage: 1 };
              }
              return { ...particle, progress: newProgress };
            }
            // Stage 1: transform to destination (0-100)
            else if (particle.stage === 1) {
              if (newProgress >= 100) {
                setActiveNode(2); // Destination node active
                setTimeout(() => {
                  setCompletedCount((c) => c + 1);
                  setActiveNode(null);
                }, 200);
                return null; // Remove particle
              }
              return { ...particle, progress: newProgress };
            }
            return particle;
          })
          .filter((p) => p !== null) as Particle[];

        return updated;
      });
    }, 30);

    return () => {
      clearInterval(particleInterval);
      clearInterval(animationInterval);
    };
  }, []);

  return (
    <div className="relative w-full aspect-[20/9] md:aspect-[21/9] lg:aspect-[24/9] overflow-hidden">
      {/* Glow Effects - No grid, no background, just glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 md:w-[40rem] md:h-[40rem] bg-primary/12 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 md:w-[40rem] md:h-[40rem] bg-secondary/12 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full p-4 md:p-8 lg:p-12">
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-6 md:gap-12 lg:gap-20">
          {/* Source Node */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={`relative group transition-all duration-300 ${
                activeNode === 0 ? "scale-110" : ""
              }`}
            >
              <div
                className={`absolute inset-0 rounded-2xl blur-2xl transition-opacity duration-500 ${
                  activeNode === 0
                    ? "bg-primary/50 opacity-100"
                    : "bg-primary/20 opacity-40"
                }`}
              />
              <div className="relative bg-gradient-to-br from-primary via-primary to-primary/90 p-4 md:p-6 lg:p-7 rounded-2xl shadow-2xl border-2 border-primary/50">
                <Webhook className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-primary-foreground" />
              </div>
              {activeNode === 0 && (
                <div className="absolute -inset-3 border-2 border-primary rounded-2xl animate-ping" />
              )}
            </div>
            <div className="text-center">
              <p className="text-foreground font-bold text-base md:text-lg lg:text-xl">
                Webhook
              </p>
              <p className="text-muted-foreground text-xs md:text-sm">
                Event Source
              </p>
            </div>
          </div>

          {/* Connection Line 1 with particles */}
          <div className="flex-1 relative h-1.5 bg-gradient-to-r from-primary/20 via-primary/40 to-secondary/20 rounded-full min-w-[100px] md:min-w-[180px] lg:min-w-[240px] rotate-90 md:rotate-0 my-6 md:my-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-secondary rounded-full animate-pulse opacity-40" />
            {particles
              .filter((p) => p.stage === 0)
              .map((particle) => (
                <div
                  key={particle.id}
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 bg-primary rounded-full shadow-xl shadow-primary/60 transition-all"
                  style={{
                    left: `${particle.progress}%`,
                    transform: `translate(-50%, -50%) scale(${
                      1 + Math.sin((particle.progress / 100) * Math.PI) * 0.5
                    })`,
                  }}
                >
                  <div className="absolute inset-0 bg-primary/80 rounded-full animate-ping" />
                </div>
              ))}
          </div>

          {/* Transform Node */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={`relative group transition-all duration-300 ${
                activeNode === 1 ? "scale-110" : ""
              }`}
            >
              <div
                className={`absolute inset-0 rounded-2xl blur-2xl transition-opacity duration-500 ${
                  activeNode === 1
                    ? "bg-secondary/50 opacity-100"
                    : "bg-secondary/20 opacity-40"
                }`}
              />
              <div className="relative bg-gradient-to-br from-secondary via-secondary to-secondary/90 p-4 md:p-6 lg:p-7 rounded-2xl shadow-2xl border-2 border-secondary/50">
                <div className="relative">
                  <Zap className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-secondary-foreground" />
                  {activeNode === 1 && (
                    <Sparkles className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 text-accent animate-spin" />
                  )}
                </div>
              </div>
              {activeNode === 1 && (
                <div className="absolute -inset-3 border-2 border-secondary rounded-2xl animate-ping" />
              )}
            </div>
            <div className="text-center">
              <p className="text-foreground font-bold text-base md:text-lg lg:text-xl">
                AI Transform
              </p>
              <p className="text-muted-foreground text-xs md:text-sm">
                Process & Enrich
              </p>
            </div>
          </div>

          {/* Connection Line 2 with particles */}
          <div className="flex-1 relative h-1.5 bg-gradient-to-r from-secondary/20 via-secondary/40 to-primary/20 rounded-full min-w-[100px] md:min-w-[180px] lg:min-w-[240px] rotate-90 md:rotate-0 my-6 md:my-0">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary to-primary rounded-full animate-pulse opacity-40" />
            {particles
              .filter((p) => p.stage === 1)
              .map((particle) => (
                <div
                  key={particle.id}
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 bg-secondary rounded-full shadow-xl shadow-secondary/60 transition-all"
                  style={{
                    left: `${particle.progress}%`,
                    transform: `translate(-50%, -50%) scale(${
                      1 + Math.sin((particle.progress / 100) * Math.PI) * 0.5
                    })`,
                  }}
                >
                  <div className="absolute inset-0 bg-secondary/80 rounded-full animate-ping" />
                </div>
              ))}
          </div>

          {/* Destination Node */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={`relative group transition-all duration-300 ${
                activeNode === 2 ? "scale-110" : ""
              }`}
            >
              <div
                className={`absolute inset-0 rounded-2xl blur-2xl transition-opacity duration-500 ${
                  activeNode === 2
                    ? "bg-primary/50 opacity-100"
                    : "bg-primary/20 opacity-40"
                }`}
              />
              <div className="relative bg-gradient-to-br from-primary via-primary to-primary/90 p-4 md:p-6 lg:p-7 rounded-2xl shadow-2xl border-2 border-primary/50">
                <Send className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-primary-foreground" />
              </div>
              {activeNode === 2 && (
                <>
                  <div className="absolute -inset-3 border-2 border-primary rounded-2xl animate-ping" />
                  <CheckCircle2 className="absolute -top-3 -right-3 w-7 h-7 md:w-8 md:h-8 text-primary animate-bounce" />
                </>
              )}
            </div>
            <div className="text-center">
              <p className="text-foreground font-bold text-base md:text-lg lg:text-xl">
                Destination
              </p>
              <p className="text-muted-foreground text-xs md:text-sm">
                Slack, Email, etc.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="bg-card/90 backdrop-blur-md border border-border/50 rounded-xl px-5 md:px-7 py-3 md:py-4 flex items-center gap-3 shadow-xl">
          <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
          <span className="text-foreground font-semibold text-sm md:text-base lg:text-lg">
            Live Event Flow
          </span>
        </div>

        <div className="bg-card/90 backdrop-blur-md border border-border/50 rounded-xl px-5 md:px-7 py-3 md:py-4 shadow-xl">
          <div className="flex items-center gap-5 md:gap-6">
            <div className="text-center">
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tabular-nums">
                {completedCount}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Events Processed
              </p>
            </div>
            <div className="w-px h-10 md:h-12 bg-border" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary tabular-nums">
                {particles.length}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                In Transit
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet Overlay */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-card/90 backdrop-blur-md border border-border/50 rounded-xl p-4 md:p-5 max-w-[220px] md:max-w-sm hidden lg:block shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="w-4 h-4 text-secondary" />
          <span className="text-xs md:text-sm font-bold text-foreground">
            Event Structure
          </span>
        </div>
        <pre className="text-xs text-muted-foreground font-mono overflow-hidden leading-relaxed">
          <code>{`{
  "event": "user.action",
  "data": { ... },
  "timestamp": "ISO string"
}`}</code>
        </pre>
      </div>
    </div>
  );
}
