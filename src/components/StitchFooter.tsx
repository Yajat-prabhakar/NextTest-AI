export function StitchFooter() {
  return (
    <footer className="bg-surface-container-low w-full py-8 mt-20 border-t-4 border-on-surface border-dashed">
      <div className="flex flex-col gap-4 max-w-[1280px] mx-auto w-full px-4 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div
            className="font-semibold text-[18px] text-secondary"
            style={{ fontFamily: "var(--font-quicksand)" }}
          >
            © 2024 NextTest AI. Stay Curious, Stay Safe!
          </div>
          <nav className="flex gap-6 font-bold text-sm">
            <a href="/how-it-works" className="hover:text-primary transition-colors">
              Safety First
            </a>
            <a href="/how-it-works" className="hover:text-primary transition-colors">
              Parents Guide
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
          </nav>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed border-t border-dashed border-outline-variant pt-3" style={{ fontFamily: "var(--font-nunito)" }}>
          <span className="font-bold">Safety note:</span> Samples are safe, non-toxic, non-reactive reference elements only — no explosives or reactive substances. Experiments are physical/observational only (magnetism, density/float, mild vinegar indicator, ≤3 V conductivity). No heat, flame, or combining unknowns. Medium-tier tests require adult supervision. AI selects from a human-vetted, pre-written menu — it never invents experiments or safety instructions. Aligned with kids&apos; chemistry kit expectations (EN 71-4 style).
        </p>
      </div>
    </footer>
  );
}
