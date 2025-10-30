import React, { useMemo, useState } from "react";
import { X, Plus } from "lucide-react";
import type { ClosetItem, Outfit } from "@/types";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";
import { slugify } from "@/utils/slug";

type LeftNavProps = {
  open: boolean;
  onClose: () => void;
  palette: string[];
  setPalette: React.Dispatch<React.SetStateAction<string[]>>;
  closet: ClosetItem[];
  setCloset: (fn: (prev: ClosetItem[]) => ClosetItem[]) => void;
  saved: Outfit[];
  setSaved: (fn: (prev: Outfit[]) => Outfit[]) => void;
};

export default function LeftNav({
  open,
  onClose,
  palette,
  setPalette,
  closet,
  setCloset,
  saved,
  setSaved,
}: LeftNavProps) {
  const [showProfile] = useState(true);

  // ---------- Color palette helpers ----------
  const [hex, setHex] = useState("#A3E635");
  const valid = useMemo(
    () => /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex),
    [hex]
  );

  const normalizeHex = (h: string) => {
    let v = h.trim().replace(/^#/, "");
    if (v.length === 3) v = v.split("").map((c) => c + c).join("");
    v = v.slice(0, 6).toUpperCase();
    return `#${v}`;
  };

  const addHex = (h: string) => {
    const norm = normalizeHex(h);
    setPalette((prev) =>
      prev.some((c) => c.toUpperCase() === norm.toUpperCase())
        ? prev
        : [...prev, norm]
    );
    setHex(norm);
  };

  const removeHex = (c: string) => {
    setPalette((prev) => prev.filter((x) => x !== c));
  };

  const onAddClick = () => {
    if (valid) addHex(hex);
  };

  const onHexKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if ((e.key === "Enter" || e.key === " ") && valid) onAddClick();
  };

  const presets = [
    "#000000",
    "#FFFFFF",
    "#EAB308",

    "#14B8A6",
    "#F97316",
  ];

  // Sidebar sits below the 56px TopBar
  return (
    <>
      {/* Mobile overlay (below the top bar) */}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-14 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        role="complementary"
        aria-label="Left navigation"
        className={[
          "fixed z-50 left-0 top-14",
          "h-[calc(100dvh-56px)] lg:h-[calc(100dvh-56px)]",
          "w-[86%] max-w-[320px] lg:w-[280px]",
          "bg-white border-r border-zinc-200 shadow-lg lg:shadow-none",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "flex flex-col",
        ].join(" ")}
      >
        {/* Header (mobile only) */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-200 bg-white/80 backdrop-blur">
          <div className="font-semibold text-zinc-800">Menu</div>
          <button
            className="p-2 rounded-md hover:bg-zinc-100"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile */}
          {showProfile && (
            <div className="border-b border-zinc-200 p-3">
              <Sidebar />
            </div>
          )}

          {/* Sections */}
          <div className="p-3 space-y-8">
            {/* 🎨 Color Palette */}
            <section>
              <h3 className="text-sm font-semibold text-zinc-800 mb-2">
                Color palette
              </h3>

              {/* current palette */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {palette.length === 0 && (
                  <span className="text-xs text-zinc-500">
                    No colors yet. Pick or type one below.
                  </span>
                )}
                {palette.map((c) => (
                  <button key={c} className="group relative" type="button" title={c}>
                    <span
                      className="block h-8 w-8 rounded-lg border border-zinc-200 shadow-sm"
                      style={{ backgroundColor: c }}
                    />
                    <span
                      onClick={() => removeHex(c)}
                      className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white/95 border border-zinc-200 p-0.5 opacity-0 group-hover:opacity-100 text-[10px] leading-3 grid place-items-center cursor-pointer hover:bg-fuchsia-100 hover:text-fuchsia-700"
                      aria-label={`remove ${c}`}
                    >
                      ×
                    </span>
                  </button>
                ))}
              </div>

              {/* preset swatches */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    title={`Add ${p}`}
                    onClick={() => addHex(p)}
                    className="h-7 w-7 rounded-md border border-zinc-200"
                    style={{ backgroundColor: p }}
                  />
                ))}
              </div>

              {/* color input + hex input + add */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={normalizeHex(hex)}
                  onChange={(e) => setHex(e.target.value)}
                  className="h-9 w-9 rounded-lg border border-zinc-200 p-0"
                  title="Pick a color"
                />
                <input
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  onKeyDown={onHexKeyDown}
                  placeholder="#RRGGBB"
                  aria-label="Hex color"
                  className="w-28 rounded-md border border-zinc-200 px-2 py-1 text-sm"
                />
                <button
                  disabled={!valid}
                  onClick={onAddClick}
                  className="h-9 w-9 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-50"
                  title="Add color"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </section>

            {/* 👗 Closet */}
            <section>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-zinc-800">Your closet</h3>
                {closet.length > 0 && (
                  <button
                    className="text-xs text-zinc-500 hover:text-fuchsia-600 transition"
                    onClick={() => setCloset(() => [])}
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="mt-2 space-y-2">
                {closet.length === 0 ? (
                  <div className="text-xs text-zinc-500">
                    No items yet. Upload from the main area.
                  </div>
                ) : (
                  closet.map((i) => (
                    <div
                      key={i.id}
                      className="flex items-center gap-3 rounded-lg border border-zinc-200 p-2 bg-zinc-50 hover:bg-white shadow-sm transition"
                    >
                      <div className="h-9 w-9 rounded-md bg-zinc-200 overflow-hidden">
                        {i.image ? (
                          <img
                            src={i.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-zinc-800">
                          {i.name}
                        </div>
                        <div className="text-xs text-zinc-500">{i.type}</div>
                      </div>
                      <button
                        className="p-1 rounded-md hover:bg-zinc-100"
                        onClick={() =>
                          setCloset((prev) => prev.filter((x) => x.id !== i.id))
                        }
                        aria-label="remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* ❤️ Saved */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-800">Saved outfits</h3>
                {saved.length > 0 && (
                  <Link
                    to="/saved"
                    className="text-xs text-zinc-600 hover:text-zinc-900 underline underline-offset-4"
                  >
                    View all →
                  </Link>
                )}
              </div>

              {saved.length === 0 ? (
                <div className="text-xs text-zinc-500">No saved outfits yet.</div>
              ) : (
                <div className="space-y-2">
                  {saved.map((o) => {
                    const cats = o.savedMeta?.categories ?? [];
                    return (
                      <div
                        key={o.id}
                        className="flex items-center gap-3 rounded-lg border border-zinc-200 p-2 bg-zinc-50 hover:bg-white shadow-sm transition"
                      >
                        <div className="h-9 w-9 rounded-md overflow-hidden bg-zinc-200">
                          {o.imageUrls?.[0] ? (
                            <img
                              src={o.imageUrls[0]}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate text-zinc-800">
                            {o.title}
                          </div>

                          {/* clickable category chips */}
                          {cats.length > 0 ? (
                            <div className="mt-0.5 flex flex-wrap gap-1">
                              {cats.map((c) => (
                                <Link
                                  key={c}
                                  to={`/saved?cat=${slugify(c)}&focus=${o.id}`}
                                  className="text-[11px] px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                  title={`View ${c}`}
                                >
                                  {c}
                                </Link>
                              ))}
                              <Link
                                to={`/saved?focus=${o.id}`}
                                className="text-[11px] ml-1 underline underline-offset-2 text-zinc-600 hover:text-zinc-900"
                                title="Open in saved"
                              >
                                Open
                              </Link>
                            </div>
                          ) : null}
                        </div>
                        <button
                          className="p-1 rounded-md hover:bg-zinc-100"
                          onClick={() =>
                            setSaved((prev) => prev.filter((x) => x.id !== o.id))
                          }
                          aria-label="remove saved"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </aside>
    </>
  );
}
