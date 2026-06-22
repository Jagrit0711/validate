import React, { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import { Rnd } from "react-rnd";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Upload, Download, Type, QrCode, Hash, Calendar, X, Settings, Plus, Image as ImageIcon, ArrowLeft, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

type ElementType = "text" | "qr" | "code" | "date" | "csv";
type TextAlign = "left" | "center" | "right";

export type CanvasElement = {
  id: string;
  type: ElementType;
  label: string;
  column?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  textAlign: TextAlign;
};

// Default width (in canvas px) for new text elements. Gives the text a box to
// align within, so "center" / "right" have something to align against and the
// on-screen preview matches the exported PDF.
const DEFAULT_TEXT_WIDTH = 240;

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `ZUP-${s.slice(0, 4)}-${s.slice(4)}`;
}

const GOOGLE_FONTS = [
  "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Source Sans Pro", "Raleway", "PT Sans", 
  "Merriweather", "Noto Sans", "Nunito", "Poppins", "Playfair Display", "Rubik", "Work Sans", 
  "Lora", "Fira Sans", "Quicksand", "Inconsolata", "PT Serif", "Titillium Web", "Ubuntu", 
  "Libre Franklin", "Oxygen", "Dosis", "Cabin", "Anton", "Josefin Sans", "Dancing Script", 
  "Pacifico", "Exo 2", "Karla", "Signika", "Bebas Neue", "Comfortaa", "Caveat", "Righteous", 
  "Fredoka", "Lobster", "Abril Fatface", "Audiowide", "Bangers", "Bungee", "Cinzel", 
  "Cormorant Garamond", "EB Garamond", "Great Vibes", "Lilita One", "Orbitron", "Permanent Marker", 
  "Press Start 2P", "Satisfy", "Special Elite", "Inter", "Outfit", "Space Grotesk", "Syne", 
  "Clash Display", "Cabinet Grotesk"
].sort();

// Helper to fetch TTF from Google Fonts and add to jsPDF
const loadFontToPdf = async (pdf: jsPDF, fontFamily: string) => {
  try {
    const cssRes = await fetch(`https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700`, {
      headers: {
        // iOS Safari user agent forces TTF response from Google Fonts instead of WOFF2
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
      }
    });
    const css = await cssRes.text();
    const match = css.match(/url\((https:\/\/[^)]+\.ttf)\)/);
    if (match) {
      const ttfUrl = match[1];
      const ttfRes = await fetch(ttfUrl);
      const arrayBuffer = await ttfRes.arrayBuffer();
      
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);
      
      pdf.addFileToVFS(`${fontFamily}.ttf`, base64);
      pdf.addFont(`${fontFamily}.ttf`, fontFamily, "normal");
      return true;
    }
  } catch (e) {
    console.error(`Failed to load font ${fontFamily}`, e);
  }
  return false;
};

