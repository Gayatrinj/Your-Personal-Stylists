import { useState } from "react";
import { Heart, Star, Info } from "lucide-react";
import type { Outfit } from "@/types";

export default function OutfitCard({
  outfit,
  onSave,
  onToggleFavorite,
  showBuyLinks = true, // NEW: allow hiding links (e.g., closet_only)
}: {
  outfit: Outfit;
  onSave: (o: Outfit) => void;
  onToggleFavorite: (id: string) => void;
  onVerdict?: (id: string, v: "accepted" | "rejected") => void;
  showBuyLinks?: boolean;
}) {
  const [openWhy, setOpenWhy] = useState(false);

  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white overflow-hidden">
      {/* Header (no image) */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-medium truncate">{outfit.title}</div>
            <div className="text-xs text-zinc-600 line-clamp-2">{outfit.subtitle}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-2 py-1 text-[10px] text-emerald-700">
              {outfit.score}% match
            </div>
            <button
              className={`rounded-full bg-white/90 border border-zinc-200 p-2 transition ${
                outfit.isFavorite ? "text-pink-600" : "text-zinc-700"
              }`}
              onClick={() => onToggleFavorite(outfit.id)}
              aria-label="favorite"
              title={outfit.isFavorite ? "Unfavorite" : "Favorite"}
            >
              <Heart className="h-4 w-4" fill={outfit.isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Tags + confidence */}
        <div className="flex flex-wrap items-center gap-2">
          {outfit.tags.map((t) => (
            <span key={t} className="rounded-md bg-zinc-100 px-2 py-1 text-[10px]">
              {t}
            </span>
          ))}
          {typeof outfit.confidence === "number" && (
            <span className="ml-auto text-[10px] text-zinc-500">
              conf {Math.round(outfit.confidence * 100)}%
            </span>
          )}
        </div>

        {/* Why this? */}
        {(outfit.explanation || (outfit.highlights && outfit.highlights.length)) && (
          <>
            <button
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
              onClick={() => setOpenWhy((s) => !s)}
            >
              <Info className="h-4 w-4" />
              Why this?
            </button>
            {openWhy && (
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm">
                {outfit.explanation && <p className="text-zinc-700">{outfit.explanation}</p>}
                {!!outfit.highlights?.length && (
                  <ul className="mt-2 list-disc pl-5 text-zinc-700">
                    {outfit.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}

        {/* Buy links (hidden when showBuyLinks=false) */}
        {showBuyLinks && !!outfit.buyLinks?.length && (
          <div className="grid gap-2">
            {outfit.buyLinks.map((b) => (
              <a
                key={b.url}
                href={b.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50"
              >
                <span>
                  {b.label}
                  {b.retailer ? ` · ${b.retailer}` : ""}
                </span>
                <span className="text-zinc-600">{b.price ?? "View"}</span>
              </a>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs hover:bg-zinc-200"
            onClick={() => onSave(outfit)}
          >
            <Star className="h-4 w-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
