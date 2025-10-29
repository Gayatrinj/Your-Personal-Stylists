// SuggestionsGrid.tsx

import { Wand2 } from "lucide-react";
import OutfitCard from "./OutfitCard";
import type { Outfit } from "@/types";

export default function SuggestionsGrid({
  outfits, loading, onRegenerate, onSave,
}:{
  outfits: Outfit[]; loading:boolean;
  onRegenerate: ()=>void; onSave:(o:Outfit)=>void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Suggestions</h2>
        <button onClick={onRegenerate} disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs hover:bg-zinc-200 disabled:opacity-60">
          <Wand2 className="h-4 w-4" /> Regenerate
        </button>
      </div>
      {loading && <div className="text-sm text-zinc-600">Generating looks…</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {outfits.map(o => <OutfitCard key={o.id} outfit={o} onSave={()=>onSave(o)} />)}
      </div>
    </>
  );
}
