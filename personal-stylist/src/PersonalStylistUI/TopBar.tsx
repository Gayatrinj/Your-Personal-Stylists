import { useRef } from "react";
import { Sparkles } from "lucide-react";

export default function TopBar({
  provider,
  setProvider,
  onPickPhotos,
}: {
  provider: "openai" | "gemini";
  setProvider: (p: "openai" | "gemini") => void;
  onPickPhotos: (files: File[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    // Full-bleed, sticky at the very top
    <div className="sticky top-0 left-0 right-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      {/* NOTE: No lg:pl-[280px] so the bar visually covers the sidebar area too */}
      <div className="w-full">
        {/* Left = brand, Right = controls */}
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Left: Brand (now aligned left) */}
          <div className="flex items-center gap-2 font-semibold">
            <div className="inline-grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-600 to-violet-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="tracking-tight">StyleAI</span>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-1 text-xs">
              <button
                className={`px-3 py-1 rounded-lg transition ${
                  provider === "gemini" ? "bg-white shadow-sm" : "hover:bg-white/60"
                }`}
                onClick={() => setProvider("gemini")}
              >
                Gemini
              </button>
            </div>

           
           
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) =>
                e.target.files && onPickPhotos(Array.from(e.target.files))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
