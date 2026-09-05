"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home", active: ["/"] },
  { href: "/lab", label: "Lab", active: ["/lab"] },
  { href: "/collection", label: "My Collection", active: ["/collection"] },
  { href: "/help", label: "Help", active: ["/help"] },
];

export function StitchHeader() {
  const pathname = usePathname();
  return (
    <header className="bg-surface border-b-4 border-on-surface shadow-[4px_4px_0px_0px_#6b38d4] sticky top-0 z-50">
      <div className="flex justify-between items-center w-full max-w-[1280px] mx-auto px-4 md:px-10 py-3">
        <Link
          href="/"
          className="font-bold text-[28px] md:text-[32px] tracking-tight text-primary -rotate-1"
          style={{ fontFamily: "var(--font-quicksand)" }}
        >
          NextTest AI
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          {nav.map((n) => {
            const isActive = n.active
              ? n.active.some((p) => pathname === p || pathname?.startsWith(p))
              : pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`font-semibold text-[18px] transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5 ${
                  isActive
                    ? "text-primary border-b-2 border-primary underline-offset-4"
                    : "text-on-surface-variant hover:text-primary"
                }`}
                style={{ fontFamily: "var(--font-quicksand)" }}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/lab"
          className="hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform text-on-surface-variant hover:text-primary"
          aria-label="Lab"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
            account_circle
          </span>
        </Link>
      </div>
    </header>
  );
}
