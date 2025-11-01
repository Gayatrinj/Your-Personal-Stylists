import { useMemo, useState } from "react";
import { STYLES, OCCASIONS, SEASONS, COLOR_PRESETS } from "../constants/onboarding";

export type OnboardingData = {
  styles: string[];
  occasions: string[];
  seasons: string[];
  colors: string[];
};

type OnboardingProps = {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
  defaultValues?: Partial<OnboardingData>;
};

// --- Small internal UI helpers ---
function Progress({ step, total }: { step: number; total: number }) {
  const pct = (step / total) * 100;
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-xs text-zinc-600 mb-1">
        <span>Step {step} of {total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 w-full rounded bg-zinc-100 overflow-hidden">
        <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Chip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "px-3 py-1.5 rounded-full text-sm border transition",
        selected
          ? "bg-zinc-900 text-white border-zinc-900"
          : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50",
      ].join(" ")}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

export function Onboarding({
  onComplete,
  onSkip,
  defaultValues,
}: OnboardingProps) {
  const TOTAL_STEPS = 3;
  const [step, setStep] = useState(1);

  const [styles, setStyles] = useState<string[]>(defaultValues?.styles ?? []);
  const [occasions, setOccasions] = useState<string[]>(defaultValues?.occasions ?? []);
  const [seasons, setSeasons] = useState<string[]>(defaultValues?.seasons ?? []);
  const [colors, setColors] = useState<string[]>(defaultValues?.colors ?? COLOR_PRESETS.slice(0, 5));
  const [colorInput, setColorInput] = useState("#");

  const canNext = useMemo(() => {
    if (step === 1) return styles.length > 0;
    if (step === 2) return occasions.length > 0;
    if (step === 3) return seasons.length > 0 || colors.length > 0;
    return true;
  }, [step, styles, occasions, seasons, colors]);

  const toggle = (list: string[], value: string, setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const addColor = () => {
    const norm = normalizeHex(colorInput);
    if (norm && !colors.includes(norm)) setColors((p) => [...p, norm]);
    setColorInput("#");
  };
  const removeColor = (c: string) => setColors((p) => p.filter((x) => x !== c));

  function normalizeHex(h: string) {
    const v = h.trim().replace(/^#/, "");
    if (![3,6].includes(v.length)) return "";
    const full = v.length === 3 ? v.split("").map(ch => ch+ch).join("") : v;
    return /^([0-9a-fA-F]{6})$/.test(full) ? `#${full.toUpperCase()}` : "";
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else handleComplete();
  };

  const handleBack = () => step > 1 && setStep(step - 1);

  const handleComplete = () => {
    onComplete({ styles, occasions, seasons, colors });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xl">
        <Progress step={step} total={TOTAL_STEPS} />

        {/* STEP BODY */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Which styles do you like?</h2>
            <p className="text-sm text-zinc-600 mb-4">Pick one or more. You can change these later.</p>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={styles.includes(s)}
                  onToggle={() => toggle(styles, s, setStyles)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">What occasions are you dressing for?</h2>
            <p className="text-sm text-zinc-600 mb-4">Select all that apply.</p>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => (
                <Chip
                  key={o}
                  label={o}
                  selected={occasions.includes(o)}
                  onToggle={() => toggle(occasions, o, setOccasions)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Seasons & colors</h2>
            <p className="text-sm text-zinc-600 mb-4">Choose the seasons you want ideas for and your preferred palette.</p>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Seasons</h3>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    selected={seasons.includes(s)}
                    onToggle={() => toggle(seasons, s, setSeasons)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Palette</h3>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggle(colors, c, setColors)}
                    className={[
                      "h-8 w-8 rounded-md border",
                      colors.includes(c) ? "ring-2 ring-blue-500 border-blue-500" : "border-zinc-200",
                    ].join(" ")}
                    title={c}
                    style={{ backgroundColor: c }}
                    aria-pressed={colors.includes(c)}
                  />
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="color"
                  value={normalizeHex(colorInput) || "#000000"}
                  onChange={(e) => setColorInput(e.target.value)}
                  className="h-9 w-9 rounded border border-zinc-200"
                  title="Pick a color"
                />
                <input
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="#RRGGBB"
                  className="w-28 rounded-md border border-zinc-200 px-2 py-1 text-sm"
                />
                <button
                  onClick={addColor}
                  className="rounded-md border border-zinc-200 px-3 py-1 text-sm hover:bg-zinc-50"
                >
                  Add
                </button>
              </div>

              {!!colors.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => removeColor(c)}
                      className="group relative"
                      title={`Remove ${c}`}
                    >
                      <span
                        className="block h-8 w-8 rounded-md border border-zinc-200"
                        style={{ backgroundColor: c }}
                      />
                      <span className="absolute -top-1 -right-1 hidden h-4 w-4 place-items-center rounded-full bg-white border border-zinc-200 text-[10px] group-hover:grid">×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={handleBack}
                className="rounded-md border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSkip}
              className="text-zinc-600 hover:text-zinc-900 text-sm"
            >
              Skip for now
            </button>
            <button
              onClick={handleNext}
              disabled={!canNext}
              className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-500 disabled:opacity-50"
            >
              {step === TOTAL_STEPS ? "Complete" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
