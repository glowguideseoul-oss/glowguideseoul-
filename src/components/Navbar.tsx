"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import LogoMark from "./LogoMark";

const links = [
  { label: "Clinics", href: "/#clinics" },
  { label: "Events", href: "/events" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-warm/70 backdrop-blur-xl border-b border-border/70">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-jade/20 bg-jade-light text-jade-dark">
            <LogoMark className="h-5 w-5" />
          </span>
          <span className="font-serif text-lg sm:text-xl">Seoul Glow Guide</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-muted hover:text-ink transition-colors">
              {l.label}
            </Link>
          ))}
          <Link
            href="/for-clinics"
            className="text-sm bg-jade text-white rounded-full px-5 py-2 font-semibold shadow-sm hover:bg-jade-dark transition-colors"
          >
            For Clinics
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-ink" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-milk/95 border-b border-border px-4 pb-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted hover:text-ink"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/for-clinics"
            className="text-sm bg-jade text-white rounded-full px-5 py-2 text-center font-semibold"
            onClick={() => setOpen(false)}
          >
            For Clinics
          </Link>
        </div>
      )}
    </nav>
  );
}
