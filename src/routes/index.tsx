import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanLine, Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();
  const scannerRef = useRef<any>(null);

  const submit = (val: string) => {
    const v = val.trim();
    if (!v) return;
    navigate({ to: "/v/$code", params: { code: v } });
  };

  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;
    let scanner: any = null;
    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;
      scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      const onScan = (decoded: string) => {
        let val = decoded;
        try {
          const u = new URL(decoded);
          const seg = u.pathname.split("/").filter(Boolean);
          val = seg[seg.length - 1] || decoded;
        } catch {}
        if (scanner) {
          scanner.stop().then(() => submit(val)).catch(() => submit(val));
        } else {
          submit(val);
        }
      };

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScan,
          () => {}
        );
      } catch (err) {
        if (cancelled) return;
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            await scanner.start(
              devices[0].id,
              { fps: 10, qrbox: { width: 250, height: 250 } },
              onScan,
              () => {}
            );
          } else {
            throw new Error("No cameras found");
          }
        } catch (fallbackErr) {
          console.error("Camera start failed:", fallbackErr);
          setScanning(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      if (scanner) {
        scanner.stop().catch(() => {});
        scanner.clear?.();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-16 pt-10 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/30 px-3 py-1 text-xs text-muted-foreground mb-8 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> A Zuup Initiative
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
              Verify certificates. <br className="hidden sm:block" />
              <span className="text-primary">Right here.</span>
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              ZuupValidate is a free verification tool for authenticating Zuup certificates. Instant results, zero setup. Built for students, organizers, and anyone who wants proof.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
               <Button onClick={() => window.scrollTo({top: document.getElementById('scanner')?.offsetTop || 0, behavior: 'smooth'})} className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 h-12 text-base shadow-lg shadow-primary/25 border-0">
                 Verify a Certificate &rarr;
               </Button>
               <Button asChild variant="outline" className="rounded-full h-12 px-8 text-base bg-card/20 backdrop-blur-md border-border/50 hover:bg-card/40">
                 <Link to="/admin">Admin Dashboard</Link>
               </Button>
            </div>
            <div className="mt-6 text-xs text-muted-foreground flex items-center justify-center gap-2">
               Setup in seconds &middot; Open source &middot; Powered by Zuup
            </div>
          </div>
        </div>

        <div id="scanner" className="relative mx-auto rounded-xl border border-border/60 bg-[#0f0f12] shadow-2xl overflow-hidden ring-1 ring-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 border-b border-border/40 bg-black/40 px-4 py-3">
             <div className="flex gap-1.5">
               <div className="h-3 w-3 rounded-full bg-red-500" />
               <div className="h-3 w-3 rounded-full bg-yellow-500" />
               <div className="h-3 w-3 rounded-full bg-green-500" />
             </div>
             <div className="flex-1 text-center text-xs font-mono text-muted-foreground opacity-70 mr-12">
               validate.sh - ZuupValidate
             </div>
          </div>
          <div className="p-6 md:p-10 relative z-10 backdrop-blur-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(code);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter certificate code (e.g. ZUP-A1B2C3)"
                className="h-12 text-base bg-background/50 border-border/50 focus-visible:ring-primary/50"
              />
              <Button type="submit" className="h-12 px-6">
                <Search className="h-4 w-4 mr-2" /> Verify
              </Button>
            </form>

            <div className="mt-6">
              {!scanning ? (
                <Button
                  variant="outline"
                  onClick={() => setScanning(true)}
                  className="w-full h-12 bg-card/20 border-border/50 hover:bg-card/40"
                >
                  <ScanLine className="h-4 w-4 mr-2" /> Scan QR Code
                </Button>
              ) : (
                <div className="space-y-3">
                  <div id="qr-reader" className="rounded-lg overflow-hidden border border-border" />
                  <Button variant="ghost" className="w-full" onClick={() => setScanning(false)}>
                    Cancel scan
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
