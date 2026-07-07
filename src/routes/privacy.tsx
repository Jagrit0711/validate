import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16 relative z-10 text-foreground">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">We only collect the information necessary to provide the certificate verification service. This may include basic usage data and error logs to improve the platform. We do not unnecessarily track our users.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-3">2. How We Use Information</h2>
            <p className="text-muted-foreground leading-relaxed">The information we collect is used strictly for operating and maintaining the Zuup Validate service. We do not sell your personal data to third parties under any circumstances.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-3">3. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access the service. However, no method of transmission over the internet is 100% secure.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-3">4. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">If you have any questions about this Privacy Policy, please contact us at <a href="mailto:jagrit@zuup.dev" className="text-primary hover:underline">jagrit@zuup.dev</a>.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
