// src/utils/slug.ts
export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
export function unslugify(s: string) {
  return s.replace(/-/g, " ");
}
