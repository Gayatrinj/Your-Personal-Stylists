import { Send } from "lucide-react";
import { useId } from "react";

export type SourceMode = "shop_anywhere" | "prefer_closet" | "closet_only";

type Props = {
  prompt: string;
  setPrompt: (v: string) => void;

  /** source selection */
  source: SourceMode;
  setSource: (v: SourceMode) => void;

  loading: boolean;
  errorMsg: string | null;
  onSuggest: () => void;
};

export default function SuggestControls({
  prompt,
  setPrompt,
  source,
  setSource,
  loading,
  errorMsg,
  onSuggest,
}: Props) {
  const inputId = useId();

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
      {/* Input + Send */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
        <input
          id={inputId}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g., "Going to a party—suggest some outfits"'
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
        />
        <button
          type="button"
          onClick={onSuggest}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-500 transition disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {loading ? "Thinking…" : "Send"}
        </button>
      </div>

      {/* Source selector (segment buttons) */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-600">Source:</span>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-1 text-xs">
          <SegmentButton
            active={source === "shop_anywhere"}
            onClick={() => setSource("shop_anywhere")}
            label="Shop anywhere"
          />
          <SegmentButton
            active={source === "prefer_closet"}
            onClick={() => setSource("prefer_closet")}
            label="Prefer my closet"
          />
          <SegmentButton
            active={source === "closet_only"}
            onClick={() => setSource("closet_only")}
            label="Closet only"
          />
        </div>
      </div>

      {errorMsg && <div className="mt-2 text-sm text-red-600">{errorMsg}</div>}
    </div>
  );
}

function SegmentButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-lg transition ${
        active ? "bg-white shadow-sm" : "hover:bg-white/60"
      }`}
    >
      {label}
    </button>
  );
}
