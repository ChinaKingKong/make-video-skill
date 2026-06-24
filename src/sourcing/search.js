import { searchPexelsVideos } from "./providers/pexels.js";
import { searchPixabayVideos } from "./providers/pixabay.js";

export async function searchFootage({ query, count = 5, ratio = "16:9" }) {
  const orientation = ratio.startsWith("9:16") ? "portrait" : ratio.startsWith("1:1") ? "square" : "landscape";
  const providerResults = await Promise.all([
    searchPexelsVideos({ query, count, orientation }),
    searchPixabayVideos({ query, count }),
  ]);

  const results = dedupe(
    providerResults.flatMap((result) => result.results || []),
  ).slice(0, count);

  return {
    query,
    results,
    providerResults,
    fallbackSources: fallbackSources(query),
  };
}

export function extractSearchQuery({ query, brief, shotPlan }) {
  if (query) return query;
  const source = `${brief || ""}\n${shotPlan || ""}`;
  const match = source.match(/(?:AI|人工智能|工具|产品|科技|演示|短视频|数据|创作者|自动化)[^\n。；;]{0,30}/i);
  return (match?.[0] || source.split(/\s|\n|。|，/).filter(Boolean).slice(0, 8).join(" ") || "technology product demo").trim();
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.pageUrl || item.downloadUrl;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function fallbackSources(query) {
  const encoded = encodeURIComponent(query);
  return [
    { name: "Mixkit", url: `https://mixkit.co/free-stock-video/${encoded}/`, note: "Manual fallback; verify license and download terms." },
    { name: "Coverr", url: `https://coverr.co/search?q=${encoded}`, note: "Manual fallback; verify license and download terms." },
    { name: "Videvo", url: `https://www.videvo.net/search/${encoded}/`, note: "Manual fallback; attribution may be required." },
    { name: "爱给网", url: `https://www.aigei.com/s?q=${encoded}`, note: "Manual fallback; check login, watermark, and commercial-use terms." },
  ];
}
