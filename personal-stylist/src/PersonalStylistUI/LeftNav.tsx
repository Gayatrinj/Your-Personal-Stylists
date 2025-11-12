// src/PersonalStylistUI/LeftNav.tsx
import { X, LogOut, FolderOpen } from "lucide-react";
import type { ClosetItem, Outfit } from "@/types";
import { Link, NavLink } from "react-router-dom";
import { slugify } from "@/utils/slug";
import type { User as FirebaseUser } from "firebase/auth";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type LeftNavProps = {
  open: boolean;
  onClose: () => void;

  closet: ClosetItem[];
  setCloset: (fn: (prev: ClosetItem[]) => ClosetItem[]) => void;

  // Sidebar “Saved outfits” (EXPLICIT saves from Save button)
  saved: Outfit[];
  setSaved: (fn: (prev: Outfit[]) => Outfit[]) => void;

  currentUser?: FirebaseUser | null;
  onSignOut?: () => void | Promise<void>;
};

export default function LeftNav({
  open,
  onClose,
  closet,
  setCloset,
  saved,
  setSaved,
  currentUser,
  onSignOut,
}: LeftNavProps) {
  // Saved Library (ALL saved items shown on /saved — favorites/accepted/etc.)
  const [savedLibrary] = useLocalStorage<Outfit[]>("savedLibrary", []);

  const displayName =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "You";

  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
          <div className="p-3 space-y-8">
            {/* ——— Primary Nav / Saved library (ALWAYS visible) ——— */}
            <section>
              <NavLink
                to="/saved"
                className={({ isActive }) =>
                  [
                    "flex items-center justify-between rounded-lg px-3 py-2 border",
                    isActive
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50",
                  ].join(" ")
                }
                onClick={onClose}
              >
                <span className="inline-flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Saved library
                </span>
                <span
                  className={[
                    "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] px-1.5",
                    savedLibrary.length > 0
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600",
                  ].join(" ")}
                >
                  {savedLibrary.length}
                </span>
              </NavLink>
            </section>

            {/* ——— Closet ——— */}
            <section>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-zinc-800">
                  Your closet
                </h3>
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

            {/* ——— Sidebar “Saved outfits” (EXPLICIT saves only) ——— */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-800">
                  Saved outfits
                </h3>
                {/* Show "View all" when there are explicit saves */}
                {saved.length > 0 && (
                  <Link
                    to="/saved"
                    className="text-xs text-zinc-600 hover:text-zinc-900 underline underline-offset-4"
                    onClick={onClose}
                  >
                    View all →
                  </Link>
                )}
              </div>

              {saved.length === 0 ? (
                <div className="text-xs text-zinc-500 rounded-lg border border-dashed border-zinc-200 p-3">
                  Nothing saved from this session.
                  <div className="mt-1">
                    <Link
                      to="/saved"
                      onClick={onClose}
                      className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
                    >
                      Open Saved library →
                    </Link>
                  </div>
                </div>
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
                                  onClick={onClose}
                                >
                                  {c}
                                </Link>
                              ))}
                              <Link
                                to={`/saved?focus=${o.id}`}
                                className="text-[11px] ml-1 underline underline-offset-2 text-zinc-600 hover:text-zinc-900"
                                title="Open in saved"
                                onClick={onClose}
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

        {/* Footer: user + sign out */}
        {currentUser && (
          <div className="border-t border-zinc-200 p-3 bg-white">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-zinc-200 grid place-items-center text-xs font-semibold text-zinc-800">
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-zinc-800">
                  {displayName}
                </div>
                {currentUser.email && (
                  <div className="truncate text-[11px] text-zinc-500">
                    {currentUser.email}
                  </div>
                )}
              </div>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
