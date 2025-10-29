import  { useState } from "react";
import { ChevronDown } from "lucide-react";
export default function QuickSelect({ label, value, onChange, options }:{
  label:string; value:string; onChange:(v:string)=>void; options:string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={()=>setOpen(s=>!s)} className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs hover:bg-zinc-200 inline-flex items-center gap-1.5">
        <span className="text-zinc-500">{label}:</span> {value} <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg">
          {options.map((opt:string)=>(
            <button key={opt} onClick={()=>{ onChange(opt); setOpen(false); }}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 ${opt===value?"bg-zinc-100":""}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
