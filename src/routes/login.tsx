import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, ADMIN_EMAIL } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/admin" });
        return;
      }
      // Redirect to the centralized Zuup Auth gateway
      const callbackUri = encodeURIComponent(`${window.location.origin}/callback`);
      window.location.href = `https://auth.zuup.dev/login?client_id=validate&redirect_uri=${callbackUri}&redirect_to=${callbackUri}`;
    });
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-8 shadow-2xl">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold mb-2">
            Taking you to <span className="italic text-primary">Zuup Auth</span>
          </h1>
          <p className="text-muted-foreground">Redirecting securely...</p>
        </div>
      </main>
    </div>
  );
}
