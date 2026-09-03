import { StitchHeader } from "@/components/StitchHeader";
import { StitchFooter } from "@/components/StitchFooter";
import Link from "next/link";

export default function CollectionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StitchHeader />
      <main className="flex-grow max-w-[1280px] mx-auto px-4 md:px-10 py-8 w-full">
        <h1 className="font-bold text-[32px] md:text-[48px] -rotate-1 text-primary" style={{ fontFamily: "var(--font-quicksand)" }}>
          My Collection
        </h1>
        <p className="text-on-surface-variant mt-2" style={{ fontFamily: "var(--font-nunito)" }}>
          Your identified elements will appear here as collectible lab cards — local-only for this prototype.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="sketch-border bg-white p-6 ink-shadow-sm opacity-60">
              <div className="h-32 bg-surface-container-high rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-outline">science</span>
              </div>
              <h3 className="font-bold mt-3" style={{ fontFamily: "var(--font-quicksand)" }}>
                Mystery Sample #{100 + i}
              </h3>
              <p className="text-sm text-on-surface-variant" style={{ fontFamily: "var(--font-nunito)" }}>
                Identify in the lab to unlock this card.
              </p>
            </div>
          ))}
        </div>
        <Link href="/lab" className="inline-block mt-8 px-6 py-3 bg-primary text-on-primary border-[3px] border-on-surface rounded-xl ink-shadow font-bold">
          Go to Lab →
        </Link>
      </main>
      <StitchFooter />
    </div>
  );
}
