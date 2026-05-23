import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/40 py-8 mt-auto z-10 relative">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div>&copy; {new Date().getFullYear()} Zuup. All rights reserved.</div>
          <div>
            Get it for your own site, email at <a href="mailto:jagrit@zuup.dev" className="text-foreground hover:underline font-medium">jagrit@zuup.dev</a>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground justify-center">
          <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <a href="https://zuup.dev" className="hover:text-foreground transition-colors">Main Site</a>
        </div>
      </div>
    </footer>
  );
}
