import { useEffect, useMemo, useState } from "react";
import TopBar from "./TopBar";
import SuggestControls from "./SuggestControls";
import UploadArea from "./UploadArea";
import OutfitCard from "./OutfitCard";
import LeftNav from "./LeftNav";
import ControlsBar from "./ControlsBar";
import AddOnsPicker from "./AddOnsPicker";
import type { Outfit, ClosetItem, Profile, SourceMode, AddOn } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { suggestWithGemini } from "@/api/suggest";
import { Menu, Loader2, LogIn } from "lucide-react";

//  Auth + Onboarding
import { useAuth } from "@/auth/AuthContext";
import { Onboarding } from "@/onboarding/Onboarding";
import type { OnboardingData } from "@/onboarding/Onboarding";

type Controls = { casualFormal: number; playfulPro: number };

// localStorage keys scoped per user
const doneKey = (uid?: string) => (uid ? `onboarding_done_${uid}` : "");
const dataKey = (uid?: string) => (uid ? `onboarding_data_${uid}` : "");

// Treat these as “accessory/add-on” categories we want to hide unless requested
const ADD_ON_CATEGORIES = new Set([
  "footwear",
  "heels",
  "bag",
  "jewelry",
  "belt",
  "watch",
  "eyewear",
  "headwear",
  "socks",
  "scarf",
  "outerwear",
]);

// 🔍 Infer gender directly from the user prompt text
function inferGenderFromPrompt(text: string | undefined): Profile["gender"] | undefined {
  if (!text) return undefined;
  const p = text.toLowerCase();

  if (p.includes(" nonbinary") || p.includes(" non-binary") || p.includes(" genderfluid")) {
    return "non-binary" as Profile["gender"];
  }
  if (p.includes(" female") || p.includes(" woman") || p.includes(" girl") || p.includes(" women")) {
    return "female" as Profile["gender"];
  }
  if (p.includes(" male") || p.includes(" man") || p.includes(" guy") || p.includes(" boy") || p.includes(" men")) {
    return "male" as Profile["gender"];
  }
  return undefined;
}

