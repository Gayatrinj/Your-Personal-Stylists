import React from "react";
import { Trash2 } from "lucide-react";
import type { Outfit } from "@/types";

export default function SavedList({
  saved, setSaved,
}:{ saved:Outfit[]; setSaved:React.Dispatch<React.SetStateAction<Outfit[]>>; }) {
  return (
    <div className="space-y-3">
      {saved.map(o => (
        <div key={o.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 bg-white">
          <div className="h-10 w-10 rounded-md bg-gradient-to-br from-zinc-200 to-zinc-300" />
          <div className="flex-1">
            <div className="text-sm">{o.title}</div>
            <div className="text-xs text-zinc-600">{o.subtitle}</div>
          </div>
          <button className="rounded-md p-1 hover:bg-zinc-100" onClick={()=>setSaved(saved.filter(x=>x.id!==o.id))} aria-label="remove">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      {!saved.length && <div className="text-xs text-zinc-500">No saved outfits yet.</div>}
    </div>
  );
}
