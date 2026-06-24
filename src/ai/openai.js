import OpenAI from "openai";
import { z } from "zod";
import { loadReferenceContext } from "../workflow/resources.js";

const videoPlanSchema = z.object({
  brief: z.string(),
  script: z.string(),
  shot_plan: z.string(),
  subtitle_notes: z.string(),
  production_notes: z.string(),
});

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function generateVideoPlan({ brief, language = "zh-CN", model = "gpt-4.1-mini" }) {
  const client = createClient();
  const references = await loadReferenceContext([
    "production-workflows.md",
    "spoken-scriptwriting.md",
    "captions-audio.md",
    "sourcing.md",
    "qc-and-fallbacks.md",
  ]);

  const response = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a senior video producer and CLI assistant. Return valid JSON only. Follow the provided production rules and do not invent unsupported factual claims.",
      },
      {
        role: "user",
        content: `Reference rules:\n\n${references}\n\nUser brief language: ${language}\n\nCreate a video production package from this brief:\n\n${brief}\n\nReturn JSON with keys: brief, script, shot_plan, subtitle_notes, production_notes.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty response.");
  return videoPlanSchema.parse(JSON.parse(content));
}

export async function rewriteForNarration({ input, language = "zh-CN", model = "gpt-4.1-mini" }) {
  const client = createClient();
  const references = await loadReferenceContext(["spoken-scriptwriting.md"]);

  const response = await client.chat.completions.create({
    model,
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

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenAI returned an empty narration.");
  return content;
}

function createClient() {
  if (!hasOpenAIKey()) {
    throw new Error("OPENAI_API_KEY is required for this command.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
