import { useRef } from "react";
import { Sparkles, Camera, Palette, Plus } from "lucide-react";

export default function TopBar({
  provider, setProvider,
  onAddOutfit, onPickPhotos,
}: {
  provider: "openai" | "gemini";
  setProvider: (p: "openai" | "gemini") => void;
  onAddOutfit: () => void;
  onPickPhotos: (files: File[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement|null>(null);

  return (
    <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-zinc-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5 text-fuchsia-600" />
          <span>Your Personal Stylist</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-1 text-xs">
            <button className={`px-3 py-1 rounded-lg ${provider==="openai"?"bg-white shadow-sm":"hover:bg-white/60"}`} onClick={()=>setProvider("openai")}>OpenAI</button>
            <button className={`px-3 py-1 rounded-lg ${provider==="gemini"?"bg-white shadow-sm":"hover:bg-white/60"}`} onClick={()=>setProvider("gemini")}>Gemini</button>
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 text-sm hover:bg-zinc-200 transition"
                  onClick={()=>fileRef.current?.click()}>
            <Camera className="h-4 w-4" /> Use real photos
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                 onChange={(e)=> e.target.files && onPickPhotos(Array.from(e.target.files))} />

          <button className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 text-sm hover:bg-zinc-200 transition">
            <Palette className="h-4 w-4" /> Use color cards
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 text-white px-3 py-2 text-sm hover:bg-fuchsia-500 transition shadow-lg shadow-fuchsia-600/20"
                  onClick={onAddOutfit}>
            <Plus className="h-4 w-4" /> Add your outfit
          </button>
        </div>
      </div>
    </div>
  );
}
