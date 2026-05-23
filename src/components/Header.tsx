import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export const ZUUP_LOGO =
  "https://raw.githubusercontent.com/Jagrit0711/zuup-main/bc25cc6dafa9026827ffffa84f5d6740d86950ab/public/lovable-uploads/b44b8051-6117-4b37-999d-014c4c33dd13.png";

export function Header({ right }: { right?: React.ReactNode }) {
  return (
    <header className="border-b border-border/60 backdrop-blur-md bg-background/60 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={ZUUP_LOGO} alt="Zuup" className="h-8 w-8 object-contain" />
          <span className="font-bold text-lg hidden sm:inline-block">
            Zuup <span className="text-primary font-normal">Validate</span>
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link to="/features" className="hover:text-foreground transition-colors hidden md:block">Features</Link>
          {right !== undefined ? (
            right
          ) : (
            <>
              <Link to="/admin" className="hover:text-foreground transition-colors">Sign In</Link>
              <Button asChild className="rounded-full bg-primary hover:bg-primary/90 text-white border-0 shadow-lg shadow-primary/20">
                <Link to="/">Get Started &rarr;</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
