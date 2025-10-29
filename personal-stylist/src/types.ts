export type Outfit = {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  score: number;
};

export type SuggestFilters = {
  prompt: string;
  style: string;
  season: string;
  occasion: string;
};

export type ClosetItem = {
  id: string;
  name: string;
  type: string;
  image?: string; // object URL or server URL
};
