// src/types.ts

export type BuyLink = {
  label: string;
  url: string;
  price?: string;
  retailer?: string;
};

export type Outfit = {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  score: number;

  // optional UI fields
  imageUrls?: string[];
  isFavorite?: boolean;

  // saved metadata
  savedMeta?: {
    note?: string;
    categories?: string[]; // e.g., ["Boho","Travel","Warm palette"]
  };

  // HCI extras
  explanation?: string;                   // “Why this works”
  highlights?: string[];                  // bullets: color/fabric/pattern
  confidence?: number;                    // 0–1
  buyLinks?: BuyLink[];                   // “buy this look”
  verdict?: "accepted" | "rejected" | null; // swipe / decision
};

// shared between StylistPage, SuggestControls, API filters
export type SourceMode = "shop_anywhere" | "prefer_closet" | "closet_only";

// match how you use Profile in StylistPage
export type Profile = {
  gender?: string;
  heightCm?: number;
  bodyType?: string;
  notes?: string;
};

// 🔧 NEW shape for filters, no style/season/occasion
export type SuggestFilters = {
  // full system prompt you build in buildPrompt()
  prompt: string;

  // optional raw user prompt if you want it
  userPrompt?: string;

  palette?: string[];
  profile?: Profile;
  source?: SourceMode;
  closetSummary?: string;
  closetImages?: string[];

  // sliders
  controls?: {
    casualFormal: number;
    playfulPro: number;
  };
};

export type ClosetItem = {
  id: string;
  name: string;
  type: string;
  image?: string;
};
