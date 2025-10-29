import { Send, Filter } from "lucide-react";
import QuickSelect from "./QuickSelect";

export default function SuggestControls({
  prompt, setPrompt,
  style, setStyle, styles,
  occasion, setOccasion, occasions,
  season, setSeason, seasons,
  loading, errorMsg, onSuggest,
}: any) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={prompt}
          onChange={(e)=>setPrompt(e.target.value)}
          placeholder='e.g., "going for party, suggest some outfit"'
          className="w-full sm:flex-1 bg-transparent placeholder:text-zinc-500 focus:outline-none text-sm border-b sm:border-0 pb-2 sm:pb-0"
        />
        <button onClick={onSuggest} disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-500 transition disabled:opacity-60">
          <Send className="h-4 w-4" /> {loading ? "Thinking…" : "Send"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <QuickSelect label="Style" value={style} onChange={setStyle} options={styles}/>
        <QuickSelect label="Occasion" value={occasion} onChange={setOccasion} options={occasions}/>
        <QuickSelect label="Season" value={season} onChange={setSeason} options={seasons}/>
        <button className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs hover:bg-zinc-200">
          <Filter className="h-4 w-4" /> Advanced filters
        </button>
      </div>
      {errorMsg && <div className="mt-2 text-sm text-red-600">{errorMsg}</div>}
    </div>
  );
}
