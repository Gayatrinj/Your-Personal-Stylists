import { useState } from "react";
import TopBar from "./TopBar";
import SuggestControls from "./SuggestControls";
import UploadArea from "./UploadArea";
import SuggestionsGrid from "./SuggestionsGrid";
import Closet from "./Closet";
import SavedList from "./SavedList";
import ColorPalette from "./ColorPalette";
import { type Outfit, type ClosetItem } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { suggestWithGemini } from "@/api/suggest";

const STYLES = ["Smart casual","Minimal","Streetwear","Classic","Y2K","Boho","Athleisure"];
const OCCASIONS = ["Dinner","Party","Office","Date","Travel","Wedding guest"];
const SEASONS = ["Spring","Summer","Fall","Winter"];

export default function StylistPage() {
  // filters
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Smart casual");
  const [occasion, setOccasion] = useState("Dinner");
  const [season, setSeason] = useState("Fall");

  // provider & async state
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [outfits, setOutfits] = useState<Outfit[]>(demoOutfits());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // persistent local state
  const [palette, setPalette] = useLocalStorage<string[]>("palette",
    ["#E3E1FF","#D0F4DE","#FEE7AE","#FFC2C7","#B9E3FF"]
  );
  const [closet, setCloset] = useLocalStorage<ClosetItem[]>("closet", []);
  const [saved, setSaved] = useLocalStorage<Outfit[]>("savedOutfits", []);

  const [tab, setTab] = useState<"closet" | "saved">("closet");

  async function handleSuggest() {
    try {
      setLoading(true); setErrorMsg(null);
      const filters = { prompt, style, season, occasion };
      const data = await suggestWithGemini(filters);
      setOutfits(data.length ? data : demoOutfits());
    } catch (e) {
      setErrorMsg("Couldn’t generate suggestions. Check API server/key.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen w-full bg-white text-zinc-900">
      <TopBar provider={provider} setProvider={setProvider}
              onAddOutfit={() => setSaved(prev => [{ id: crypto.randomUUID(), title: "Custom look", subtitle: "Describe pieces…", tags:["Custom"], score: 90 }, ...prev])}
              onPickPhotos={(files) => {
                const newItems = files.map((f, i) => ({
                  id: crypto.randomUUID(),
                  name: f.name || `Photo ${i+1}`,
                  type: "Photo",
                  image: URL.createObjectURL(f),
                }));
                setCloset(prev => [...newItems, ...prev]);
              }}
            />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <section className="space-y-6">
          <SuggestControls
            prompt={prompt} setPrompt={setPrompt}
            style={style} setStyle={setStyle} styles={STYLES}
            occasion={occasion} setOccasion={setOccasion} occasions={OCCASIONS}
            season={season} setSeason={setSeason} seasons={SEASONS}
            loading={loading} errorMsg={errorMsg} onSuggest={handleSuggest}
          />
          <UploadArea
            onUpload={(files)=> {
              const newItems = files.map((f,i)=>({
                id: crypto.randomUUID(), name: f.name || `Photo ${i+1}`, type:"Photo", image: URL.createObjectURL(f)
              }));
              setCloset(prev => [...newItems, ...prev]);
            }}
          />
          <SuggestionsGrid
            outfits={outfits}
            loading={loading}
            onRegenerate={handleSuggest}
            onSave={(o)=> setSaved(prev => prev.some(p=>p.id===o.id)? prev : [o, ...prev])}
          />
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white">
            <div className="grid grid-cols-2">
              <button onClick={()=>setTab("closet")} className={`rounded-tl-2xl px-4 py-2 text-sm ${tab==="closet"?"bg-zinc-50 border-b border-zinc-200":""}`}>Your closet</button>
              <button onClick={()=>setTab("saved")}  className={`rounded-tr-2xl px-4 py-2 text-sm ${tab==="saved" ?"bg-zinc-50 border-b border-zinc-200":""}`}>Saved</button>
            </div>
            <div className="p-4 space-y-4">
              {tab==="closet" ? (
                <Closet items={closet} setItems={setCloset}/>
              ) : (
                <SavedList saved={saved} setSaved={setSaved}/>
              )}
            </div>
          </div>

          <ColorPalette
            palette={palette}
            setPalette={setPalette}
          />
        </aside>
      </main>
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 text-center text-xs text-zinc-500">
        HCI · Your Personal Stylist
      </footer>
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
