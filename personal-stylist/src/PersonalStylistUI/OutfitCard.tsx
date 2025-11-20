import { useState } from "react";
import { Heart, Star, Info, Check, X, Link as LinkIcon, AlertTriangle } from "lucide-react";
import type { Outfit } from "@/types";

type Props = {
  outfit: Outfit;
  onSave: (o: Outfit) => void;
  onToggleFavorite: (id: string) => void;
  // verdict is optional; if the parent doesn’t care, no buttons are shown
  onVerdict?: (v: "accepted" | "rejected") => void;
  showBuyLinks?: boolean;
};

export default function OutfitCard({
  outfit,
  onSave,
  onToggleFavorite,
  onVerdict,
  showBuyLinks = true,
}: Props) {
  const [openWhy, setOpenWhy] = useState(false);

  // Expand/collapse for long title/subtitle
  const [titleExpanded, setTitleExpanded] = useState(false);
  const [subtitleExpanded, setSubtitleExpanded] = useState(false);

  // Add-ons list expand
  const [itemsExpanded, setItemsExpanded] = useState(false);

  const longTitle = (outfit.title?.length ?? 0) > 32;
  const longSubtitle = (outfit.subtitle?.length ?? 0) > 80;

  const verdictLabel =
    outfit.verdict === "accepted"
      ? "Accepted"
      : outfit.verdict === "rejected"
      ? "Rejected"
      : null;

  // slice items for collapsed view
  const items = outfit.items ?? [];
  const collapsedItems = itemsExpanded ? items : items.slice(0, 4);
  const hasExtraItems = items.length > 4;

  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white overflow-hidden">
      {/* Header (no image) */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {/* TITLE with Read more / Less */}
            <div className={titleExpanded ? "font-medium" : "font-medium line-clamp-1"}>
              {outfit.title}
            </div>
            {longTitle && (
              <button
                type="button"
                onClick={() => setTitleExpanded((v) => !v)}
                className="mt-0.5 text-[11px] text-zinc-700 hover:text-zinc-900 underline underline-offset-2"
              >
                {titleExpanded ? "Show less" : "Read more"}
              </button>
            )}

            {/* SUBTITLE with Read more / Less */}
            {outfit.subtitle && (
              <div className="mt-1">
                <div
                  className={
                    subtitleExpanded
                      ? "text-xs text-zinc-600"
                      : "text-xs text-zinc-600 line-clamp-2"
                  }
                >
                  {outfit.subtitle}
                </div>
                {longSubtitle && (
                  <button
                    type="button"
                    onClick={() => setSubtitleExpanded((v) => !v)}
                    className="mt-0.5 text-[11px] text-zinc-700 hover:text-zinc-900 underline underline-offset-2"
                  >
                    {subtitleExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {verdictLabel && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] ${
                  outfit.verdict === "accepted"
                    ? "bg-emerald-600/10 text-emerald-700 border border-emerald-200"
                    : "bg-rose-600/10 text-rose-700 border border-rose-200"
                }`}
              >
                {verdictLabel}
              </span>
            )}

            {typeof outfit.score === "number" && (
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-2 py-1 text-[10px] text-emerald-700">
                {outfit.score}% match
              </div>
            )}

            <button
              className={`rounded-full bg-white/90 border border-zinc-200 p-2 transition ${
                outfit.isFavorite ? "text-pink-600" : "text-zinc-700"
              }`}
              onClick={() => onToggleFavorite(outfit.id)}
              aria-label="favorite"
              title={outfit.isFavorite ? "Unfavorite" : "Favorite"}
              type="button"
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
              type="button"
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

        {/* Items / Add-ons */}
        {!!items.length && (
          <div className="rounded-lg border border-zinc-200">
            <div className="px-3 py-2 text-xs font-medium text-zinc-700 bg-zinc-50">
              Items & accessories
            </div>

            <ul className="divide-y divide-zinc-100">
              {collapsedItems.map((it, idx) => (
                <li key={`${it.category}-${idx}`} className="flex items-start gap-3 px-3 py-2">
                  {/* tiny thumb if present */}
                  <div className="h-8 w-8 rounded-md overflow-hidden bg-zinc-200 shrink-0">
                    {it.imageUrl ? (
                      <img src={it.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] rounded-full border border-zinc-200 px-2 py-0.5 text-zinc-700 bg-white">
                        {it.category}
                      </span>
                      {it.name && (
                        <span className="text-sm font-medium text-zinc-900 truncate">
                          {it.name}
                        </span>
                      )}
                    </div>
                    {it.notes && <div className="text-xs text-zinc-600 mt-0.5">{it.notes}</div>}
                  </div>

                  {it.buyLink?.url && (
                    <a
                      href={it.buyLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-xs text-zinc-700 hover:text-zinc-900 underline underline-offset-2"
                      title={it.buyLink.label || "See similar"}
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      {it.buyLink.label || "See similar"}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            {hasExtraItems && (
              <button
                type="button"
                onClick={() => setItemsExpanded((v) => !v)}
                className="w-full text-xs py-2 text-zinc-700 hover:text-zinc-900 underline underline-offset-2"
              >
                {itemsExpanded ? "Show fewer items" : `Show all ${items.length} items`}
              </button>
            )}
          </div>
        )}

        {/* Missing (e.g., closet-only mode) */}
        {!!outfit.missing?.length && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">Missing pieces</div>
              <div className="mt-0.5">
                {outfit.missing.join(", ")}
              </div>
            </div>
          </div>
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
            type="button"
          >
            <Star className="h-4 w-4" /> Save
          </button>

          {onVerdict && (
            <>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/10 text-emerald-700 px-3 py-1.5 text-xs hover:bg-emerald-600/20"
                onClick={() => onVerdict("accepted")}
              >
                <Check className="h-4 w-4" />
                Accept
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600/10 text-rose-700 px-3 py-1.5 text-xs hover:bg-rose-600/20"
                onClick={() => onVerdict("rejected")}
              >
                <X className="h-4 w-4" />
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
