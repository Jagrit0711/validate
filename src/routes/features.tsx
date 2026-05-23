import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { ShieldCheck, Zap, Code, ScanLine } from "lucide-react";

export const Route = createFileRoute("/features")({
  component: Features,
});

function Features() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-16 pt-10">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Everything you need. <span className="text-primary">Built in.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Zuup Validate gives you powerful, instant verification tools out of the box. No configuration needed.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm">
            <ScanLine className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">QR Code Scanning</h3>
            <p className="text-muted-foreground">Instantly verify certificates by scanning their QR code directly from your mobile device or laptop camera.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm">
            <Zap className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">Verification happens in milliseconds. No waiting around—get absolute proof immediately.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm">
            <ShieldCheck className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Cryptographic Security</h3>
            <p className="text-muted-foreground">All certificates are backed by secure cryptographic records, ensuring absolute authenticity.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm">
            <Code className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Developer Friendly</h3>
            <p className="text-muted-foreground">Open architecture and easy integration means you can tie Zuup Validate into your own workflows.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
