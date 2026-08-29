"use client";

export function MentorBubble({ text }: { text: string }) {
  // Parse simple markdown like "Copper" highlight — keep simple
  const parts = text.split(/(Copper|Iron|Zinc|Aluminum|Sulfur|Graphite)/g);
  return (
    <div className="relative pl-8 mt-4">
      <div className="absolute left-0 -top-6 w-16 h-16 rounded-full border-[3px] border-on-surface bg-tertiary-container flex items-center justify-center z-10 ink-shadow -rotate-3 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/stitch/detective-dog.png"
          alt="Detective dog"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="bg-surface-bright sketch-border ink-shadow p-4 relative -rotate-1">
        <div className="absolute -left-3 top-8 w-6 h-6 bg-surface-bright border-l-[3px] border-b-[3px] border-on-surface rotate-45" />
        <p
          className="font-semibold text-[20px] leading-tight"
          style={{ fontFamily: "var(--font-quicksand)" }}
        >
          &quot;
          {parts.map((p, i) =>
            ["Copper", "Iron", "Zinc", "Aluminum", "Sulfur", "Graphite"].includes(p) ? (
              <span key={i} className="text-secondary font-bold underline decoration-wavy decoration-2">
                {p}
              </span>
            ) : (
              <span key={i}>{p}</span>
            )
          )}
          &quot;
        </p>
      </div>
    </div>
  );
}
