import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, type ValidateRow } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldX, Loader2, ArrowLeft, Copy, Download, Share2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast, Toaster } from "sonner";
import jsPDF from "jspdf";

export const Route = createFileRoute("/v/$code")({
  component: VerifyPage,
});

function VerifyPage() {
  const { code } = Route.useParams();
  const [state, setState] = useState<"loading" | "ok" | "missing" | "error">("loading");
  const [row, setRow] = useState<ValidateRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("validate")
        .select("*")
        .eq("code", code)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error(error);
        setState("error");
        return;
      }
      if (!data) {
        setState("missing");
        return;
      }
      setRow(data as ValidateRow);
      setState("ok");
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const verifyUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      toast.success("Verification link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Zuup Certificate — Verified",
          text: row ? `${row.name}'s certificate for "${row.issued_for}" is verified authentic.` : "Verified Zuup certificate",
          url: verifyUrl,
        });
      } catch {
        // user cancelled the share sheet, nothing to do
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadPdf = () => {
    if (!row) return;
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a5" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      let y = 60;

      pdf.setFontSize(18);
      pdf.text("Zuup Certificate — Verified", pageWidth / 2, y, { align: "center" });

      y += 40;
      pdf.setFontSize(11);
      const rows: [string, string][] = [
        ["Issued to", row.name],
        ["Email", row.email],
        ["Issued for", row.issued_for],
        [
          "Issued date",
          new Date(row.issued_date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        ],
        ["Certificate code", row.code],
      ];
      for (const [label, value] of rows) {
        pdf.setFont("helvetica", "bold");
        pdf.text(`${label}:`, 40, y);
        pdf.setFont("helvetica", "normal");
        pdf.text(value, 160, y);
        y += 24;
      }

      y += 16;
      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text("Verified against Zuup's official record.", 40, y);
      pdf.text(verifyUrl, 40, y + 14);

      pdf.save(`zuup-certificate-${row.code}.pdf`);
      toast.success("Certificate PDF downloaded");
    } catch {
      toast.error("Couldn't generate the PDF");
    }
  };

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-right" />
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Verify another
        </Link>

        {state === "loading" && (
          <div className="rounded-2xl border border-border bg-card/60 p-10 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="mt-3 text-muted-foreground">Verifying certificate…</p>
          </div>
        )}

        {state === "missing" && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-10 text-center">
            <ShieldX className="h-10 w-10 mx-auto text-destructive" />
            <h2 className="mt-3 text-2xl font-bold">Not Found</h2>
            <p className="mt-1 text-muted-foreground">
              No certificate matches code{" "}
              <code className="px-1.5 py-0.5 rounded bg-background/60">{code}</code>.
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-10 text-center">
            <ShieldX className="h-10 w-10 mx-auto text-destructive" />
            <h2 className="mt-3 text-2xl font-bold">Verification error</h2>
            <p className="mt-1 text-muted-foreground">Please try again later.</p>
          </div>
        )}

        {state === "ok" && row && (
          <div className="rounded-2xl border border-primary/30 bg-card/70 backdrop-blur shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-foreground/0 p-5 flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary-foreground" />
              <div>
                <div className="text-primary-foreground/90 text-xs uppercase tracking-wider">
                  Digitally Validated
                </div>
                <div className="text-primary-foreground font-bold text-lg">
                  Authentic Certificate
                </div>
              </div>
            </div>
            <dl className="divide-y divide-border">
              <Row label="Issued to" value={row.name} />
              <Row label="Email" value={row.email} />
              <Row label="Issued for" value={row.issued_for} />
              <Row
                label="Issued date"
                value={new Date(row.issued_date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
              <Row label="Certificate code" value={row.code} mono />
            </dl>
            <div className="p-5 bg-muted/30 text-xs text-muted-foreground">
              This certificate is verified against Zuup's official record.
            </div>
            <div className="flex flex-wrap gap-2 p-5 border-t border-border">
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-1.5" /> Copy Link
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1.5" /> Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                <Download className="h-4 w-4 mr-1.5" /> Download PDF
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-5 py-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
