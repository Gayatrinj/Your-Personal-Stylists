import { Shuffle, RotateCcw } from "lucide-react";

export type Controls = { casualFormal: number; playfulPro: number };

export default function ControlsBar({
  value,
  onChange,
  onRandomize,
}: {
  value: Controls;
  onChange: (v: Controls) => void;
  onRandomize?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Slider
          label="Casual ↔ Formal"
          value={value.casualFormal}
          onChange={(n) => onChange({ ...value, casualFormal: n })}
        />
        <Slider
          label="Playful ↔ Professional"
          value={value.playfulPro}
          onChange={(n) => onChange({ ...value, playfulPro: n })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Chip onClick={() => onChange({ ...value, casualFormal: 20 })}>More casual</Chip>
        <Chip onClick={() => onChange({ ...value, casualFormal: 50 })}>Balanced</Chip>
        <Chip onClick={() => onChange({ ...value, casualFormal: 80 })}>More formal</Chip>

        <div className="mx-2 h-5 w-px bg-zinc-200" />

        <Chip onClick={() => onChange({ ...value, playfulPro: 25 })}>Playful</Chip>
        <Chip onClick={() => onChange({ ...value, playfulPro: 50 })}>Neutral</Chip>
        <Chip onClick={() => onChange({ ...value, playfulPro: 80 })}>Professional</Chip>

        <div className="ms-auto" />

        <button
          type="button"
          onClick={onRandomize}
          className="inline-flex items-center gap-2 rounded-lg bg-fuchsia-600 text-white px-3 py-1.5 text-sm hover:bg-fuchsia-500"
        >
          <Shuffle className="h-4 w-4" /> Surprise me
        </button>

        <button
          type="button"
          onClick={() => onChange({ casualFormal: 50, playfulPro: 50 })}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-zinc-500">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function Chip({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs hover:bg-zinc-50"
    >
      {children}
    </button>
  );
}
