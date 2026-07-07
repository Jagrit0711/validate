import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Paintbrush, ShieldCheck, Database, CheckCircle2, LayoutTemplate, Layers, AlignLeft, MousePointer2, ScanLine, Github, Youtube, Instagram, Mail, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
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
    <div className="min-h-screen bg-[#000] text-white selection:bg-primary/30 selection:text-white font-sans overflow-hidden">
      <Header />
      
      {/* Abstract Background Blurs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-[100%] blur-[150px] opacity-70 mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#0f172a] rounded-[100%] blur-[150px] opacity-80 mix-blend-screen" />
      </div>

      <main className="relative z-10">
        <section className="min-h-[85vh] flex flex-col justify-center items-center px-6 text-center pt-20 animate-fadeIn">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tighter mb-8 leading-[0.9] animate-fadeInUp delay-100">
            <span className="text-white">Verify</span> <br /> <span className="text-[#FF3D7F]">Automatically</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/50 max-w-2xl font-light tracking-wide mb-12 animate-fadeInUp delay-200">
            The cryptographic layer for digital certificates. Deploy your own verification gateway instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 w-full max-w-lg mx-auto animate-fadeInUp delay-300">
              <a 
                href="https://deploy.workers.cloudflare.com/?url=https://github.com/Jagrit0711/validate" 
                target="_blank" 
                rel="noreferrer"
                className="hover:scale-105 transition-transform hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] rounded-md"
              >
                <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers" className="h-11" />
              </a>
              <a 
                href="https://github.com/Jagrit0711/validate" 
                target="_blank" 
                rel="noreferrer"
                className="text-white/50 hover:text-white font-light tracking-wide transition-colors text-lg"
              >
                View Repository &rarr;
              </a>
          </div>
        </section>

        {/* Verification Scanner Section */}
        <section id="verify" className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mb-6">
                <span className="text-white">Instantly</span> <span className="text-[#FF3D7F]">Verify</span>
              </h2>
              <p className="text-lg text-white/40 font-light tracking-wide max-w-xl mx-auto">
                Test the protocol. Enter a cryptographic identifier or scan a certificate code to query the network.
              </p>
            </div>

            <div className="max-w-2xl mx-auto bg-white/[0.02] border border-white/10 p-2 rounded-[2rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              
              <div className="bg-[#050505] rounded-[1.5rem] p-8 md:p-12 relative z-10 border border-white/5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit(code);
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="relative">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter identifier..."
                      className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                  <button type="submit" className="h-16 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-colors">
                    Query Database
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5">
                  {!scanning ? (
                    <button
                      onClick={() => setScanning(true)}
                      className="w-full h-16 rounded-2xl bg-transparent border border-white/10 hover:bg-white/5 text-white/50 font-medium transition-colors uppercase tracking-widest text-sm"
                    >
                      Initialize Scanner
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
                        <div
                          id="qr-reader"
                          className="w-full"
                        />
                        <div className="scanner-laser" />
                      </div>
                      <button className="w-full h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-red-400 font-medium transition-colors" onClick={() => setScanning(false)}>
                        Terminate Scan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid (No SVG Icons) */}
        <section id="features" className="py-40 px-6 border-t border-white/5 bg-black relative">
           <div className="max-w-7xl mx-auto relative z-10">
              <h2 className="text-5xl md:text-8xl font-medium tracking-tighter mb-20 text-center animate-fadeIn">
                <span className="text-white">A Complete</span> <span className="text-[#FF3D7F]">Suite.</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeInUp delay-100">
                 
                 {/* Visual Canvas (Wide) */}
                 <div className="md:col-span-12 lg:col-span-8 p-1 rounded-[2rem] bg-gradient-to-br from-white/10 to-transparent relative group">
                    <div className="h-full w-full bg-[#050505] rounded-[1.8rem] p-10 md:p-14 flex flex-col justify-between border border-white/5 relative overflow-hidden">
                       <div className="relative z-10 mb-12">
                          <h3 className="text-3xl md:text-4xl font-medium text-white mb-4 tracking-tight">Visual Canvas</h3>
                          <p className="text-lg text-white/40 max-w-md font-light">
                             Upload templates, drag elements directly on the canvas, and issue pixel-perfect certificates without writing code.
                          </p>
                       </div>

                       {/* App Window Mockup */}
                       <div className="w-full bg-[#0f0f12] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden mt-auto flex flex-col h-[280px] animate-float">
                          {/* App Header */}
                          <div className="h-10 border-b border-white/10 bg-[#151518] flex items-center px-4 gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-500/80" />
                             <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                             <div className="w-3 h-3 rounded-full bg-green-500/80" />
                             <div className="mx-auto text-xs font-medium text-white/30">template.pdf</div>
                          </div>
                          {/* App Body */}
                          <div className="flex flex-1">
                             {/* Sidebar */}
                             <div className="w-16 border-r border-white/10 flex flex-col items-center py-4 gap-6 text-white/40 bg-[#0c0c0f]">
                                <MousePointer2 strokeWidth={1.5} className="w-5 h-5 text-white" />
                                <LayoutTemplate strokeWidth={1.5} className="w-5 h-5" />
                                <AlignLeft strokeWidth={1.5} className="w-5 h-5" />
                                <Layers strokeWidth={1.5} className="w-5 h-5" />
                             </div>
                             {/* Canvas */}
                             <div className="flex-1 bg-[#050505] flex items-center justify-center p-6 relative">
                                <div className="w-3/4 aspect-[1.414] bg-white rounded shadow-2xl p-6 relative overflow-hidden">
                                   <div className="w-full h-2 bg-black/10 rounded-full mb-4" />
                                   <div className="w-2/3 h-2 bg-black/10 rounded-full mb-8 mx-auto" />
                                   
                                   {/* Draggable Element */}
                                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-primary bg-primary/10 rounded p-2 flex items-center justify-center shadow-lg min-w-[120px]">
                                      <div className="w-1.5 h-1.5 bg-primary rounded-full absolute -top-1 -left-1" />
                                      <div className="w-1.5 h-1.5 bg-primary rounded-full absolute -top-1 -right-1" />
                                      <div className="w-1.5 h-1.5 bg-primary rounded-full absolute -bottom-1 -left-1" />
                                      <div className="w-1.5 h-1.5 bg-primary rounded-full absolute -bottom-1 -right-1" />
                                      <span className="text-primary font-mono text-[10px] font-bold tracking-wider">{`{Recipient}`}</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Cryptographic Trust (Vertical) */}
                 <div className="md:col-span-12 lg:col-span-4 p-1 rounded-[2rem] bg-gradient-to-b from-green-500/20 to-transparent relative group">
                     <div className="h-full w-full bg-[#050505] rounded-[1.8rem] p-10 flex flex-col border border-white/5">
                        <h3 className="text-3xl font-medium text-white mb-4 tracking-tight">Zero-Trust Verification</h3>
                       <p className="text-lg text-white/40 font-light mb-12 flex-1">
                          Every credential contains a unique signature, instantly verifiable without a central database login.
                       </p>

                       <div className="relative bg-[#0a0a0c] rounded-2xl border border-white/10 p-6 text-center shadow-2xl flex flex-col items-center justify-center mt-auto h-[200px]">
                         <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20">
                           <CheckCircle2 strokeWidth={2} className="w-8 h-8 text-green-500" />
                         </div>
                         <div className="text-white font-medium text-lg tracking-wide mb-1">Authentic</div>
                         <div className="text-white/30 font-mono text-[11px] truncate w-full px-4 tracking-wider">0x8F2A9C1B...E4D2</div>
                       </div>
                    </div>
                 </div>

                 {/* Bulk Automation (Wide) */}
                 <div className="md:col-span-12 p-1 rounded-[2rem] bg-gradient-to-r from-blue-500/20 to-purple-500/20 relative group mt-6">
                    <div className="h-full w-full bg-[#050505] rounded-[1.8rem] p-10 md:p-14 flex flex-col lg:flex-row gap-12 border border-white/5 items-center">
                       <div className="flex-1">
                          <h3 className="text-3xl md:text-4xl font-medium text-white mb-4 tracking-tight">Bulk Automation Pipeline</h3>
                          <p className="text-lg text-white/40 font-light max-w-lg">
                             Map CSV columns to variables and issue thousands of secure certificates simultaneously in a single click.
                          </p>
                       </div>
                       
                       <div className="flex-1 w-full bg-[#0f0f12] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[250px] animate-float-delayed">
                          <div className="h-10 border-b border-white/10 bg-[#151518] flex items-center px-4 justify-between">
                             <div className="text-xs font-mono text-white/30 uppercase tracking-widest">Data Mapping</div>
                             <div className="text-[10px] text-blue-400 font-medium px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">10,000 Rows</div>
                          </div>
                          <div className="flex-1 p-6 space-y-3 bg-[#0a0a0c]">
                             <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                   <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] text-white/50 font-mono">A</div>
                                   <div className="font-mono text-sm text-white/80">full_name</div>
                                </div>
                                <div className="w-8 border-t border-dashed border-white/30" />
                                <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-xs font-mono font-medium">{`{Recipient}`}</div>
                             </div>
                             <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                   <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] text-white/50 font-mono">B</div>
                                   <div className="font-mono text-sm text-white/80">email_addr</div>
                                </div>
                                <div className="w-8 border-t border-dashed border-white/30" />
                                <div className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white/80 text-xs font-mono font-medium">{`{Email}`}</div>
                             </div>
                             <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-lg opacity-40">
                                <div className="flex items-center gap-3">
                                   <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] text-white/50 font-mono">C</div>
                                   <div className="font-mono text-sm text-white/80">issue_date</div>
                                </div>
                                <div className="w-8 border-t border-dashed border-white/30" />
                                <div className="text-xs text-white/40 font-medium italic pr-2">Unmapped</div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Developer Ecosystem Section - Typography Driven, No Boxes */}
        <section id="ecosystem" className="py-40 px-6 border-t border-white/5 bg-[#030303] relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] pointer-events-none mix-blend-screen" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <h2 className="text-5xl md:text-8xl font-medium tracking-tighter mb-32 animate-fadeIn">
              <span className="text-white">Built for</span> <br/><span className="text-[#FF3D7F]">Developers</span>
            </h2>
            
            <div className="flex flex-col gap-32 max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start group animate-fadeInUp delay-100">
                <div className="text-7xl font-light text-primary/30 group-hover:text-primary transition-colors">01</div>
                <div>
                  <h3 className="text-4xl font-medium text-white mb-6">Edge Computing</h3>
                  <p className="text-xl md:text-2xl text-white/40 font-light leading-relaxed">
                    Deployed instantly to Cloudflare Workers. Sub-millisecond latency worldwide, ensuring validation requests are served globally without bottlenecks.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start group animate-fadeInUp delay-200 md:ml-24">
                <div className="text-7xl font-light text-primary/30 group-hover:text-primary transition-colors">02</div>
                <div>
                  <h3 className="text-4xl font-medium text-white mb-6">Serverless Auth</h3>
                  <p className="text-xl md:text-2xl text-white/40 font-light leading-relaxed">
                    Seamlessly integrates with Supabase for robust row-level security and persistent cryptographic identities out of the box.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start group animate-fadeInUp delay-300 md:ml-48">
                <div className="text-7xl font-light text-primary/30 group-hover:text-primary transition-colors">03</div>
                <div>
                  <h3 className="text-4xl font-medium text-white mb-6">Headless API</h3>
                  <p className="text-xl md:text-2xl text-white/40 font-light leading-relaxed">
                    Consume verification logic from any client. A purely headless gateway designed for unrestricted flexibility across any frontend framework.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance & Open Source Section */}
        <section className="py-40 px-6 border-t border-white/5 bg-black">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-5xl md:text-8xl font-semibold tracking-tighter mb-12">
              <span className="text-white">Blazing Fast.</span> <br /> <span className="text-[#FF3D7F]">Open Source.</span>
            </h2>
            <p className="text-2xl text-white/40 font-light max-w-3xl mx-auto leading-relaxed mb-24">
              The entire protocol is open source and freely available. Contribute, fork, or deploy your own instance in seconds.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-40">
               <div>
                  <div className="text-7xl font-light text-white mb-4">&lt; 50ms</div>
                  <div className="text-white/30 uppercase tracking-widest text-sm font-medium">Global Latency</div>
               </div>
               <div className="w-px h-32 bg-white/10 hidden md:block" />
               <div>
                  <div className="text-7xl font-light text-white mb-4">100%</div>
                  <div className="text-white/30 uppercase tracking-widest text-sm font-medium">Open Source</div>
               </div>
            </div>

            <div className="mt-40">
               <a 
                href="https://join.zuup.dev" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-6 text-3xl text-white/40 hover:text-white transition-colors group font-light"
              >
                Join the community on Slack
                <span className="w-16 h-px bg-white/40 group-hover:bg-white group-hover:w-32 transition-all duration-500" />
              </a>
            </div>
          </div>
        </section>

        {/* Studio Section */}
        <section id="studio" className="py-32 px-6 border-t border-white/5 bg-[#020202]">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-7xl font-medium tracking-tighter mb-8 leading-[1.1]">
                <span className="text-white">Visual</span> <br/><span className="text-[#FF3D7F]">Studio</span>
              </h2>
              <p className="text-xl text-white/50 font-light tracking-wide mb-12">
                A native visual environment for designing certificates. Bind variables to CSV inputs and compile thousands of unique PDFs simultaneously.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">Dynamic Binding</h4>
                  <p className="text-white/40 font-light text-base leading-relaxed">Map textual variables effortlessly to coordinate layouts. No strict grids, absolute freedom.</p>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">Immutable Records</h4>
                  <p className="text-white/40 font-light text-base leading-relaxed">Generated documents are instantly tied to immutable records in the underlying database for immediate verification.</p>
                </div>
              </div>
            </div>

            <div className="relative aspect-square rounded-[2rem] bg-gradient-to-br from-[#1a1a1e] to-[#0a0a0c] border border-white/10 p-6 flex flex-col shadow-2xl overflow-hidden group">
               <div className="absolute inset-0 bg-primary/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
               
               {/* Inner canvas */}
               <div className="w-full flex-1 bg-white rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] relative flex flex-col p-10 overflow-hidden border border-white/5 transition-transform duration-700 group-hover:scale-[1.02]">
                  {/* Certificate Graphics */}
                  <div className="absolute top-0 left-0 w-full h-3 bg-primary" />
                  <div className="absolute bottom-0 left-0 w-full h-3 bg-primary" />
                  
                  <div className="text-center mb-10 relative z-10 mt-6">
                     <h2 className="text-3xl font-serif text-black tracking-tight mb-2">Certificate of Completion</h2>
                     <p className="text-black/40 text-[10px] tracking-widest uppercase">Awarded By Zuup</p>
                  </div>

                  <div className="flex flex-col items-center justify-center flex-1 relative z-10 w-full max-w-[280px] mx-auto">
                     <p className="text-black/40 italic mb-6 text-sm">This certifies that</p>
                     
                     {/* The Variable Box */}
                     <div className="relative group/var cursor-pointer w-full text-center">
                        <div className="absolute -inset-y-2 -inset-x-4 bg-primary/5 border border-primary/30 border-dashed rounded opacity-0 group-hover/var:opacity-100 transition-opacity" />
                        <span className="text-3xl font-medium text-black relative z-10 font-serif border-b border-black/20 pb-1 inline-block min-w-[200px]">{`{student_name}`}</span>
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1a1a1e] text-white text-[10px] font-mono px-2 py-1 rounded opacity-0 group-hover/var:opacity-100 transition-opacity shadow-xl whitespace-nowrap border border-white/10">Mapped: Column C</div>
                     </div>

                     <p className="text-black/50 mt-8 text-center text-xs leading-relaxed">
                        has successfully completed the required curriculum and demonstrated exceptional proficiency.
                     </p>
                  </div>

                  <div className="flex justify-between items-end relative z-10 w-full mt-auto pt-6 border-t border-black/5">
                     <div className="text-center">
                        <div className="text-black font-serif text-sm mb-1">{`{date}`}</div>
                        <div className="w-16 h-px bg-black/20 mx-auto mb-1" />
                        <div className="text-black/40 text-[9px] uppercase tracking-wider">Date</div>
                     </div>
                     
                     <div className="w-16 h-16 border border-black/10 rounded flex items-center justify-center bg-black/5 relative group/qr">
                        <ScanLine className="w-6 h-6 text-black/30" />
                        <div className="absolute inset-0 bg-green-500/10 rounded opacity-0 group-hover/qr:opacity-100 transition-opacity" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
