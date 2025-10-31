import { useMemo, useState } from "react";
import TopBar from "./TopBar";
import SuggestControls from "./SuggestControls";
import UploadArea from "./UploadArea";
import OutfitCard from "./OutfitCard";
import LeftNav from "./LeftNav";
import ControlsBar from "./ControlsBar";
import type { Outfit, ClosetItem, Profile } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { suggestWithGemini } from "@/api/suggest";
import { Menu, Loader2 } from "lucide-react";

type Controls = { casualFormal: number; playfulPro: number };
type SourceMode = "shop_anywhere" | "prefer_closet" | "closet_only";

const STYLES = ["Smart casual","Minimal","Streetwear","Classic","Y2K","Boho","Athleisure"];
const OCCASIONS = ["Dinner","Party","Office","Date","Travel","Wedding guest"];
const SEASONS = ["Spring","Summer","Fall","Winter"];

function rationaleForBodyType(bt?: Profile["bodyType"]) {
  switch (bt) {
    case "petite":   return "Petite fit: higher rises, cropped lengths, clean vertical lines to elongate.";
    case "average":  return "Balanced fit: classic proportions, mid-rise, versatile lengths.";
    case "athletic": return "Athletic fit: add shape with structured tops; straight/tapered lines define the waist.";
    case "curvy":    return "Curvy fit: waist emphasis, wrap/fit-and-flare shapes, soft drape over hips.";
    case "plus":     return "Plus fit: defined waist, fluid fabrics, vertical seams to streamline.";
    case "slim":     return "Slim fit: layer for volume, relaxed cuts, mid-rise to balance proportions.";
    case "broad":    return "Broad frame: soften shoulders (raglan/knits), straight legs to balance the top.";
    case "other":    return "Customized fit: balanced proportions and comfortable silhouettes.";
    default:         return null;
  }
}

