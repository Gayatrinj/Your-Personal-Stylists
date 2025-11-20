// src/types.ts

export type BuyLink = {
  label: string;
  url: string;
  price?: string;
  retailer?: string;
};

/** Optional, structured item list (lets us show/accessorize a look) */
export type OutfitItem = {
  category: string; // e.g. "footwear", "bag", "jewelry", "outerwear"
  name?: string;    // e.g. "white leather sneakers"
  notes?: string;   // e.g. "minimal, low profile sole"
  imageUrl?: string;
  buyLink?: BuyLink;
};

/** Optional “extras” you can require the model to add */
export type AddOn =
  | "footwear"
  | "heels"
  | "bag"
  | "jewelry"
  | "belt"
  | "watch"
  | "eyewear"
  | "headwear"
  | "outerwear"
  | "socks"
  | "scarf";

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
  explanation?: string;                    // “Why this works”
  highlights?: string[];                   // bullets: color/fabric/pattern
  confidence?: number;                     // 0–1
  buyLinks?: BuyLink[];                    // “buy this look”
  verdict?: "accepted" | "rejected" | null;

  // NEW: structured inventory + any gaps (especially for closet-only)
  items?: OutfitItem[];
  missing?: string[];
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

// Filters sent to your API
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


  requiredAddOns?: AddOn[];
  forceCompleteLook?: boolean;
};

export type ClosetItem = {
  id: string;
  name: string;
  type: string;
  image?: string;
};
