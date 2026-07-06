import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ScanLine,
  Search,
  Sparkles,
  Paintbrush,
  Database,
  Download,
  ArrowRight,
  Layers,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
function Index() {
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();
  const scannerRef = useRef<any>(null); // blame the guy who wrote html5-qrcode

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
        } catch {
          /* lol not a url */
        }
        if (scanner) {
          scanner
            .stop()
            .then(() => submit(val))
            .catch(() => submit(val));
        } else {
          submit(val);
        }
      };

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScan,
          () => {},
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
              () => {},
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
      <main className="relative z-10">
        <div className="max-w-4xl mx-auto px-6 py-16 relative">
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
                ZuupValidate is a free verification tool for authenticating Zuup certificates.
                Instant results, zero setup. Built for students, organizers, and anyone who wants
                proof.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() =>
                    window.scrollTo({
                      top: document.getElementById("scanner")?.offsetTop || 0,
                      behavior: "smooth",
                    })
                  }
                  className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 h-12 text-base shadow-lg shadow-primary/25 border-0"
                >
                  Verify a Certificate &rarr;
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full h-12 px-8 text-base bg-card/20 backdrop-blur-md border-border/50 hover:bg-card/40"
                >
                  <Link to="/admin">Admin Dashboard</Link>
                </Button>
              </div>
              <div className="mt-6 text-xs text-muted-foreground flex items-center justify-center gap-2">
                Setup in seconds &middot; Open source &middot; Powered by Zuup
              </div>
            </div>
          </div>

          <div
            id="scanner"
            className="relative mx-auto rounded-xl border border-border/60 bg-[#0f0f12] shadow-2xl overflow-hidden ring-1 ring-white/5"
          >
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
                    <div
                      id="qr-reader"
                      className="rounded-lg overflow-hidden border border-border"
                    />
                    <Button variant="ghost" className="w-full" onClick={() => setScanning(false)}>
                      Cancel scan
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NEW Spotlight Section */}
        <section className="relative py-24 md:py-32 overflow-hidden bg-[#050508] border-t border-border/20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                <Sparkles className="h-4 w-4" /> Introducing Mailmerge Studio
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                Design once. <br className="hidden sm:block" />
                <span className="text-muted-foreground">Generate thousands.</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The world's easiest visual certificate builder. Upload a template, map your CSV
                data, and instantly generate cryptographic certificates in bulk.
              </p>
            </div>

            {/* Graphic Showcase (Pure CSS Mockup) */}
            <div className="relative rounded-2xl md:rounded-[2rem] border border-white/10 bg-white/5 p-2 md:p-4 shadow-2xl backdrop-blur-xl mx-auto max-w-5xl group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="w-full aspect-video rounded-xl md:rounded-[1.5rem] border border-white/10 shadow-2xl relative z-10 bg-[#0f0f12] flex overflow-hidden ring-1 ring-white/10">
                {/* Sidebar */}
                <div className="w-48 border-r border-white/10 bg-white/5 p-4 hidden md:flex flex-col gap-3">
                  <div className="w-full h-8 bg-white/10 rounded mb-4" />
                  <div className="w-full h-4 bg-white/5 rounded" />
                  <div className="w-3/4 h-4 bg-white/5 rounded" />
                  <div className="w-full h-4 bg-white/5 rounded" />
                  <div className="w-1/2 h-4 bg-white/5 rounded" />
                </div>
                {/* Canvas Area */}
                <div className="flex-1 p-6 md:p-12 flex items-center justify-center bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-black/40">
                  {/* The Certificate Preview */}
                  <div className="w-full max-w-lg aspect-[1.4] bg-white rounded-lg shadow-2xl relative p-6 md:p-10 flex flex-col items-center text-center ring-1 ring-black/10">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl md:text-4xl font-serif text-black mb-2">
                      Certificate of Excellence
                    </h1>
                    <p className="text-black/60 text-sm mb-4">This acknowledges that</p>

                    <div className="w-full py-2 border-2 border-dashed border-primary/50 bg-primary/5 rounded cursor-move group/drag relative">
                      <span className="text-xl md:text-2xl font-mono text-primary font-bold">{`{Full Name}`}</span>
                      <div className="absolute -top-3 -right-3 bg-primary text-white text-[10px] px-2 py-0.5 rounded shadow">
                        CSV Data
                      </div>
                    </div>

                    <div className="w-1/2 h-px bg-black/10 my-6" />
                    <p className="text-black/40 text-xs mt-auto">validate.zuup.dev</p>

                    {/* QR Placeholder */}
                    <div className="absolute bottom-6 right-6 w-20 h-20 bg-black/5 rounded-md border-2 border-dashed border-black/20 flex items-center justify-center cursor-move">
                      <ScanLine className="w-8 h-8 text-black/30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20">
              <div className="p-8 rounded-3xl bg-card/40 border border-border/50 backdrop-blur-sm hover:bg-card/60 transition-colors">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Paintbrush className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Visual Canvas</h3>
                <p className="text-muted-foreground">
                  Drag and drop dynamic text blocks, QR codes, and certificate numbers exactly where
                  you want them.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-card/40 border border-border/50 backdrop-blur-sm hover:bg-card/60 transition-colors">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">60+ Custom Fonts</h3>
                <p className="text-muted-foreground">
                  Match your brand perfectly with over 60 integrated Google Fonts, perfectly
                  rendered in the final PDF.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-card/40 border border-border/50 backdrop-blur-sm hover:bg-card/60 transition-colors">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">CSV to Bulk PDFs</h3>
                <p className="text-muted-foreground">
                  Map columns from any CSV to your template and automatically generate thousands of
                  unique, verified PDFs.
                </p>
              </div>
            </div>

            <div className="mt-20 text-center">
              <Button
                asChild
                className="rounded-full bg-white text-black hover:bg-gray-200 h-14 px-10 text-lg font-medium shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:scale-105"
              >
                <Link to="/admin">
                  Launch Studio <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Digital Verification Section */}
        <section className="relative py-24 md:py-32 bg-black border-t border-border/20">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
                Absolute Proof. <br />
                <span className="text-muted-foreground">Zero doubts.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Every certificate generated in the Studio is automatically registered in a secure,
                cryptographic database. Instantly scannable, forever verifiable.
              </p>

              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-lg">Row Level Security</h4>
                    <p className="text-muted-foreground">
                      Built on Supabase with hardened PostgreSQL row-level security.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    <ScanLine className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-lg">Universal Scanners</h4>
                    <p className="text-muted-foreground">
                      Any smartphone camera instantly authenticates the certificate on our platform.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
              <div className="relative rounded-2xl border border-white/10 bg-[#0f0f12] p-8 shadow-2xl backdrop-blur-sm flex flex-col items-center text-center">
                <div className="w-48 h-48 bg-white rounded-xl p-2 mb-8">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://validate.zuup.dev/v/ZUP-EXAMPLE"
                    alt="QR Code"
                    className="w-full h-full opacity-90"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Verified Authentic</h3>
                <p className="text-green-400 text-sm font-mono bg-green-400/10 px-3 py-1 rounded-full">
                  STATUS: SECURE
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
