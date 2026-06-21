// Image generation via OpenRouter chat-completions with image modality.
// Model is OPENROUTER_IMAGE_MODEL (default openai/gpt-5.4-image-2). Returns the image as a URL —
// a base64 data URL (or, occasionally, a hosted https URL) — or null on failure. Callers send this
// straight to the frontend / store it; nothing is written to disk (the filesystem is read-only on
// Vercel). Optional reference images are sent as multimodal image_url parts (brand logo, author
// headshot, or — later — harvested post visuals) so the model keeps the output on-brand.
import { promises as fs } from "fs";
import path from "path";

export const IMAGE_MODEL = process.env.OPENROUTER_IMAGE_MODEL ?? "google/gemini-3.1-flash-image";

type ORImage = { type?: string; image_url?: { url?: string } };
type ORChoice = { message?: { images?: ORImage[]; content?: string } };
type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

const MIME: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".gif": "image/gif",
};

// Turn a reference into a URL the model can consume. Local public paths (/uploads, /generated)
// are read from disk and inlined as base64 data URLs (OpenRouter can't reach localhost);
// absolute http(s) URLs pass through untouched. Returns null if the file can't be read.
async function toImageUrl(ref: string): Promise<string | null> {
  if (/^https?:\/\//i.test(ref)) return ref;
  if (ref.startsWith("data:image/")) return ref;
  if (!ref.startsWith("/")) return null;
  try {
    const buf = await fs.readFile(path.join(process.cwd(), "public", ref));
    const mime = MIME[path.extname(ref).toLowerCase()] ?? "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function generateImage(prompt: string, refs: string[] = []): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  // Build the user message: text first, then any reference images. Keep a plain string when
  // there are no refs so the no-reference path matches the previously-working request exactly.
  const refUrls = (await Promise.all(refs.map(toImageUrl))).filter((u): u is string => !!u);
  const content: string | ContentPart[] = refUrls.length
    ? [{ type: "text", text: prompt }, ...refUrls.map((url) => ({ type: "image_url" as const, image_url: { url } }))]
    : prompt;

  // Hard timeout so a misconfigured/unavailable image model fails the job instead of
  // hanging the poll forever (a 2xx that never streams an image otherwise blocks indefinitely).
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 120_000);
  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Penkala",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        modalities: ["image", "text"],
        messages: [{ role: "user", content }],
      }),
    });
  } catch (e) {
    throw new Error(
      ctrl.signal.aborted
        ? `Image model "${IMAGE_MODEL}" timed out. Check OPENROUTER_IMAGE_MODEL.`
        : `Image request failed: ${e instanceof Error ? e.message : "network error"}`
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Image API ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as { choices?: ORChoice[] };
  const msg = json.choices?.[0]?.message;

  // OpenRouter returns generated images on message.images[].image_url.url (a data URL, or
  // occasionally a hosted https URL). Return it as-is — no disk write, just hand it to the frontend.
  const fromImages = msg?.images?.map((i) => i.image_url?.url).find(Boolean);
  if (fromImages) return fromImages;

  // Fallback: some models put a data URL straight in content.
  if (typeof msg?.content === "string" && msg.content.startsWith("data:image")) {
    return msg.content;
  }

  return null;
}
