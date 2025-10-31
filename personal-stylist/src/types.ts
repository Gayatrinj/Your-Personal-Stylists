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

export type SuggestFilters = {
  prompt: string;
  style: string;
  season: string;
  occasion: string;
  palette?: string[];
};

export type ClosetItem = {
  id: string;
  name: string;
  type: string;
  image?: string;
};

export type Profile = {
  name?: string;
  gender?: "female" | "male" | "nonbinary" | "prefer_not_say";
  heightCm?: number;
  bodyType?: "petite" | "average" | "athletic" | "curvy" | "plus" | "slim" | "broad" | "other";
  fitPrefs?: string[];       
  measurements?: { bust?: number; waist?: number; hips?: number; chest?: number; inseam?: number };
  notes?: string;
};
