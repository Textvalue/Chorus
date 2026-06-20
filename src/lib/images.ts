// Image generation via OpenRouter chat-completions with image modality.
// Model is OPENROUTER_IMAGE_MODEL (default gpt-5.4-image). Returns a PNG buffer, or null on failure.
export const IMAGE_MODEL = process.env.OPENROUTER_IMAGE_MODEL ?? "google/gemini-3.1-flash-image";

type ORImage = { type?: string; image_url?: { url?: string } };
type ORChoice = { message?: { images?: ORImage[]; content?: string } };

function dataUrlToBuffer(url: string): Buffer | null {
  const m = url.match(/^data:image\/\w+;base64,(.+)$/);
  return m ? Buffer.from(m[1], "base64") : null;
}

export async function generateImage(prompt: string): Promise<Buffer | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Tutti",
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      modalities: ["image", "text"],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Image API ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as { choices?: ORChoice[] };
  const msg = json.choices?.[0]?.message;

  // OpenRouter returns generated images on message.images[].image_url.url (data URL).
  const fromImages = msg?.images?.map((i) => i.image_url?.url).find(Boolean);
  if (fromImages) return dataUrlToBuffer(fromImages);

  // Fallback: some models put a data URL straight in content.
  if (typeof msg?.content === "string" && msg.content.startsWith("data:image")) {
    return dataUrlToBuffer(msg.content);
  }

  return null;
}