export function MailmergeStudio({ onClose }: { onClose?: () => void }) {
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  
  const [nameColumn, setNameColumn] = useState<string>("");
  const [emailColumn, setEmailColumn] = useState<string>("");
  const [issuedFor, setIssuedFor] = useState("Certificate of Completion");
  
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Inject Google Fonts CSS for the visual editor preview
  useEffect(() => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTemplateUrl(url);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          if (res.data.length > 0) {
            const cols = Object.keys(res.data[0] as object);
            setCsvColumns(cols);
            setCsvData(res.data);
            toast.success(`Loaded ${res.data.length} rows`);
            
            const lowerCols = cols.map(c => c.toLowerCase());
            const nameIdx = lowerCols.findIndex(c => c.includes("name"));
            if (nameIdx !== -1) setNameColumn(cols[nameIdx]);
            const emailIdx = lowerCols.findIndex(c => c.includes("email"));
            if (emailIdx !== -1) setEmailColumn(cols[emailIdx]);
          } else {
            toast.error("CSV is empty");
          }
        },
        error: (e) => toast.error(`CSV Error: ${e.message}`)
      });
    }
  };

  const addElement = (type: ElementType, label: string, column?: string) => {
    const newEl: CanvasElement = {
      id: Math.random().toString(36).substring(7),
      type,
      label,
      column,
      x: 100,
      y: 100,
      width: type === "qr" ? 150 : DEFAULT_TEXT_WIDTH,
      height: type === "qr" ? 150 : undefined,
      fontSize: 24,
      color: "#000000",
      fontFamily: "Inter",
      textAlign: "center",
    };
    setElements([...elements, newEl]);
    setSelectedElementId(newEl.id);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const generatePDFs = async () => {
    if (!templateUrl) return toast.error("Upload a template image first.");
    if (csvData.length === 0) return toast.error("Upload a CSV file with data.");
    if (!nameColumn || !emailColumn) return toast.error("Map the Database Name and Email columns.");

    setGenerating(true);
    try {
      const img = new Image();
      img.src = templateUrl;
      await new Promise((r) => { img.onload = r; });

      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
        unit: "px",
        format: [img.width, img.height],
      });

      // Pre-load required fonts
      const usedFonts = Array.from(new Set(elements.filter(e => e.type !== 'qr').map(e => e.fontFamily)));
      for (const font of usedFonts) {
        if (font && font !== "Helvetica" && font !== "Times") {
          toast.info(`Loading font: ${font}...`);
          await loadFontToPdf(pdf, font);
        }
      }

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      const scaleX = canvasRect ? img.width / canvasRect.width : 1;
      const scaleY = canvasRect ? img.height / canvasRect.height : 1;

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        if (i > 0) pdf.addPage([img.width, img.height], img.width > img.height ? "landscape" : "portrait");
        
        pdf.addImage(img, "JPEG", 0, 0, img.width, img.height);

        const code = genCode();
        const verifyUrl = `${window.location.origin}/v/${code}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 400 });

        const { error } = await supabase.from("validate").insert({
          code,
          name: row[nameColumn] || "Unknown",
          email: row[emailColumn] || "Unknown",
          issued_for: issuedFor,
          issued_date: new Date().toISOString().slice(0, 10),
        });

        if (error) {
          console.error("DB Error", error);
          toast.error(`Failed to save certificate for ${row[nameColumn]}`);
        }

        elements.forEach((el) => {
          const x = el.x * scaleX;
          const y = el.y * scaleY;
          
          if (el.type === "qr") {
            const w = (el.width || 100) * scaleX;
            const h = (el.height || 100) * scaleY;
            pdf.addImage(qrDataUrl, "PNG", x, y, w, h);
          } else {
            let text = "";
            if (el.type === "code") text = code;
            else if (el.type === "date") text = new Date().toLocaleDateString();
            else if (el.type === "csv" && el.column) text = row[el.column] || "";

            pdf.setTextColor(el.color);
            pdf.setFontSize(el.fontSize * scaleX);
            pdf.setFont(el.fontFamily, "normal");

            // Align the text inside the element's box so the PDF matches the
            // on-screen preview. The box spans `width` (scaled); jsPDF aligns
            // text around an anchor x, so we compute the anchor per alignment.
            const boxWidth = (el.width || DEFAULT_TEXT_WIDTH) * scaleX;
            const align: TextAlign = el.textAlign || "left";
            let anchorX = x;
            if (align === "center") anchorX = x + boxWidth / 2;
            else if (align === "right") anchorX = x + boxWidth;

            pdf.text(String(text), anchorX, y + (el.fontSize * scaleX), {
              baseline: "bottom",
              align,
              maxWidth: boxWidth,
            });
          }
        });
      }

      pdf.save("certificates.pdf");
      toast.success("Generated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during generation.");
    } finally {
      setGenerating(false);
    }
  };

  const selectedElement = elements.find(e => e.id === selectedElementId);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col w-screen h-screen overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 border-b border-border/50 bg-card/60 backdrop-blur flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" /> Exit Studio
          </Button>
          <div className="h-6 w-px bg-border/50"></div>
          <h2 className="font-bold text-lg tracking-tight">Mailmerge Studio</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground mr-4">
            {csvData.length > 0 ? `${csvData.length} records ready` : "No data loaded"}
          </div>
          <Button 
            className="shadow-lg shadow-primary/20" 
            onClick={generatePDFs} 
            disabled={!templateUrl || csvData.length === 0 || generating}
          >
            {generating ? "Generating PDFs..." : <><Download className="h-4 w-4 mr-2" /> Generate & Download</>}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Uploads & Mapping */}
        <div className="w-80 border-r border-border/50 bg-card/30 p-5 overflow-y-auto shrink-0 space-y-8">
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <ImageIcon className="h-4 w-4 text-primary" /> 1. Template
            </h3>
            <input type="file" accept="image/png, image/jpeg" className="hidden" ref={templateInputRef} onChange={handleTemplateUpload} />
            <Button variant="outline" className="w-full justify-start bg-background/50" onClick={() => templateInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" /> {templateUrl ? "Change Template" : "Upload Template"}
            </Button>
          </div>

          <div className="pt-6 border-t border-border/50">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <Type className="h-4 w-4 text-primary" /> 2. Data Source
            </h3>
            <input type="file" accept=".csv" className="hidden" ref={csvInputRef} onChange={handleCsvUpload} />
            <Button variant="outline" className="w-full justify-start mb-4 bg-background/50" onClick={() => csvInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" /> {csvData.length > 0 ? `Change CSV (${csvData.length} rows)` : "Upload CSV"}
            </Button>

            {csvColumns.length > 0 && (
              <div className="space-y-4 bg-background/40 p-4 rounded-xl border border-border/40">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Database Mapping</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">Map columns to save correctly to your database.</p>
                <div>
                  <Label className="text-xs">Name Column</Label>
                  <select 
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                    value={nameColumn} 
                    onChange={e => setNameColumn(e.target.value)}
                  >
                    <option value="">Select column...</option>
                    {csvColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Email Column</Label>
                  <select 
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                    value={emailColumn} 
                    onChange={e => setEmailColumn(e.target.value)}
                  >
                    <option value="">Select column...</option>
                    {csvColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Issued For (Reason)</Label>
                  <Input value={issuedFor} onChange={e => setIssuedFor(e.target.value)} className="h-9 mt-1 bg-background" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-auto bg-[#0a0a0c] bg-[url('https://transparenttextures.com/patterns/cubes.png')] flex items-center justify-center relative p-8">
          {templateUrl ? (
            <div 
              ref={canvasRef} 
              className="relative shadow-2xl ring-1 ring-white/10 select-none bg-white"
              style={{ width: '100%', maxWidth: '1000px', aspectRatio: 'auto' }}
              onClick={() => setSelectedElementId(null)}
            >
              <img src={templateUrl} alt="Template" className="w-full h-auto block pointer-events-none" />
              
              {elements.map((el) => (
                <Rnd
                  key={el.id}
                  position={{ x: el.x, y: el.y }}
                  size={
                    el.type === 'qr'
                      ? { width: el.width || 100, height: el.height || 100 }
                      : { width: el.width || DEFAULT_TEXT_WIDTH, height: "auto" }
                  }
                  onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                  onResizeStop={(e, dir, ref, delta, pos) => {
                    if (el.type === 'qr') {
                      updateElement(el.id, { width: parseInt(ref.style.width), height: parseInt(ref.style.height), x: pos.x, y: pos.y });
                    } else {
                      updateElement(el.id, { width: parseInt(ref.style.width), x: pos.x, y: pos.y });
                    }
                  }}
                  bounds="parent"
                  onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                  className={`absolute group cursor-move ${selectedElementId === el.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background z-20' : 'hover:ring-1 hover:ring-primary/50 z-10'}`}
                  style={{
                    color: el.color,
                    fontSize: `${el.fontSize}px`,
                    fontFamily: el.fontFamily,
                    lineHeight: 1,
                  }}
                  enableResizing={el.type === 'qr' ? true : { left: true, right: true, top: false, bottom: false, topLeft: false, topRight: false, bottomLeft: false, bottomRight: false }}
                >
                  {el.type === 'qr' ? (
                    <div className="w-full h-full bg-white/90 rounded border border-border flex items-center justify-center overflow-hidden">
                       <QrCode className="w-1/2 h-1/2 text-black/50" />
                    </div>
                  ) : (
                    <div
                      className="px-1 w-full"
                      style={{ textAlign: el.textAlign, whiteSpace: "nowrap", overflow: "visible" }}
                    >
                      {el.label}
                    </div>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                    className="absolute -top-3 -right-3 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-30"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Rnd>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-4 bg-card/50 p-12 rounded-3xl border border-border border-dashed backdrop-blur-sm">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-lg font-medium">Upload a template to begin designing</p>
              <Button onClick={() => templateInputRef.current?.click()}>Choose File</Button>
            </div>
          )}
        </div>

        {/* Right Sidebar: Elements & Properties */}
        <div className="w-80 border-l border-border/50 bg-card/30 p-5 overflow-y-auto shrink-0 space-y-8 flex flex-col">
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <Plus className="h-4 w-4 text-primary" /> 3. Add Elements
            </h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start text-xs h-9 bg-background/50 hover:bg-background" onClick={() => addElement("qr", "QR Code")} disabled={!templateUrl}>
                <QrCode className="h-4 w-4 mr-2 text-primary" /> QR Code
              </Button>
              <Button variant="secondary" className="w-full justify-start text-xs h-9 bg-background/50 hover:bg-background" onClick={() => addElement("code", "{Certificate No}")} disabled={!templateUrl}>
                <Hash className="h-4 w-4 mr-2 text-primary" /> Certificate No.
              </Button>
              <Button variant="secondary" className="w-full justify-start text-xs h-9 bg-background/50 hover:bg-background" onClick={() => addElement("date", "{Date}")} disabled={!templateUrl}>
                <Calendar className="h-4 w-4 mr-2 text-primary" /> Today's Date
              </Button>
            </div>

            {csvColumns.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">CSV Data Columns</h4>
                <div className="flex flex-col gap-2">
                  {csvColumns.map(c => (
                    <Button 
                      key={c} 
                      variant="outline" 
                      size="sm" 
                      className="justify-start h-8 text-xs bg-background/50 border-border/60" 
                      onClick={() => addElement("csv", `{${c}}`, c)}
                      disabled={!templateUrl}
                    >
                      <Type className="h-3 w-3 mr-2 text-muted-foreground" /> {c}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedElement && (
            <div className="pt-6 border-t border-border/50 mt-auto">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                <Settings className="h-4 w-4 text-primary" /> Properties
              </h3>
              <div className="space-y-4 bg-background/40 p-4 rounded-xl border border-border/40">
                <div className="text-sm font-semibold mb-2 truncate text-primary">{selectedElement.label}</div>
                
                {selectedElement.type !== 'qr' && (
                  <>
                    <div>
                      <Label className="text-xs font-medium">Font Family</Label>
                      <select 
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm mt-1"
                        value={selectedElement.fontFamily} 
                        onChange={e => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                        style={{ fontFamily: selectedElement.fontFamily }}
                      >
                        {GOOGLE_FONTS.map(f => (
                          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Font Size (px)</Label>
                      <Input 
                        type="number" 
                        value={selectedElement.fontSize} 
                        onChange={e => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                        className="h-9 mt-1 bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Alignment</Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          type="button"
                          variant={selectedElement.textAlign === "left" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 h-9 bg-background/50"
                          onClick={() => updateElement(selectedElement.id, { textAlign: "left" })}
                          aria-label="Align left"
                        >
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant={selectedElement.textAlign === "center" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 h-9 bg-background/50"
                          onClick={() => updateElement(selectedElement.id, { textAlign: "center" })}
                          aria-label="Align center"
                        >
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant={selectedElement.textAlign === "right" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 h-9 bg-background/50"
                          onClick={() => updateElement(selectedElement.id, { textAlign: "right" })}
                          aria-label="Align right"
                        >
                          <AlignRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                        Drag the left/right handles on the canvas to resize the text box. Text aligns within it.
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Text Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          type="color" 
                          value={selectedElement.color} 
                          onChange={e => updateElement(selectedElement.id, { color: e.target.value })}
                          className="h-9 w-14 p-1 cursor-pointer bg-background"
                        />
                        <Input 
                          type="text" 
                          value={selectedElement.color} 
                          onChange={e => updateElement(selectedElement.id, { color: e.target.value })}
                          className="h-9 flex-1 font-mono text-xs bg-background uppercase"
                        />
                      </div>
                    </div>
                  </>
                )}
                {selectedElement.type === 'qr' && (
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    Resize the QR code directly on the canvas using the bottom-right drag handle.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}