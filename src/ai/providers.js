import OpenAI from "openai";

const providerDefaults = {
  openai: {
    model: "gpt-4.1-mini",
    apiKeyEnv: "OPENAI_API_KEY",
    baseURL: "https://api.openai.com/v1",
    jsonMode: true,
  },
  deepseek: {
    model: "deepseek-chat",
    apiKeyEnv: "DEEPSEEK_API_KEY",
    baseURL: "https://api.deepseek.com",
    jsonMode: true,
  },
  glm: {
    model: "glm-4-flash",
    apiKeyEnv: "GLM_API_KEY",
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    jsonMode: true,
  },
  minimax: {
    model: "MiniMax-Text-01",
    apiKeyEnv: "MINIMAX_API_KEY",
    baseURL: "https://api.minimax.chat/v1",
    jsonMode: true,
  },
  claude: {
    model: "claude-3-5-haiku-latest",
    apiKeyEnv: "ANTHROPIC_API_KEY",
    baseURL: "https://api.anthropic.com/v1",
    jsonMode: false,
  },
};

export function listProviders() {
  return Object.keys(providerDefaults);
}

export function resolveProvider(options = {}) {
  const provider = normalizeProvider(options.provider || process.env.MAKE_VIDEO_AI_PROVIDER || "openai");
  const defaults = providerDefaults[provider];
  if (!defaults) {
    throw new Error(`Unsupported AI provider: ${provider}. Supported providers: ${listProviders().join(", ")}`);
  }

  const apiKeyEnv = options.apiKeyEnv || defaults.apiKeyEnv;
  const apiKey = options.apiKey || process.env[apiKeyEnv];
  return {
    provider,
    model: options.model || process.env.MAKE_VIDEO_AI_MODEL || defaults.model,
    baseURL: options.baseURL || process.env.MAKE_VIDEO_AI_BASE_URL || defaults.baseURL,
    apiKey,
    apiKeyEnv,
    jsonMode: defaults.jsonMode,
  };
}

export function hasProviderKey(providerName) {
  const provider = providerDefaults[normalizeProvider(providerName)];
  return provider ? Boolean(process.env[provider.apiKeyEnv]) : false;
}

export function configuredProviders() {
  return Object.fromEntries(
    Object.entries(providerDefaults).map(([name, config]) => [
      name,
      {
        ok: Boolean(process.env[config.apiKeyEnv]),
        required: false,
        apiKeyEnv: config.apiKeyEnv,
        defaultModel: config.model,
        detail: process.env[config.apiKeyEnv]
          ? `${config.apiKeyEnv} is set`
          : `${config.apiKeyEnv} is not set`,
      },
    ]),
  );
}

export async function createChatCompletion(options) {
  const provider = resolveProvider(options);
  if (!provider.apiKey) {
    throw new Error(`${provider.apiKeyEnv} is required for provider "${provider.provider}".`);
  }

  if (provider.provider === "claude") {
    return createClaudeCompletion(provider, options.messages);
  }

  const client = new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
  });
  const request = {
    model: provider.model,
    messages: options.messages,
  };
  if (options.json && provider.jsonMode) {
    request.response_format = { type: "json_object" };
  }
  const response = await client.chat.completions.create(request);
  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error(`${provider.provider} returned an empty response.`);
  return content;
}

async function createClaudeCompletion(provider, messages) {
  const system = messages.find((message) => message.role === "system")?.content || "";
  const userContent = messages
    .filter((message) => message.role !== "system")
    .map((message) => message.content)
    .join("\n\n");

  const response = await fetch(`${provider.baseURL}/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": provider.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`claude request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data.content
    ?.map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
  if (!content) throw new Error("claude returned an empty response.");
  return content;
}

function normalizeProvider(provider) {
  const value = String(provider).toLowerCase();
  if (value === "anthropic") return "claude";
  if (value === "zhipu" || value === "bigmodel") return "glm";
  return value;
}
