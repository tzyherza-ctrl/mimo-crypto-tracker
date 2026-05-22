import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiMo Crypto — AI-Powered Market Intelligence",
  description: "Real-time cryptocurrency dashboard with Xiaomi MiMo AI analysis. Track 17,000+ assets.",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔮</text></svg>" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <div className="ambient-bg" />
        <nav className="fixed top-0 w-full z-50" style={{ background: "rgba(5, 5, 16, 0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">M</div>
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 opacity-0 group-hover:opacity-20 blur transition-opacity" />
              </div>
              <div>
                <span className="text-[15px] font-bold tracking-tight" style={{ background: "linear-gradient(135deg, #ff6b2b, #ffb800)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MiMo Crypto</span>
                <div className="text-[10px] text-gray-500 -mt-0.5 tracking-widest uppercase">Market Intelligence</div>
              </div>
            </a>
            <div className="flex items-center gap-1">
              {[
                { href: "/", label: "Dashboard" },
                { href: "/portfolio", label: "Portfolio" },
                { href: "/ai", label: "AI Analyst" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  {link.label}
                </a>
              ))}
              <div className="ml-3 pl-3 border-l border-white/5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: "rgba(255, 107, 43, 0.1)", color: "#ff6b2b", border: "1px solid rgba(255, 107, 43, 0.2)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 pulse-dot" />
                  MiMo v2.5
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-[1400px] mx-auto px-6 pt-24 pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}
