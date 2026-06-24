import { z } from "zod";
import { createChatCompletion, hasProviderKey } from "./providers.js";
import { loadReferenceContext } from "../workflow/resources.js";

const videoPlanSchema = z.object({
  brief: z.string(),
  script: z.string(),
  shot_plan: z.string(),
  subtitle_notes: z.string(),
  production_notes: z.string(),
});

export function hasOpenAIKey() {
  return hasProviderKey("openai");
}

export async function generateVideoPlan({ brief, language = "zh-CN", model, provider, apiKey, baseURL }) {
  const references = await loadReferenceContext([
    "production-workflows.md",
    "spoken-scriptwriting.md",
    "captions-audio.md",
    "sourcing.md",
    "qc-and-fallbacks.md",
  ]);

  const content = await createChatCompletion({
    provider,
    model,
    apiKey,
    baseURL,
    json: true,
    messages: [
      {
        role: "system",
        content:
          "You are a senior video producer and CLI assistant. Return valid JSON only, with no markdown fences. Follow the provided production rules and do not invent unsupported factual claims.",
      },
      {
        role: "user",
        content: `Reference rules:\n\n${references}\n\nUser brief language: ${language}\n\nCreate a video production package from this brief:\n\n${brief}\n\nReturn JSON with keys: brief, script, shot_plan, subtitle_notes, production_notes.`,
      },
    ],
  });
  return videoPlanSchema.parse(parseJson(content));
}

export async function rewriteForNarration({ input, language = "zh-CN", model, provider, apiKey, baseURL }) {
  const references = await loadReferenceContext(["spoken-scriptwriting.md"]);

  const content = await createChatCompletion({
    provider,
    model,
    apiKey,
    baseURL,
    messages: [
      {
        role: "system",
        content:
          "Rewrite written content into natural spoken narration for video. Preserve claims, names, examples, and caveats. Return only the narration body.",
      },
      {
        role: "user",
        content: `Language: ${language}\n\nRules:\n${references}\n\nSource:\n${input}`,
      },
    ],
  });
  return content;
}

function parseJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI provider did not return valid JSON.");
    return JSON.parse(match[0]);
  }
}
