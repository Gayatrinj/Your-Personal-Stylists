import React, { useState } from "react";
import { Plus, X } from "lucide-react";

export default function ColorPalette({
  palette, setPalette,
}:{ palette:string[]; setPalette:React.Dispatch<React.SetStateAction<string[]>>; }) {
  const [hex, setHex] = useState("#A3E635");
  const valid = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <h3 className="font-medium mb-3">Color palette</h3>
      <div className="flex items-center gap-2 mb-3">
        {palette.map((c)=>(
          <button key={c} className="group relative">
            <span className="block h-9 w-9 rounded-xl border border-zinc-200" style={{ backgroundColor: c }}/>
            <X onClick={()=>setPalette(palette.filter(p=>p!==c))}
               className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white/95 border border-zinc-200 p-0.5 opacity-0 group-hover:opacity-100" />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input type="color" value={hex} onChange={(e)=>setHex(e.target.value)}
               className="h-9 w-9 rounded-lg border border-zinc-200 p-0" title="Pick a color"/>
        <input value={hex} onChange={(e)=>setHex(e.target.value)}
               className="w-28 rounded-md border border-zinc-200 px-2 py-1 text-sm"/>
        <button disabled={!valid} onClick={()=>setPalette(prev=>prev.includes(hex)?prev:[...prev, hex])}
                className="h-9 w-9 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-50">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
