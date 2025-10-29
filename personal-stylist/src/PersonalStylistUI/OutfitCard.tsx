import { Heart, Star, Sparkles } from "lucide-react";
import type { Outfit } from "@/types";

export default function OutfitCard({ outfit, onSave }:{ outfit:Outfit; onSave:()=>void }) {
  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white overflow-hidden">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-zinc-100 to-zinc-200">
        <div className="absolute inset-0 grid grid-cols-3 gap-1 p-3 opacity-80">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-md bg-white/70 border border-zinc-200" />
          ))}
        </div>
        <button className="absolute right-3 top-3 rounded-full bg-white/90 border border-zinc-200 p-2 opacity-0 group-hover:opacity-100 transition">
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-medium">{outfit.title}</div>
            <div className="text-xs text-zinc-600">{outfit.subtitle}</div>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-2 py-1 text-[10px] text-emerald-700">
            {outfit.score}% match
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {outfit.tags.map(t => (
            <span key={t} className="rounded-md bg-zinc-100 px-2 py-1 text-[10px]">{t}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs hover:bg-zinc-200" onClick={onSave}>
            <Star className="h-4 w-4" /> Save
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs hover:bg-blue-500">
            <Sparkles className="h-4 w-4" /> Try on
          </button>
        </div>
      </div>
    </div>
  );
}
