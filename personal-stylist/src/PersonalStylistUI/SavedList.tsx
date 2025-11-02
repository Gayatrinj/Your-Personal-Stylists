import { Trash2 } from "lucide-react";
import type { Outfit } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Link } from "react-router-dom";
import { slugify } from "@/utils/slug";

export default function SavedList() {
  const [saved, setSaved] = useLocalStorage<Outfit[]>("savedOutfits", []);

  function handleRemove(id: string) {
    setSaved(prev => prev.filter(x => x.id !== id));
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Saved outfits</h1>
          <Link
            to="/app"
            className="text-sm text-zinc-600 hover:text-zinc-900 underline underline-offset-4"
          >
            ← Back to generator
          </Link>
        </div>

        <div className="space-y-3">
          {saved.map((o) => {
            const thumb = o.imageUrls?.[0];
            const cats = o.savedMeta?.categories ?? [];
            return (
              <div
                key={o.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 bg-white"
              >
                <div className="h-10 w-10 rounded-md overflow-hidden bg-gradient-to-br from-zinc-200 to-zinc-300 shrink-0">
                  {thumb ? (
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{o.title}</div>
                  {o.subtitle ? (
                    <div className="text-xs text-zinc-600 truncate">{o.subtitle}</div>
                  ) : null}

                  {cats.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
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
                        className="ml-1 text-[11px] underline underline-offset-2 text-zinc-600 hover:text-zinc-900"
                        title="Open in saved"
                      >
                        Open
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  className="rounded-md p-1 hover:bg-zinc-100"
                  onClick={() => handleRemove(o.id)}
                  aria-label="remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          {!saved.length && (
            <div className="text-xs text-zinc-500">No saved outfits yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
