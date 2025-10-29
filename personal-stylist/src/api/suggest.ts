// src/api/suggest.ts
import type { Outfit, SuggestFilters } from "@/types";

// Use env var in dev/prod; falls back to localhost
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8787";

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), 60000); // 60s timeout

  try {
    const url = `${API_BASE}${path}`;
    // Optional: logs while debugging
    // console.log("[POST]", url, body);

    const rsp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });

    const raw = await rsp.text();
    clearTimeout(id);

    // console.log("[RESP]", rsp.status, rsp.statusText, raw);

    if (!rsp.ok) {
      throw new Error(`API ${path} failed: ${rsp.status} ${rsp.statusText} ${raw}`);
    }
    return JSON.parse(raw) as T;
  } catch (e: any) {
    clearTimeout(id);
    if (e?.name === "AbortError") {
      throw new Error("Request timed out (>60s). Please try again.");
    }
    throw new Error(`Network error: ${e?.message || e}`);
  }
}

/** Text suggestions (Gemini only) */
export async function suggestWithGemini(
  filters: SuggestFilters & { controls?: { casualFormal: number; playfulPro: number } }
): Promise<Outfit[]> {
  const data = await postJSON<{ outfits: Outfit[]; error?: string }>(
    "/api/gemini/suggest",
    filters
  );
  return data.outfits ?? [];
}

/** Vision: suggest from a photo */
export async function suggestWithGeminiPhoto(
  file: File,
  filters: { style: string; season: string; occasion: string; palette: string[] }
): Promise<Outfit[]> {
  const form = new FormData();
  form.append("file", file);
  form.append("style", filters.style);
  form.append("season", filters.season);
  form.append("occasion", filters.occasion);
  form.append("palette", JSON.stringify(filters.palette || []));

  const rsp = await fetch(`${API_BASE}/api/gemini/suggest-from-photo`, {
    method: "POST",
    body: form,
  });

  const raw = await rsp.text();
  if (!rsp.ok) {
    throw new Error(`API /api/gemini/suggest-from-photo failed: ${rsp.status} ${rsp.statusText} ${raw}`);
  }
  const data = JSON.parse(raw);
  return data.outfits ?? [];
}
