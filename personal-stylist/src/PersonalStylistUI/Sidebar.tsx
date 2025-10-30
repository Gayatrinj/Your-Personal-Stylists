// src/PersonalStylistUI/Sidebar.tsx
import { useEffect, useMemo, useState } from "react";
import type { Profile } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Save, RotateCcw, Check } from "lucide-react";

function ProfileCard({
  draft,
  setDraft,
}: {
  draft: Profile;
  setDraft: (p: Profile) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Gender */}
        <div className="space-y-1">
          <label className="text-xs text-zinc-600">Gender</label>
          <select
            className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm"
            value={draft.gender ?? ""}                  // controlled
            onChange={(e) => setDraft({ ...draft, gender: e.target.value as any })}
          >
            <option value="">Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="nonbinary">Non-binary</option>
            <option value="prefer_not_say">Prefer not to say</option>
          </select>
        </div>

        {/* Height */}
        <div className="space-y-1">
          <label className="text-xs text-zinc-600">Height (cm)</label>
          <input
            type="number"
            className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm"
            value={draft.heightCm ?? ""}                // controlled ("" when empty)
            onChange={(e) =>
              setDraft({
                ...draft,
                heightCm: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
          />
        </div>

        {/* Body type */}
        <div className="space-y-1 col-span-2">
          <label className="text-xs text-zinc-600">Body type</label>
          <select
            className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm"
            value={draft.bodyType ?? ""}                // controlled
            onChange={(e) => setDraft({ ...draft, bodyType: (e.target.value || undefined) as any })}
          >
            <option value="">Select</option>
            <option value="petite">Petite</option>
            <option value="average">Average</option>
            <option value="athletic">Athletic</option>
            <option value="curvy">Curvy</option>
            <option value="plus">Plus</option>
            <option value="slim">Slim</option>
            <option value="broad">Broad</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1 col-span-2">
          <label className="text-xs text-zinc-600">Notes</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm"
            placeholder="e.g., prefer high-waisted, avoid wool, warm palette"
            value={draft.notes ?? ""}                   // controlled
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [profile, setProfile] = useLocalStorage<Profile>("profile", {
    gender: undefined,
    heightCm: undefined,
    bodyType: undefined,
    notes: "",
  });

  const [draft, setDraft] = useState<Profile>({ ...profile });
  const [justSaved, setJustSaved] = useState(false);

  // keep draft synced if profile changes elsewhere
  useEffect(() => {
    setDraft({ ...profile }); // fresh object so React sees a change
  }, [profile]);

  const isDirty = useMemo(
    () => JSON.stringify(profile) !== JSON.stringify(draft),
    [profile, draft]
  );

  function handleSave() {
    setProfile(draft);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1200);
  }

  function handleReset() {
    setDraft({ ...profile });  // fresh copy back to last saved
    setJustSaved(false);
  }

  // If this ever sits inside a <form>, prevent submit:
  // <form onSubmit={(e) => e.preventDefault()}>

  return (
    <section className="space-y-6">
      <ProfileCard draft={draft} setDraft={setDraft} />

      <div className="flex items-center gap-2">
        <button
          type="button"                                // <-- important
          onClick={handleSave}
          disabled={!isDirty}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 text-white px-3 py-1.5 text-xs hover:bg-zinc-800 disabled:opacity-50"
          title="Save profile"
        >
          <Save className="h-4 w-4" />
          Save
        </button>

        <button
          type="button"                                // <-- important
          onClick={handleReset}
          disabled={!isDirty}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs hover:bg-zinc-50 disabled:opacity-50"
          title="Reset changes"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>

        {justSaved && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600 ml-1">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </section>
  );
}
