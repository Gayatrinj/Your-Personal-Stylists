import React from "react";
import { Trash2 } from "lucide-react";
import type { ClosetItem } from "@/types";

export default function Closet({
  items, setItems,
}:{ items:ClosetItem[]; setItems:React.Dispatch<React.SetStateAction<ClosetItem[]>>; }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Items</h3>
        <button className="text-xs text-zinc-700 hover:text-zinc-900" onClick={()=>setItems([])}>Clear all</button>
      </div>
      <div className="space-y-2">
        {items.map(i => (
          <div key={i.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 bg-white">
            {i.image ? <img src={i.image} alt={i.name} className="h-10 w-10 rounded-md object-cover"/> :
              <div className="h-10 w-10 rounded-md bg-gradient-to-br from-zinc-200 to-zinc-300" />}
            <div className="flex-1">
              <div className="text-sm">{i.name}</div>
              <div className="text-xs text-zinc-600">{i.type}</div>
            </div>
            <button className="rounded-md p-1 hover:bg-zinc-100" onClick={()=>setItems(items.filter(x=>x.id!==i.id))} aria-label="remove">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {!items.length && <div className="text-xs text-zinc-500">No items yet. Upload photos or add manually.</div>}
      </div>
      <button className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 text-sm hover:bg-zinc-100"
              onClick={()=>setItems(prev=>[{ id: crypto.randomUUID(), name:"New item", type:"Custom" }, ...prev])}>
        + Add manual item
      </button>
    </div>
  );
}
