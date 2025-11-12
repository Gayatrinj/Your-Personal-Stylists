// src/PersonalStylistUI/SavedList.tsx
import { useMemo, useState } from "react";
import { Trash2, Filter, Star } from "lucide-react";
import type { Outfit } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Link } from "react-router-dom";

export default function SavedList() {
  // ⬇️ Read/write from savedLibrary (NOT savedOutfits)
  const [saved, setSaved] = useLocalStorage<Outfit[]>("savedLibrary", []);

  //  Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyAccepted, setOnlyAccepted] = useState(false);

  function handleRemove(id: string) {
    setSaved((prev) => prev.filter((x) => x.id !== id));
  }

  // Collect categories from savedMeta.categories (or tags as fallback)
  const allCategories = useMemo(() => {
    const s = new Set<string>();
    saved.forEach((o) => {
      const cats = o.savedMeta?.categories?.length
        ? o.savedMeta.categories
        : o.tags ?? [];
      cats.forEach((c) => s.add(c));
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [saved]);

  // Apply filters
  const filtered = useMemo(
    () =>
      saved.filter((o) => {
        const cats = o.savedMeta?.categories?.length
          ? o.savedMeta.categories
          : o.tags ?? [];

        if (selectedCategory !== "all" && !cats.includes(selectedCategory)) {
          return false;
        }
        if (onlyFavorites && !o.isFavorite) return false;
        if (onlyAccepted && o.verdict !== "accepted") return false;
        return true;
      }),
    [saved, selectedCategory, onlyFavorites, onlyAccepted]
  );

  const hasFiltersActive =
    selectedCategory !== "all" || onlyFavorites || onlyAccepted;

  const stats = {
    total: saved.length,
    favorites: saved.filter((o) => o.isFavorite).length,
    accepted: saved.filter((o) => o.verdict === "accepted").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white text-zinc-900">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 py-7 sm:py-10">
        {/* Page shell */}
        <div className="rounded-[22px] bg-white/95 shadow-sm border border-zinc-200/70 p-5 sm:p-7 lg:p-8">
          {/* Header row */}
          <div className="mb-5 sm:mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Saved outfits</h1>
              <p className="mt-1 text-xs text-zinc-500">
                Browse, filter, and manage the looks you loved.
              </p>
            </div>
            <Link
              to="/app"
              className="text-sm text-zinc-600 hover:text-zinc-900 underline underline-offset-4"
            >
              ← Back to generator
            </Link>
          </div>

          {/* Stats row */}
          {saved.length > 0 && (
            <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4 text-center text-[11px] sm:text-xs">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 py-3">
                <div className="font-semibold text-zinc-900 text-sm">{stats.total}</div>
                <div className="text-zinc-500">Saved looks</div>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 py-3">
                <div className="font-semibold text-amber-800 text-sm">
                  {stats.favorites}
                </div>
                <div className="inline-flex items-center justify-center gap-1 text-amber-800">
                  <Star className="h-3 w-3" />
                  Favorites
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 py-3">
                <div className="font-semibold text-emerald-800 text-sm">
                  {stats.accepted}
                </div>
                <div className="text-emerald-800">Accepted</div>
              </div>
            </div>
          )}

          {/* Filter bar */}
          {saved.length > 0 && (
            <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-zinc-500" />
                <span className="text-xs font-medium text-zinc-700">
                  Filter saved outfits
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Category chips */}
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`px-2.5 py-1 rounded-full text-[11px] border ${
                      selectedCategory === "all"
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    All categories
                  </button>
                  {allCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCategory(c)}
                      className={`px-2.5 py-1 rounded-full text-[11px] border ${
                        selectedCategory === c
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setOnlyFavorites((v) => !v)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${
                      onlyFavorites
                        ? "bg-amber-100 border-amber-300 text-amber-800"
                        : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    <Star className="h-3 w-3" />
                    Favorites only
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlyAccepted((v) => !v)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${
                      onlyAccepted
                        ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                        : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    Accepted only
                  </button>

                    {hasFiltersActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory("all");
                          setOnlyFavorites(false);
                          setOnlyAccepted(false);
                        }}
                        className="ml-1 text-[11px] text-zinc-500 hover:text-zinc-800 underline underline-offset-2"
                      >
                        Clear
                      </button>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* List / empty states */}
          {saved.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center">
              <p className="text-sm font-medium text-zinc-700">
                No saved outfits yet.
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                When you like a look, hit “Save” (or favorite/accept on a card) and it’ll show up here.
              </p>
              <Link
                to="/app"
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800"
              >
                Go generate some looks →
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-center text-xs text-zinc-500">
              No outfits match your current filters.
            </div>
          ) : (
            <div className="mt-1 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((o) => {
                const thumb = o.imageUrls?.[0];
                const cats = o.savedMeta?.categories?.length
                  ? o.savedMeta.categories
                  : o.tags ?? [];

                return (
                  <div
                    key={o.id}
                    className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail */}
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-200 to-zinc-300 shrink-0">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>

                      {/* Text + chips */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate text-sm font-medium text-zinc-900">
                            {o.title}
                          </div>
                          {o.isFavorite && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800 border border-amber-100">
                              <Star className="h-3 w-3" />
                              Favorite
                            </span>
                          )}
                          {o.verdict === "accepted" && (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-800 border border-emerald-100">
                              Accepted
                            </span>
                          )}
                          {o.verdict === "rejected" && (
                            <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] text-rose-800 border border-rose-100">
                              Rejected
                            </span>
                          )}
                        </div>

                        {o.subtitle && (
                          <div className="mt-0.5 text-xs text-zinc-600 line-clamp-2">
                            {o.subtitle}
                          </div>
                        )}

                        {cats.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {cats.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setSelectedCategory(c)}
                                className="text-[11px] px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-700 bg-zinc-50 hover:bg-zinc-100"
                                title={`Filter by ${c}`}
                              >
                                {c}
                              </button>
                            ))}
                            <Link
                              to={`/saved?focus=${o.id}`}
                              className="ml-1 text-[11px] underline underline-offset-2 text-zinc-600 hover:text-zinc-900"
                              title="Open details"
                            >
                              Details
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        className="ml-1 rounded-md p-1 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800"
                        onClick={() => handleRemove(o.id)}
                        aria-label="remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
