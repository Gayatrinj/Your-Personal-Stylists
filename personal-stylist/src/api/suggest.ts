// src/api/suggest.ts
import type { Outfit, SuggestFilters } from "@/types";

/**
 * Choose the base URL:
 * - Default: same-origin (works on Vercel when your serverless functions live under /api/*)
 * - If you set VITE_API_BASE, we use that (e.g. for local custom servers or Netlify)
 */
function getApiBase(): string {
  const forced = (import.meta.env.VITE_API_BASE || "").trim();
  if (forced) return forced.replace(/\/$/, ""); // strip trailing slash
  return ""; // same-origin
}

const API_BASE = getApiBase();

function joinUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), 60_000); // 60s timeout

  try {
    const url = joinUrl(path);

    const rsp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      credentials: "same-origin",
    });

    const raw = await rsp.text();
    clearTimeout(id);

    if (!rsp.ok) {
      throw new Error(`API ${path} failed: ${rsp.status} ${rsp.statusText} ${raw}`);
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new Error(`Invalid JSON from ${path}`);
    }
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

  const url = joinUrl("/api/gemini/suggest-from-photo");

  const rsp = await fetch(url, {
    method: "POST",
    body: form,
    credentials: "same-origin",
  });

  const raw = await rsp.text();
  if (!rsp.ok) {
    throw new Error(
      `API /api/gemini/suggest-from-photo failed: ${rsp.status} ${rsp.statusText} ${raw}`
    );
  }
  try {
    const data = JSON.parse(raw);
    return data.outfits ?? [];
  } catch {
    throw new Error("Invalid JSON from /api/gemini/suggest-from-photo");
  }
}
