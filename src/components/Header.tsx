import { Link } from "@tanstack/react-router";

export const ZUUP_LOGO =
  "https://raw.githubusercontent.com/Jagrit0711/zuup-main/bc25cc6dafa9026827ffffa84f5d6740d86950ab/public/lovable-uploads/b44b8051-6117-4b37-999d-014c4c33dd13.png";

export function Header({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-6 z-50 w-full max-w-6xl mx-auto px-4 mb-12">
      <nav className="flex items-center justify-between px-6 py-3 rounded-full bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
             <div className="absolute inset-0 bg-primary/60 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"/>
             <img src={ZUUP_LOGO} alt="Zuup" className="h-6 w-6 object-contain relative z-10" />
          </div>
          <span className="font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors">
            Validate
          </span>
        </Link>

        {/* Center: Links (Hidden on small screens) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50 tracking-wide">
          <button onClick={() => {
             const el = document.getElementById('studio');
             if (el) window.scrollTo({top: el.offsetTop - 100, behavior: 'smooth'});
          }} className="hover:text-white transition-colors relative group">
            Studio
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
          </button>
          <button onClick={() => {
             const el = document.getElementById('features');
             if (el) window.scrollTo({top: el.offsetTop - 100, behavior: 'smooth'});
          }} className="hover:text-white transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
          </button>
        </div>

        {/* Right: CTAs */}
        <div className="flex items-center gap-2 md:gap-4 text-sm font-medium text-white/60 tracking-wide">
          {right !== undefined ? (
            right
          ) : (
            <>
              <a href="https://github.com/Jagrit0711/validate" target="_blank" rel="noreferrer" className="hover:text-white transition-all hidden sm:block p-2 rounded-full hover:bg-white/5">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <Link to="/admin" className="hover:text-white transition-all px-4 py-2 rounded-full hover:bg-white/5">Sign In</Link>
              <button 
                onClick={() => {
                  const el = document.getElementById('verify');
                  if (el) window.scrollTo({top: el.offsetTop - 100, behavior: 'smooth'});
                }}
                className="bg-white text-black hover:bg-white/80 px-5 py-2.5 rounded-full transition-all hover:scale-105 border border-white/10 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                Verify Now
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
