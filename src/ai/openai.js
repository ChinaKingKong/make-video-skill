import { z } from "zod";
import { createChatCompletion, hasProviderKey } from "./providers.js";
import { loadReferenceContext } from "../workflow/resources.js";

const textField = z.preprocess((value) => stringifyStructuredValue(value), z.string());

const videoPlanSchema = z.object({
  brief: textField,
  script: textField,
  shot_plan: textField,
  subtitle_notes: textField,
  production_notes: textField,
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

function stringifyStructuredValue(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map((item, index) => formatStructuredItem(item, index)).join("\n\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `## ${key}\n\n${stringifyStructuredValue(item)}`)
      .join("\n\n");
  }
  if (value == null) return "";
  return String(value);
}

function formatStructuredItem(item, index) {
  if (typeof item === "string") return `${index + 1}. ${item}`;
  if (item && typeof item === "object") {
    const title = item.title || item.name || item.scene || item.section || `Item ${index + 1}`;
    const body = Object.entries(item)
      .filter(([key]) => !["title", "name", "scene", "section"].includes(key))
      .map(([key, value]) => `- ${key}: ${inlineValue(value)}`)
      .join("\n");
    return `### ${title}${body ? `\n\n${body}` : ""}`;
  }
  return `${index + 1}. ${String(item)}`;
}

function inlineValue(value) {
  if (Array.isArray(value)) return value.map((item) => inlineValue(item)).join("; ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "");
}
