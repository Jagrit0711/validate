import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/terms")({
  component: Terms,
});

function Terms() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16 relative z-10 text-foreground">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">By accessing and using Zuup Validate, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">Zuup Validate provides a platform for verifying digital certificates and credentials securely. The service is provided "as is" and "as available".</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-3">3. User Conduct</h2>
            <p className="text-muted-foreground leading-relaxed">You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the service.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-3">4. Custom Installations</h2>
            <p className="text-muted-foreground leading-relaxed">If you wish to use this verification platform for your own site or business, please contact us at <a href="mailto:jagrit@zuup.dev" className="text-primary hover:underline">jagrit@zuup.dev</a>.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
