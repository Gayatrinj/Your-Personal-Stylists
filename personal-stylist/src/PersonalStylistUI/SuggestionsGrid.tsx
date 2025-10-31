\// src/PersonalStylistUI/SuggestionsGrid.tsx
import { Wand2, Loader2 } from "lucide-react";
import OutfitCard from "./OutfitCard";
import type { Outfit } from "@/types";

export default function SuggestionsGrid({
  outfits,
  loading,
  onRegenerate,
  onSave,
  onToggleFavorite,
  onVerdict,
}: {
  outfits: Outfit[];
  loading: boolean;
  onRegenerate: () => void;
  onSave: (o: Outfit) => void;
  onToggleFavorite: (id: string) => void;
  onVerdict: (id: string, v: "accepted" | "rejected") => void;
}) {
  return (
    <section className="relative">
      {/* top row */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Suggestions</h2>
        <button
          onClick={onRegenerate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 text-white px-3 py-1.5 text-xs hover:bg-zinc-800 disabled:opacity-60"
        >
          <Wand2 className="h-4 w-4" /> Regenerate
        </button>
      </div>

      {/* sticky status line */}
      <div role="status" aria-live="polite" className="sticky top-0 z-10">
        {loading && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-800">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating looks…
          </div>
        )}
      </div>

      {/* small overlay spinner */}
      {loading && (
        <div className="pointer-events-none absolute right-0 top-0 z-10">
          <div className="inline-flex items-center gap-2 rounded-md bg-white/90 border border-zinc-200 px-2 py-1 text-xs text-zinc-700">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Working…
          </div>
        </div>
      )}

      {/* Responsive grid (no CSS columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && outfits.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={`sk-${i}`}>
                <SkeletonCard />
              </div>
            ))
          : outfits.map((o) => (
              <OutfitCard
                key={o.id}
                outfit={o}
                onSave={() => onSave(o)}
                onToggleFavorite={onToggleFavorite}
                onVerdict={onVerdict}
              />
            ))}
      </div>
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-zinc-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 bg-zinc-100 rounded" />
        <div className="h-3 w-1/2 bg-zinc-100 rounded" />
        <div className="flex gap-2">
          <div className="h-5 w-12 bg-zinc-100 rounded" />
          <div className="h-5 w-10 bg-zinc-100 rounded" />
          <div className="h-5 w-16 bg-zinc-100 rounded" />
        </div>
        <div className="h-8 w-full bg-zinc-100 rounded" />
      </div>
    </div>
  );
}
