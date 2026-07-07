import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";

// Allow any search params to pass through
export const Route = createFileRoute("/callback")({
  component: CallbackPage,
});

function CallbackPage() {
  const nav = useNavigate();
  const search = useSearch({ from: "/callback" }) as { code?: string; token?: string };
  const code = search.code;
  const token = search.token;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function exchangeToken() {
      if (token) {
        // Gateway returned the token directly
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token, // or empty if gateway doesn't provide one
        });

        if (sessionError) throw sessionError;
        nav({ to: "/admin", replace: true });
        return;
      }

      if (!code) {
        setError("No authorization code or token found.");
        return;
      }

      try {
        // Exchange the code for a JWT via the Zuup Auth API
        const response = await fetch("https://auth.zuup.dev/api/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            client_id: "validate",
            redirect_uri: `${window.location.origin}/callback`,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to exchange authorization code.");
        }

        const data = await response.json();
        const { access_token, refresh_token } = data;

        if (!access_token || !refresh_token) {
          throw new Error("Invalid token payload received from Zuup Auth.");
        }

        // Establish the Supabase session securely on the client
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError) throw sessionError;
        nav({ to: "/admin", replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong during sign-in.");
      }
    }

    exchangeToken();
  }, [code, token, nav]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-md mx-auto px-6 py-16 text-center">
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 backdrop-blur p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-destructive mb-2">Auth Failed</h2>
            <p className="text-destructive/80 mb-6">{error}</p>
            <button
              onClick={() => nav({ to: "/login", replace: true })}
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-8 shadow-2xl">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold mb-2">Finalizing login...</h1>
            <p className="text-muted-foreground">Securing your session.</p>
          </div>
        )}
      </main>
    </div>
  );
}