export default function StylistPage() {
  // filters
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Smart casual");
  const [occasion, setOccasion] = useState("Dinner");
  const [season, setSeason] = useState("Fall");

  const [provider] = useState<"gemini">("gemini");

  const [outfits, setOutfits] = useState<Outfit[]>(demoOutfits());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [palette, setPalette] = useLocalStorage<string[]>("palette", ["#E3E1FF","#D0F4DE","#FEE7AE","#FFC2C7","#B9E3FF"]);
  const [closet, setCloset] = useLocalStorage<ClosetItem[]>("closet", []);
  const [saved, setSaved] = useLocalStorage<Outfit[]>("savedOutfits", []);

  const [profile] = useLocalStorage<Profile>("profile", {
    gender: undefined, heightCm: undefined, bodyType: undefined, notes: "",
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [controls, setControls] = useState<Controls>({ casualFormal: 50, playfulPro: 50 });

  // where to source suggestions
  const [source, setSource] = useState<SourceMode>("shop_anywhere");

  const [lastContext, setLastContext] = useState<{
    profile?: Profile; palette?: string[]; style?: string; occasion?: string; season?: string; controls?: Controls; source?: SourceMode;
  } | null>(null);

  // Closet helpers
  const closetImages = useMemo(
    () => closet.filter(i => i.image).map(i => i.image!) as string[],
    [closet]
  );
  const closetSummary = useMemo(() => {
    if (!closet.length) return "No items uploaded.";
    const byType: Record<string, number> = {};
    closet.forEach(c => { byType[c.type] = (byType[c.type] ?? 0) + 1; });
    const parts = Object.entries(byType).map(([k,v]) => `${k}×${v}`);
    return `${closet.length} items (${parts.join(", ")})`;
  }, [closet]);

  function profileToText(p: Profile) {
    const bits: string[] = [];
    if (p.gender)   bits.push(`gender: ${p.gender}`);
    if (p.heightCm) bits.push(`height: ${p.heightCm}cm`);
    if (p.bodyType) bits.push(`body type: ${p.bodyType}`);
    if (p.notes?.trim()) bits.push(`notes: ${p.notes.trim()}`);
    return bits.length ? bits.join(" · ") : "no profile specifics";
  }

  function buildPrompt() {
    const profileTxt = profileToText(profile);
    const paletteTxt = palette.length ? palette.join(", ") : "no preference";
    const sourceLine =
      source === "shop_anywhere"
        ? "Source policy: You may mix closet items with new shopping suggestions."
        : source === "prefer_closet"
        ? "Source policy: Prefer the user's closet items; only add new shopping items to complete looks."
        : "Source policy: Use only the user's closet items. If a look is impossible, say which item is missing.";
    return [
      `You are a stylist. Prioritize body type fit & proportions.`,
      `User profile → ${profileTxt}.`,
      `Context: style=${style}, occasion=${occasion}, season=${season}.`,
      `Palette preference: ${paletteTxt}.`,
      `Closet summary: ${closetSummary}.`,
      sourceLine,
      prompt?.trim() ? `Extra notes: ${prompt.trim()}` : null,
      `Return outfits that flatter the specified body type. If guidance conflicts, favor body-type-friendly choices (silhouette, rise, lengths, cuts).`,
    ].filter(Boolean).join("\n");
  }

  async function handleSuggest() {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Guard: closet requested but empty
      if ((source === "prefer_closet" || source === "closet_only") && closet.length === 0) {
        setErrorMsg("No items in your closet. Add items to your closet or switch source.");
        return;
      }

      const filters = {
        prompt: buildPrompt(),
        style, season, occasion, palette, controls, profile,
        source,
        closetSummary,
        closetImages,
      };
      setLastContext({ profile, palette, style, occasion, season, controls, source });

      const data = await suggestWithGemini(filters);
      const base = data.length ? data : demoOutfits();

      // ------ Hydration with robust fallback buy links ------
      const hydrated: Outfit[] = base.map((o) => {
        // Images
        const urls = o.imageUrls?.length
          ? o.imageUrls
          : (source !== "shop_anywhere" ? closetImages.slice(0, 9) : []);

        // Decide if we want links (not in closet_only)
        const wantLinks = source !== "closet_only";

        // Build a strong query even when prompt is empty
        const queryParts = [
          o.title?.trim(),
          ...(o.tags ?? []),
          style,
          occasion,
          season,
        ].filter(Boolean);

        const searchQuery =
          queryParts.join(" ").trim() ||
          `${style || "outfit"} ${occasion || ""} ${season || ""} outfit`.trim();

        const fallbackLinks = wantLinks
          ? [
              {
                label: "See similar",
                url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=shop`,
                retailer: "Google Shopping",
              },
            ]
          : [];

        const buyLinks =
          wantLinks && Array.isArray(o.buyLinks) && o.buyLinks.length
            ? o.buyLinks
            : fallbackLinks;

        return { ...o, imageUrls: urls, buyLinks };
      });
      // ------------------------------------------------------

      setOutfits(hydrated);
    } catch {
      setErrorMsg("Couldn’t generate suggestions. Check API server/key.");
    } finally {
      setLoading(false);
    }
  }

  function handleToggleFavorite(id: string) {
    setOutfits(prev => prev.map(o => (o.id === id ? { ...o, isFavorite: !o.isFavorite } : o)));
  }

  async function handleSurprise() {
    setControls({
      casualFormal: Math.floor(Math.random() * 101),
      playfulPro: Math.floor(Math.random() * 101),
    });
    await handleSuggest();
  }

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
          setCloset(prev => [...newItems, ...prev]);
        }}
      />

      {/* Left Nav */}
      <LeftNav
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        palette={palette}
        setPalette={setPalette}
        closet={closet}
        setCloset={setCloset}
        saved={saved}
        setSaved={setSaved}
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
              prompt={prompt} setPrompt={setPrompt}
              style={style} setStyle={setStyle} styles={STYLES}
              occasion={occasion} setOccasion={setOccasion} occasions={OCCASIONS}
              season={season} setSeason={setSeason} seasons={SEASONS}
              loading={loading} errorMsg={errorMsg} onSuggest={handleSuggest}
              source={source} setSource={setSource}
            />

            {(source === "prefer_closet" || source === "closet_only") && closet.length === 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2 text-sm">
                No items in your closet. Add items to your closet or switch source to “Shop anywhere”.
              </div>
            )}

            {/* Preferences summary pills */}
            <div className="flex flex-wrap items-center gap-2 -mt-2">
              {profile.bodyType && (
                <span className="inline-flex items-center rounded-full bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 px-2.5 py-1 text-xs">
                  Body type: {profile.bodyType}
                </span>
              )}
              {profile.gender && (
                <span className="inline-flex items-center rounded-full bg-zinc-100 text-zinc-800 px-2.5 py-1 text-xs">
                  Gender: {profile.gender}
                </span>
              )}
              {profile.heightCm && (
                <span className="inline-flex items-center rounded-full bg-zinc-100 text-zinc-800 px-2.5 py-1 text-xs">
                  Height: {profile.heightCm}cm
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-zinc-100 text-zinc-800 px-2.5 py-1 text-xs">Style: {style}</span>
              <span className="inline-flex items-center rounded-full bg-zinc-100 text-zinc-800 px-2.5 py-1 text-xs">Occasion: {occasion}</span>
              <span className="inline-flex items-center rounded-full bg-zinc-100 text-zinc-800 px-2.5 py-1 text-xs">Season: {season}</span>
              <span className="inline-flex items-center rounded-full bg-zinc-100 text-zinc-800 px-2.5 py-1 text-xs">Palette: {palette.length} colors</span>
              <span className="inline-flex items-center rounded-full bg-zinc-100 text-zinc-800 px-2.5 py-1 text-xs">Sliders: C/F {controls.casualFormal} · P/Pro {controls.playfulPro}</span>
            </div>

            <ControlsBar value={controls} onChange={setControls} onRandomize={handleSurprise} />

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
              <UploadArea
                onUpload={(files) => {
                  const newItems = files.map((f, i) => ({
                    id: crypto.randomUUID(),
                    name: f.name || `Photo ${i + 1}`,
                    type: "Photo",
                    image: URL.createObjectURL(f),
                  }));
                  setCloset(prev => [...newItems, ...prev]);
                }}
              />
            </div>

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
                {outfits.map((o) => {
                  const rationale = rationaleForBodyType(profile.bodyType);
                  return (
                    <div key={o.id}>
                      <OutfitCard
                        outfit={o}
                        onSave={(oo) => {
                          const categories = [style, occasion, season];
                          const enriched: Outfit = {
                            ...oo,
                            savedMeta: {
                              ...oo.savedMeta,
                              categories: Array.from(
                                new Set([...(oo.savedMeta?.categories ?? []), ...categories])
                              ),
                            },
                          };
                          setSaved(prev =>
                            prev.some(p => p.id === oo.id) ? prev : [enriched, ...prev]
                          );
                        }}
                        onToggleFavorite={handleToggleFavorite}
                        onVerdict={() => {}}
                        showBuyLinks={source !== "closet_only"} // NEW: hide in closet-only mode
                      />
                      {rationale && <p className="mt-1 text-xs text-zinc-600">{rationale}</p>}
                    </div>
                  );
                })}
              </div>
            </section>

            {lastContext && (
              <details className="mt-4 text-xs text-zinc-600">
                <summary className="cursor-pointer">Show last request context</summary>
                <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3">
{JSON.stringify({
  profile: lastContext.profile,
  style: lastContext.style,
  occasion: lastContext.occasion,
  season: lastContext.season,
  paletteCount: lastContext.palette?.length,
  sliders: lastContext.controls,
  source: lastContext.source,
}, null, 2)}
                </pre>
              </details>
            )}
          </main>

          <footer className="text-center text-xs text-zinc-500 pb-8">
            HCI · Your Personal Stylist
          </footer>
        </div>
      </div>
    </div>
  );
}

function demoOutfits(): Outfit[] {
  return [
    { id:"1", title:"Monochrome layers", subtitle:"Black denim + charcoal knit + chunky sneakers", tags:["Smart casual","Fall","Monochrome"], score:92 },
    { id:"2", title:"Soft neutrals", subtitle:"Oat tee, stone chinos, white trainers", tags:["Minimal","Spring","Light palette"], score:88 },
    { id:"3", title:"Street pop", subtitle:"Boxy tee, cargo pants, bright accents", tags:["Streetwear","Summer"], score:84 },
    { id:"4", title:"Elevated basics", subtitle:"Navy blazer, tee, tapered jeans", tags:["Classic","All-season"], score:86 },
    { id:"5", title:"Cozy knit set", subtitle:"Ribbed two-piece with trench", tags:["Boho","Fall"], score:80 },
    { id:"6", title:"Athleisure city", subtitle:"Zip hoodie, leggings, runners", tags:["Athleisure","Travel"], score:83 },
  ];
}
