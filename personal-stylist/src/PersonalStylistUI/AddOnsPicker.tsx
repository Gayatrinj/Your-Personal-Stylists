import type { AddOn } from "@/types";

const ALL: { key: AddOn; label: string }[] = [
  { key: "footwear", label: "Shoes" },
  { key: "heels", label: "Heels" },
  { key: "bag", label: "Bag" },
  { key: "jewelry", label: "Jewelry" },
  { key: "belt", label: "Belt" },
  { key: "watch", label: "Watch" },
  { key: "eyewear", label: "Eyewear" },
  { key: "headwear", label: "Hat" },
  { key: "outerwear", label: "Outerwear" },
  { key: "socks", label: "Socks" },
  { key: "scarf", label: "Scarf" },
];

export default function AddOnsPicker({
  value,
  onChange,
  forceCompleteLook,
  onToggleForce,
}: {
  value: AddOn[];
  onChange: (next: AddOn[]) => void;
  forceCompleteLook: boolean;
  onToggleForce: (v: boolean) => void;
}) {
  const toggle = (k: AddOn) => {
    const has = value.includes(k);
    onChange(has ? value.filter((x) => x !== k) : [...value, k]);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Add-ons</div>
        <label className="inline-flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={forceCompleteLook}
            onChange={(e) => onToggleForce(e.target.checked)}
          />
          Always complete the look (include shoes + 1–2 accessories)
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`rounded-full border px-3 py-1 text-xs ${
              value.includes(key)
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
