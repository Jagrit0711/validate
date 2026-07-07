import type { CanvasElement } from "@/components/MailmergeStudio";

const KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";

export async function generateCertificateDesign(
  prompt: string,
  logoUrl: string | null,
  csvColumns: string[],
): Promise<CanvasElement[]> {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  if (!KEY) throw new Error("Set VITE_GEMINI_API_KEY in .env");

  const sys = `You are a certificate designer. Canvas is 1000px wide, x/y from top-left.
Return JSON: { "elements": [{ "type": "text"|"qr"|"code"|"date"|"csv", "label": "...", "column?": "...", "x":0-900, "y":0-700, "width":100-600, "height?":100-600, "fontSize":12-72, "color":"#hex", "fontFamily":"Google Font name", "textAlign":"left"|"center"|"right" }], "reasoning":"..." }
Always include title, {Full Name} placeholder, QR code, cert code. Use colors matching the theme. CSV cols: ${csvColumns.join(", ") || "name, email"}. QR ~150x150.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: sys },
              { text: `Design: "${prompt}"${logoUrl ? "\nLogo: " + logoUrl : ""}` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) throw new Error("Gemini fail: " + (await res.text()));
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response");
  const parsed = JSON.parse(text);

  return parsed.elements.map((el: any, i: number) => ({
    id: `ai-${i}-${Math.random().toString(36).substring(7)}`,
    type: el.type === "text" ? "text" : el.type,
    label: el.label,
    column: el.column,
    x: el.x,
    y: el.y,
    width: el.type === "qr" ? el.height || 150 : el.width,
    height: el.type === "qr" ? el.height || 150 : undefined,
    fontSize: el.fontSize,
    color: el.color,
    fontFamily: el.fontFamily,
    textAlign: el.textAlign || "center",
  }));
}
