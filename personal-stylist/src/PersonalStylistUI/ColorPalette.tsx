import React, { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

function normalizeHex(h: string) {
  let hex = h.trim().replace(/^#/,'');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  hex = hex.slice(0, 6);
  return `#${hex.toUpperCase()}`;
}

export default function ColorPalette({
  palette,
  setPalette,
}: {
  palette: string[];
  setPalette: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [hex, setHex] = useState("#A3E635");

  const valid = useMemo(() => /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex), [hex]);

  const handleAdd = () => {
    const norm = normalizeHex(hex);
    setPalette((prev) => (prev.some((c) => c.toUpperCase() === norm.toUpperCase()) ? prev : [...prev, norm]));
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && valid) handleAdd();
  };

  const presets = ["#000000","#FFFFFF","#A855F7","#14B8A6","#F97316"];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <h3 className="font-medium mb-3">Color palette</h3>

      {/* Current palette */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {palette.length === 0 && (
          <span className="text-xs text-zinc-500">No colors yet. Pick or type one below.</span>
        )}
        {palette.map((c) => (
          <button key={c} className="group relative" type="button" title={c}>
            <span
              className="block h-9 w-9 rounded-xl border border-zinc-200"
              style={{ backgroundColor: c }}
            />
            <X
              onClick={() => setPalette(palette.filter((p) => p !== c))}
              className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white/95 border border-zinc-200 p-0.5 opacity-0 group-hover:opacity-100 cursor-pointer"
              aria-label={`Remove ${c}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setPalette(palette.filter((p) => p !== c))}
            />
          </button>
        ))}
      </div>

      {/* Preset swatches you can click to add */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            title={`Add ${p}`}
            onClick={() => {
              const norm = normalizeHex(p);
              setPalette((prev) =>
                prev.some((c) => c.toUpperCase() === norm.toUpperCase()) ? prev : [...prev, norm]
              );
              setHex(norm);
            }}
            className="h-7 w-7 rounded-lg border border-zinc-200"
            style={{ backgroundColor: p }}
          />
        ))}
      </div>

      {/* Picker + hex input + add */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={normalizeHex(hex)}
          onChange={(e) => setHex(e.target.value)}
          className="h-9 w-9 rounded-lg border border-zinc-200 p-0"
          title="Pick a color"
        />
        <input
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="#RRGGBB"
          aria-label="Hex color"
          className="w-28 rounded-md border border-zinc-200 px-2 py-1 text-sm"
        />
        <button
          disabled={!valid}
          onClick={handleAdd}
          className="h-9 w-9 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-50"
          title="Add color"
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
