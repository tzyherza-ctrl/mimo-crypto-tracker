import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiMo Crypto — Market Intelligence",
  description: "Real-time crypto dashboard powered by Xiaomi MiMo V2.5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <header className="fixed top-0 w-full z-50 border-b border-[#222225] bg-[#09090b]/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-white text-black flex items-center justify-center text-xs font-bold">M</div>
              <span className="text-sm font-semibold text-white">MiMo Crypto</span>
            </a>
            <nav className="flex items-center gap-1">
              {[
                { href: "/", label: "Dashboard" },
                { href: "/portfolio", label: "Portfolio" },
                { href: "/ai", label: "AI Analyst" },
              ].map((l) => (
                <a key={l.href} href={l.href} className="px-3 py-1.5 rounded-md text-[13px] text-[#70707b] hover:text-white hover:bg-white/5 transition-colors">
                  {l.label}
                </a>
              ))}
              <div className="ml-2 pl-2 border-l border-[#222225]">
                <span className="text-[11px] text-[#52525b] font-medium">MiMo v2.5</span>
              </div>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 pt-20 pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}
