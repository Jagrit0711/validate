import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import QRCode from "qrcode";
import { supabase, ADMIN_EMAIL, type ValidateRow } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Copy, Download, LogOut, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MailmergeStudio } from "@/components/MailmergeStudio";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type GeneratedItem = {
  code: string;
  name: string;
  email: string;
  issued_for: string;
  issued_date: string;
  qrDataUrl: string;
  verifyUrl: string;
};

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `ZUP-${s.slice(0, 4)}-${s.slice(4)}`;
}

function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<"loading" | "yes" | "no">("loading");
  const [issuedFor, setIssuedFor] = useState("Certificate of Completion");
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<GeneratedItem[]>([]);
  const [recent, setRecent] = useState<ValidateRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [activeTab, setActiveTab] = useState("quick");
  const fileRef = useRef<HTMLInputElement>(null);

  // ... (keep useEffect and other functions exactly the same)

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user.email;
      if (!email) {
        navigate({ to: "/login" });
        return;
      }
      if (email !== ADMIN_EMAIL) {
        setAuthed("no");
        return;
      }
      setAuthed("yes");
      loadRecent();
    };
    check();
  }, [navigate]);

  const loadRecent = async () => {
    const { data } = await supabase
      .from("validate")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setRecent(data as ValidateRow[]);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const buildVerifyUrl = (code: string) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/v/${code}`;

  const generateForRows = async (rows: { name: string; email: string }[]) => {
    if (!rows.length) return;
    setBusy(true);
    const records: GeneratedItem[] = [];
    for (const r of rows) {
      const code = genCode();
      const verifyUrl = buildVerifyUrl(code);
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        margin: 1,
        width: 320,
        color: { dark: "#0f0f12", light: "#ffffff" },
      });
      records.push({
        code,
        name: r.name,
        email: r.email,
        issued_for: issuedFor,
        issued_date: issuedDate,
        qrDataUrl,
        verifyUrl,
      });
    }
    const { error } = await supabase.from("validate").insert(
      records.map((r) => ({
        code: r.code,
        name: r.name,
        email: r.email,
        issued_for: r.issued_for,
        issued_date: r.issued_date,
      })),
    );
    setBusy(false);
    if (error) {
      toast.error("Insert failed: " + error.message);
      return;
    }
    setItems((prev) => [...records, ...prev]);
    toast.success(`Generated ${records.length} certificate${records.length > 1 ? "s" : ""}`);
    loadRecent();
  };

  const handleCsv = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data
          .map((r) => {
            const lower: Record<string, string> = {};
            Object.entries(r).forEach(([k, v]) => (lower[k.trim().toLowerCase()] = String(v ?? "").trim()));
            return { name: lower.name || lower["full name"] || "", email: lower.email || "" };
          })
          .filter((r) => r.name && r.email);
        if (!rows.length) {
          toast.error("No valid rows. CSV needs 'name' and 'email' columns.");
          return;
        }
        generateForRows(rows);
      },
      error: (e) => toast.error(e.message),
    });
  };

  const addManual = () => {
    if (!manualName || !manualEmail) {
      toast.error("Name and email required");
      return;
    }
    generateForRows([{ name: manualName, email: manualEmail }]);
    setManualName("");
    setManualEmail("");
  };

  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    toast.success("Copied");
  };

  const downloadQR = (item: GeneratedItem) => {
    const a = document.createElement("a");
    a.href = item.qrDataUrl;
    a.download = `${item.code}.png`;
    a.click();
  };

  const deleteRow = async (code: string) => {
    if (!confirm(`Delete ${code}?`)) return;
    const { error } = await supabase.from("validate").delete().eq("code", code);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      loadRecent();
      setItems((p) => p.filter((i) => i.code !== code));
    }
  };

  if (authed === "loading") {
    return (
      <div className="min-h-screen">
        <Header />
        <p className="text-center text-muted-foreground py-20">Loading…</p>
      </div>
    );
  }
  if (authed === "no") {
    return (
      <div className="min-h-screen">
        <Header right={<Button variant="ghost" onClick={signOut}>Sign out</Button>} />
        <main className="max-w-md mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold">Access denied</h1>
          <p className="text-muted-foreground mt-2">
            You do not have permission to access the admin dashboard.
          </p>
          <Button className="mt-6" onClick={signOut}>Sign out</Button>
        </main>
      </div>
    );
  }

  // If studio is active, render it absolutely on top, avoiding the rest of the page layout.
  if (activeTab === "studio") {
    return <MailmergeStudio onClose={() => setActiveTab("quick")} />;
  }

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-right" />
      <Header
        right={
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-1" /> Sign out
          </Button>
        }
      />
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Issue and manage Zuup certificates.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 p-1 bg-card/60 border border-border/50">
            <TabsTrigger value="studio" className="px-6 rounded-md">Mailmerge Studio</TabsTrigger>
            <TabsTrigger value="quick" className="px-6 rounded-md">Quick Issue (No Template)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="studio" className="mt-0">
             {/* Studio is rendered fully above via the early return, but we keep the tab content for structural matching if needed */}
          </TabsContent>

          <TabsContent value="quick" className="space-y-8 mt-0">
            <section className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 space-y-4">
              <h2 className="text-lg font-semibold">Issue settings</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Issued for</Label>
                  <Input value={issuedFor} onChange={(e) => setIssuedFor(e.target.value)} />
                </div>
                <div>
                  <Label>Issued date</Label>
                  <Input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} />
                </div>
              </div>
            </section>

            <section className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" /> Upload CSV
                </h2>
                <p className="text-sm text-muted-foreground">
                  CSV with <code>name</code> and <code>email</code> columns.
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCsv(f);
                    e.target.value = "";
                  }}
                />
                <Button onClick={() => fileRef.current?.click()} disabled={busy} className="w-full">
                  {busy ? "Generating…" : "Choose CSV file"}
                </Button>
              </div>

              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" /> Add single
                </h2>
                <Input placeholder="Full name" value={manualName} onChange={(e) => setManualName(e.target.value)} />
                <Input
                  type="email"
                  placeholder="Email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                />
                <Button onClick={addManual} disabled={busy} className="w-full">
                  Generate
                </Button>
              </div>
            </section>

            {items.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Just generated ({items.length})</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {items.map((it) => (
                    <div
                      key={it.code}
                      className="rounded-2xl border border-border bg-card/60 backdrop-blur p-5 flex gap-4"
                    >
                      <img
                        src={it.qrDataUrl}
                        alt={it.code}
                        className="h-32 w-32 rounded-lg bg-white p-1"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="font-semibold truncate">{it.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{it.email}</div>
                        <div className="mt-2 flex items-center gap-1">
                          <code className="text-xs bg-background/60 px-2 py-1 rounded font-mono truncate">
                            {it.code}
                          </code>
                          <Button size="icon" variant="ghost" onClick={() => copy(it.code)} title="Copy code">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => downloadQR(it)}>
                            <Download className="h-3.5 w-3.5 mr-1" /> QR
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => copy(it.qrDataUrl)}>
                            <Copy className="h-3.5 w-3.5 mr-1" /> QR data
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => copy(it.verifyUrl)}>
                            <Copy className="h-3.5 w-3.5 mr-1" /> Link
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent certificates</h2>
                <Button variant="ghost" size="sm" onClick={loadRecent}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                </Button>
              </div>
              <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2">Code</th>
                      <th className="text-left px-4 py-2">Name</th>
                      <th className="text-left px-4 py-2">Email</th>
                      <th className="text-left px-4 py-2">Issued</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="px-4 py-2 font-mono text-xs">{r.code}</td>
                        <td className="px-4 py-2">{r.name}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.email}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.issued_date}</td>
                        <td className="px-4 py-2 text-right">
                          <Button size="icon" variant="ghost" onClick={() => deleteRow(r.code)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {recent.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No certificates yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