export default function StylistPage() {
  // Auth
  const { user, isLoading: authLoading, signInWithGoogle, signOut } = useAuth();

  // Onboarding visibility
  const [showOnboarding, setShowOnboarding] = useState(false);

  // 🔹 Free-text prompt only
  const [prompt, setPrompt] = useState("");

  const [provider] = useState<"gemini">("gemini");

  const [outfits, setOutfits] = useState<Outfit[]>(demoOutfits());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Palette still used for onboarding + prompt context (no visible UI here)
  const [palette, setPalette] = useLocalStorage<string[]>("palette", [
    "#E3E1FF",
    "#D0F4DE",
    "#FEE7AE",
    "#FFC2C7",
    "#B9E3FF",
  ]);

  // Two separate stores:
  // - savedOutfits → LeftNav sidebar (only explicit Save)
  // - savedLibrary → Saved page (favorites/accepts AND saves)
  const [saved, setSaved] = useLocalStorage<Outfit[]>("savedOutfits", []);
  const [, setLibrary] = useLocalStorage<Outfit[]>("savedLibrary", []);

  const [closet, setCloset] = useLocalStorage<ClosetItem[]>("closet", []);

  // lightweight profile remains (height/bodyType/notes only)
  const [profile] = useLocalStorage<Profile>("profile", {
    gender: undefined,
    heightCm: undefined,
    bodyType: undefined,
    notes: "",
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [controls, setControls] = useState<Controls>({ casualFormal: 50, playfulPro: 50 });

  // where to source suggestions
  const [source, setSource] = useState<SourceMode>("shop_anywhere");

  // ❗ effective gender comes ONLY from the prompt now
  const effectiveGender: Profile["gender"] | undefined = inferGenderFromPrompt(prompt);

  // 🔔 lightweight toast for UX
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: "", visible: false });
  const showToast = (msg: string) => {
    setToast({ msg, visible: true });
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast({ msg, visible: false }), 1800);
  };

  // ✅ IMPORTANT: defaults changed so NO add-ons unless user selects
  const [requiredAddOns, setRequiredAddOns] = useLocalStorage<AddOn[]>("addons", []);
  const [forceCompleteLook, setForceCompleteLook] = useLocalStorage<boolean>("forceComplete", false);

  // Closet helpers
  const closetImages = useMemo(
    () => closet.filter((i) => i.image).map((i) => i.image!) as string[],
    [closet]
  );
  const closetSummary = useMemo(() => {
    if (!closet.length) return "No items uploaded.";
    const byType: Record<string, number> = {};
    closet.forEach((c) => {
      byType[c.type] = (byType[c.type] ?? 0) + 1;
    });
    const parts = Object.entries(byType).map(([k, v]) => `${k}×${v}`);
    return `${closet.length} items (${parts.join(", ")})`;
  }, [closet]);

  function profileToText(p: Profile) {
    const bits: string[] = [];
    if (p.heightCm) bits.push(`height: ${p.heightCm}cm`);
    if (p.bodyType) bits.push(`body type: ${p.bodyType}`);
    if (p.notes?.trim()) bits.push(`notes: ${p.notes.trim()}`);
    return bits.length ? bits.join(" · ") : "no profile specifics";
  }

  function buildPrompt() {
    const profileTxt = profileToText(profile);
    const paletteTxt = palette.length ? palette.join(", ") : "no preference";
    const userPrompt = prompt?.trim() || "No extra style prompt provided. Suggest versatile looks.";

    const sourceLine =
      source === "shop_anywhere"
        ? "Source policy: You may mix the user's closet items with new shopping suggestions."
        : source === "prefer_closet"
        ? [
            "Source policy: Prefer the user's closet items; only add new shopping items if necessary to complete the look.",
            "When you add a new item, explain why it's needed (e.g., 'Missing a layer: …').",
          ].join(" ")
        : [
            "Source policy: CLOSET ONLY. Use only items that could plausibly exist in the closet described by closetSummary/closetImages.",
            "If something is missing, do NOT recommend external products. Instead respond with a clear 'Missing:' note.",
            "Do NOT include shopping links.",
          ].join(" ");

    const genderRule = (() => {
      if (!effectiveGender) return null;
      const g = String(effectiveGender).toLowerCase();
      if (g.includes("male") || g === "man" || g === "men") {
        return [
          "The wearer is MALE. Suggest menswear silhouettes only.",
          "Do NOT mix genders in one suggestion.",
        ].join(" ");
      }
      if (g.includes("female") || g === "woman" || g === "women") {
        return [
          "The wearer is FEMALE. Suggest womenswear silhouettes only.",
          "Do NOT mix genders in one suggestion.",
        ].join(" ");
      }
      return `Respect the user's stated gender identity: ${effectiveGender}.`;
    })();

    const noAddOnsRequested = !forceCompleteLook && requiredAddOns.length === 0;

    const addOnRule = noAddOnsRequested
      ? // ⛔️ Explicitly forbid accessories when none selected
        "Do NOT add accessories (shoes, footwear, heels, bags, jewelry, belts, watches, eyewear, headwear, scarves, socks, outerwear) unless explicitly requested."
      : [
          forceCompleteLook
            ? "Always deliver a COMPLETE LOOK: include footwear plus 1–2 tasteful accessories."
            : null,
          requiredAddOns.length
            ? `The following add-ons are REQUIRED to be present in the final outfit: ${requiredAddOns.join(
                ", "
              )}.`
            : null,
          "Prefer one cohesive accessory story (metal tones, leather colors) instead of many small pieces.",
          "Return each outfit with an 'items' array (category, name, notes) and optionally 'missing' [].",
          "Categories can include: top, bottom, dress, outerwear, footwear, heels, bag, jewelry, belt, watch, eyewear, headwear, socks, scarf.",
        ]
          .filter(Boolean)
          .join(" ");

    return [
      `You are a stylist. Prioritize body type fit & proportions.`,
      `User profile → ${profileTxt}.`,
      genderRule,
      `User request: ${userPrompt}`,
      `Palette preference: ${paletteTxt}.`,
      `Closet summary: ${closetSummary}.`,
      sourceLine,
      addOnRule,
      `Return outfits that flatter the specified body type.`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function handleSuggest() {
    try {
      setLoading(true);
      setErrorMsg(null);

      if ((source === "prefer_closet" || source === "closet_only") && closet.length === 0) {
        setErrorMsg("No items in your closet. Add items to your closet or switch source.");
        return;
      }

      const filters = {
        prompt: buildPrompt(),
        palette,
        controls,
        profile,
        source,
        closetSummary,
        closetImages,
        userPrompt: prompt,
        requiredAddOns,
        forceCompleteLook,
      };

      const data = await suggestWithGemini(filters);
      const base = data.length ? data : demoOutfits();

      // ------ Hydration with robust links (merge model + fallbacks) ------
      const hydrated: Outfit[] = base.map((o) => {
        const urls = o.imageUrls?.length
          ? o.imageUrls
          : source !== "shop_anywhere"
          ? closetImages.slice(0, 9)
          : [];

        const wantLinks = source !== "closet_only";

        // Build shopping search query (gender-scoped if known)
        const queryParts = [o.title?.trim(), ...(o.tags ?? []), prompt?.trim()].filter(Boolean);
        let genderTerm = "";
        const gEff = effectiveGender?.toLowerCase();
        if (gEff?.includes("male") || gEff === "man" || gEff === "men") genderTerm = "men";
        else if (gEff?.includes("female") || gEff === "woman" || gEff === "women") genderTerm = "women";

        const searchQuery =
          [genderTerm, ...queryParts].filter(Boolean).join(" ").trim() ||
          (genderTerm ? `${genderTerm} versatile everyday outfit ideas` : "versatile everyday outfit ideas");

        const googleShop = {
          label: "See similar",
          url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=shop`,
          retailer: "Google Shopping",
        };
        const asosSearch = {
          label: "Browse on ASOS",
          url: `https://www.asos.com/search/?q=${encodeURIComponent(searchQuery)}`,
          retailer: "ASOS",
        };

        // Validate model links and MERGE with fallbacks, then de-dupe by URL
        const modelLinks = Array.isArray(o.buyLinks)
          ? o.buyLinks.filter((l) => l && typeof l.url === "string" && /^https?:\/\//i.test(l.url))
          : [];

        const merged = wantLinks ? [...modelLinks, googleShop, asosSearch] : [];
        const seen = new Set<string>();
        const buyLinks = merged.filter((l) => {
          if (!l?.url) return false;
          const key = l.url;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // If NO add-ons were requested, strip accessory items that the model added anyway
        const noAddOnsRequested = !forceCompleteLook && requiredAddOns.length === 0;
        let items = o.items;
        if (noAddOnsRequested && Array.isArray(items)) {
          items = items.filter((it) => !ADD_ON_CATEGORIES.has((it.category || "").toLowerCase()));
        }

        // If add-ons WERE requested, ensure per-item accessory links exist
        if (!noAddOnsRequested && Array.isArray(items) && wantLinks) {
          items = items.map((it) => {
            if (it.buyLink?.url) return it;
            const parts = [it.name, it.category, prompt?.trim()].filter(Boolean);
            const q = parts.join(" ").trim() || `${it.category} ${genderTerm}`.trim();
            return {
              ...it,
              buyLink: {
                label: "See similar",
                url: `https://www.google.com/search?q=${encodeURIComponent(q)}&tbm=shop`,
                retailer: "Google Shopping",
              },
            };
          });
        }

        return { ...o, imageUrls: urls, buyLinks, items };
      });
      // -------------------------------------------------------------------

      setOutfits(hydrated);
    } catch {
      setErrorMsg("Couldn’t generate suggestions. Check API server/key.");
    } finally {
      setLoading(false);
    }
  }

  // ---------- Saved list (sidebar) : UPSERT helper ----------
  function upsertSaved(update: Outfit) {
    setSaved((prev) => {
      const idx = prev.findIndex((p) => p.id === update.id);
      const merged: Outfit =
        idx === -1
          ? update
          : {
              ...prev[idx],
              ...update,
              savedMeta: {
                ...prev[idx].savedMeta,
                ...update.savedMeta,
                categories: Array.from(
                  new Set([
                    ...(prev[idx].savedMeta?.categories ?? []),
                    ...(update.savedMeta?.categories ?? []),
                  ])
                ),
              },
            };
      if (idx === -1) return [merged, ...prev];
      const next = [...prev];
      next[idx] = merged;
      return next;
    });
  }

  // ---------- Library (Saved page) : UPSERT helper ----------
  function upsertLibrary(update: Outfit) {
    setLibrary((prev) => {
      const idx = prev.findIndex((p) => p.id === update.id);
      const merged: Outfit =
        idx === -1
          ? update
          : {
              ...prev[idx],
              ...update,
              savedMeta: {
                ...prev[idx].savedMeta,
                ...update.savedMeta,
                categories: Array.from(
                  new Set([
                    ...(prev[idx].savedMeta?.categories ?? []),
                    ...(update.savedMeta?.categories ?? []),
                  ])
                ),
              },
            };
      if (idx === -1) return [merged, ...prev];
      const next = [...prev];
      next[idx] = merged;
      return next;
    });
  }

  function handleToggleFavorite(id: string) {
    setOutfits((prev) => prev.map((o) => (o.id === id ? { ...o, isFavorite: !o.isFavorite } : o)));
    const curr = outfits.find((o) => o.id === id);
    if (curr) {
      const nextFav = !curr.isFavorite;
      const categories = curr.tags ?? [];
      upsertLibrary({
        ...curr,
        isFavorite: nextFav,
        savedMeta: {
          ...curr.savedMeta,
          categories: Array.from(new Set([...(curr.savedMeta?.categories ?? []), ...categories])),
        },
      });
      showToast(nextFav ? "Added to Saved outfits page" : "Removed favorite (still on Saved page if previously saved)");
    }
  }

  function handleSave(oo: Outfit) {
    const categories = oo.tags ?? [];
    const enriched: Outfit = {
      ...oo,
      savedMeta: {
        ...oo.savedMeta,
        categories: Array.from(new Set([...(oo.savedMeta?.categories ?? []), ...categories])),
      },
    };
    upsertSaved(enriched);
    upsertLibrary(enriched);
    showToast("Saved — added to sidebar and Saved page");
  }

  function handleVerdict(id: string, verdict: "accepted" | "rejected") {
    setOutfits((prev) => prev.map((o) => (o.id === id ? { ...o, verdict } : o)));
    const curr = outfits.find((o) => o.id === id);
    if (curr) {
      const categories = curr.tags ?? [];
      upsertLibrary({
        ...curr,
        verdict,
        savedMeta: {
          ...curr.savedMeta,
          categories: Array.from(new Set([...(curr.savedMeta?.categories ?? []), ...categories])),
        },
      });
      if (verdict === "accepted") showToast("Accepted — added to Saved outfits page");
      if (verdict === "rejected") showToast("Rejected (kept on Saved page if previously saved)");
    }
  }

  async function handleSurprise() {
    setControls({
      casualFormal: Math.floor(Math.random() * 101),
      playfulPro: Math.floor(Math.random() * 101),
    });
    await handleSuggest();
  }

  // ---------- AUTH GATE ----------
  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-zinc-700">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">Checking your session…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-white px-4">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm text-center">
          <h1 className="text-lg font-semibold">Welcome to StyleAI</h1>
          <p className="mt-2 text-sm text-zinc-600">Sign in to save your closet, profile, and outfits.</p>
          <button
            onClick={signInWithGoogle}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
          >
            <LogIn className="h-4 w-4" />
            Continue with Google
          </button>
          <p className="mt-3 text-[11px] text-zinc-500">By continuing, you agree to our Terms and Privacy Policy.</p>
        </div>
      </div>
    );
  }

  // Onboarding only after login and if not completed
  useEffect(() => {
    const key = doneKey(user?.uid);
    if (!key) return;
    const done = localStorage.getItem(key) === "1";
    setShowOnboarding(!done);
  }, [user]);

  // Seed defaults from previous onboarding snapshot (only colors now)
  useEffect(() => {
    const k = dataKey(user?.uid);
    if (!k) return;
    const raw = localStorage.getItem(k);
    if (!raw) return;
    try {
      const d = JSON.parse(raw) as OnboardingData;
      if (Array.isArray(d.colors) && d.colors.length) setPalette(d.colors);
    } catch {
      // ignore parse errors
    }
  }, [user, setPalette]);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* TopBar */}
      <TopBar
        provider={provider}
        setProvider={() => {}}
        onPickPhotos={(files) => {
          const newItems = files.map((f, i) => ({
            id: crypto.randomUUID(),
            name: f.name || `Photo ${i + 1}`,
            type: "Photo",
            image: URL.createObjectURL(f),
          }));
          setCloset((prev) => [...newItems, ...prev]);
        }}
      />

      {/* Left Nav */}
      <LeftNav
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        closet={closet}
        setCloset={setCloset}
        saved={saved}
        setSaved={setSaved}
        currentUser={user}
        onSignOut={async () => {
          await signOut();
        }}
      />

      {/* Main content */}
      <div className="pt-14 lg:pl-[280px]">
        {/* mobile nav trigger */}
        <div className="lg:hidden px-4 pt-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="h-4 w-4" /> Menu
          </button>
        </div>

        {/* Centered main content */}
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <main className="py-6 space-y-6">
            <SuggestControls
              prompt={prompt}
              setPrompt={setPrompt}
              loading={loading}
              errorMsg={errorMsg}
              onSuggest={handleSuggest}
              source={source}
              setSource={setSource}
            />

            <ControlsBar value={controls} onChange={setControls} onRandomize={handleSurprise} />

            {/* Add-ons picker */}
            <AddOnsPicker
              value={requiredAddOns}
              onChange={setRequiredAddOns}
              forceCompleteLook={forceCompleteLook}
              onToggleForce={setForceCompleteLook}
            />

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
              <UploadArea
                onUpload={(files) => {
                  const newItems = files.map((f, i) => ({
                    id: crypto.randomUUID(),
                    name: f.name || `Photo ${i + 1}`,
                    type: "Photo",
                    image: URL.createObjectURL(f),
                  }));
                  setCloset((prev) => [...newItems, ...prev]);
                }}
              />
            </div>

            {(source === "prefer_closet" || source === "closet_only") && closet.length === 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2 text-sm">
                No items in your closet. Add items to your closet or switch source to “Shop anywhere”.
              </div>
            )}

            {/* Suggestions feed */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Suggestions</h2>
                  {loading && (
                    <span className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating looks…
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSuggest}
                  disabled={loading}
                  className="rounded-lg bg-zinc-900 text-white px-3 py-1.5 text-xs hover:bg-zinc-800 disabled:opacity-60"
                >
                  Regenerate
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {outfits.length === 0 ? (
                  <div className="col-span-full text-xs text-zinc-500">
                    No outfits yet — try generating above.
                  </div>
                ) : (
                  outfits.map((o) => (
                    <div key={o.id}>
                      <OutfitCard
                        outfit={o}
                        onSave={handleSave}
                        onToggleFavorite={handleToggleFavorite}
                        onVerdict={(v) => v && handleVerdict(o.id, v)}
                        showBuyLinks={source !== "closet_only"}
                      />
                    </div>
                  ))
                )}
              </div>
            </section>
          </main>

          <footer className="text-center text-xs text-zinc-500 pb-8">
            HCI · Your Personal Stylist
          </footer>
        </div>
      </div>

      {/*  Onboarding modal */}
      {user && showOnboarding && (
        <Onboarding
          defaultValues={{ styles: [], occasions: [], seasons: [], colors: palette }}
          onSkip={() => {
            localStorage.setItem(doneKey(user.uid), "1");
            setShowOnboarding(false);
          }}
          onComplete={(values) => {
            localStorage.setItem(doneKey(user.uid), "1");
            localStorage.setItem(dataKey(user.uid), JSON.stringify(values));
            if (values.colors?.length) setPalette(values.colors);
            setShowOnboarding(false);
          }}
        />
      )}

      {/* lightweight toast */}
      {toast.visible && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="rounded-xl border border-zinc-200 bg-white/95 px-3 py-2 shadow-md text-sm text-zinc-800">
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

function demoOutfits(): Outfit[] {
  return [
    {
      id: "1",
      title: "Monochrome layers",
      subtitle: "Black denim + charcoal knit + chunky sneakers",
      tags: ["Smart casual", "Fall", "Monochrome"],
      score: 92,
      buyLinks: [
        {
          label: "See similar",
          url: "https://www.google.com/search?q=monochrome+fall+smart+casual+outfit&tbm=shop",
          retailer: "Google Shopping",
        },
      ],
    },
    {
      id: "2",
      title: "Soft neutrals",
      subtitle: "Oat tee, stone chinos, white trainers",
      tags: ["Minimal", "Spring", "Light palette"],
      score: 88,
    },
    {
      id: "3",
      title: "Street pop",
      subtitle: "Boxy tee, cargo pants, bright accents",
      tags: ["Streetwear", "Summer"],
      score: 84,
    },
    {
      id: "4",
      title: "Elevated basics",
      subtitle: "Navy blazer, tee, tapered jeans",
      tags: ["Classic", "All-season"],
      score: 86,
    },
    {
      id: "5",
      title: "Cozy knit set",
      subtitle: "Ribbed two-piece with trench",
      tags: ["Boho", "Fall"],
      score: 80,
    },
    {
      id: "6",
      title: "Athleisure city",
      subtitle: "Zip hoodie, leggings, runners",
      tags: ["Athleisure", "Travel"],
      score: 83,
    },
  ];
}
