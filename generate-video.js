// generate-video.js
// PixVerse text-to-video generation (real API: https://docs.platform.pixverse.ai)
//
// Usage:  PIXVERSE_API_KEY=xxxx node generate-video.js
// Node 18+ (uses built-in fetch + crypto.randomUUID — no node-fetch needed)

import { randomUUID } from "node:crypto";

const API_KEY = process.env.PIXVERSE_API_KEY;
const BASE = "https://app-api.pixverse.ai/openapi/v2";

if (!API_KEY) {
  console.error("Missing PIXVERSE_API_KEY env var.");
  process.exit(1);
}

const PROMPT = `
A cinematic cyberpunk street in Tokyo at night during heavy rain.
A woman in a black trench coat walks toward the camera holding a transparent umbrella.
Neon reflections on wet asphalt, slow dolly backward camera motion, ultra realistic lighting, 4K, film style.
`.trim();

async function generateVideo() {
  const res = await fetch(`${BASE}/video/text/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "API-KEY": API_KEY,
      "Ai-trace-id": randomUUID(), // must be unique per request or you get the same video back
    },
    body: JSON.stringify({
      model: "v6",            // latest/best model (supports 1–15s + extra aspect ratios)
      prompt: PROMPT,         // camera motion goes in the prompt; there is no camera_motion field
      duration: 5,            // v6 allows 1–15s
      quality: "720p",        // 360p | 540p | 720p | 1080p
      aspect_ratio: "16:9",
      generate_audio_switch: true,
      // negative_prompt is not supported by the text-to-video endpoint
    }),
  });

  const data = await res.json();
  console.log("Generation request:", JSON.stringify(data, null, 2));

  if (data.ErrCode !== 0) {
    throw new Error(`API error ${data.ErrCode}: ${data.ErrMsg}`);
  }

  const videoId = data.Resp?.video_id;
  if (!videoId) throw new Error("No video_id returned");

  await pollJob(videoId);
}

async function pollJob(videoId) {
  // status: 1 = success, 5 = processing, 7 = moderation fail, 8 = generation fail
  while (true) {
    const res = await fetch(`${BASE}/video/result/${videoId}`, {
      headers: {
        "API-KEY": API_KEY,
        "Ai-trace-id": randomUUID(),
      },
    });

    const data = await res.json();
    const status = data.Resp?.status;
    console.log("Status:", status);

    if (status === 1) {
      console.log("✅ Video URL:", data.Resp.url);
      break;
    }
    if (status === 7 || status === 8) {
      console.log("❌ Generation failed:", JSON.stringify(data, null, 2));
      break;
    }

    await new Promise((r) => setTimeout(r, 4000));
  }
}

generateVideo().catch((err) => {
  console.error(err);
  process.exit(1);
});
