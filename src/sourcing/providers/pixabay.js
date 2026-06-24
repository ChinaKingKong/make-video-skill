export async function searchPixabayVideos({ query, count = 5 }) {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) return { provider: "pixabay", ok: false, missingKey: "PIXABAY_API_KEY", results: [] };

  const url = new URL("https://pixabay.com/api/videos/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("per_page", String(Math.min(Math.max(count, 3), 20)));
  url.searchParams.set("safesearch", "true");

  const response = await fetch(url);
  if (!response.ok) {
    return { provider: "pixabay", ok: false, error: await response.text(), results: [] };
  }

  const data = await response.json();
  return {
    provider: "pixabay",
    ok: true,
    results: (data.hits || []).map((video) => {
      const file = choosePixabayFile(video.videos || {});
      return {
        provider: "pixabay",
        id: String(video.id),
        title: video.tags || `Pixabay video ${video.id}`,
        pageUrl: video.pageURL,
        downloadUrl: file?.url,
        width: file?.width,
        height: file?.height,
        duration: video.duration,
        author: video.user || "Pixabay contributor",
        license: "Pixabay Content License; verify current terms before commercial reuse.",
      };
    }).filter((item) => item.downloadUrl),
  };
}

function choosePixabayFile(videos) {
  return [videos.medium, videos.small, videos.large, videos.tiny]
    .filter(Boolean)
    .sort((a, b) => Math.abs((a.width || 0) * (a.height || 0) - 1280 * 720) - Math.abs((b.width || 0) * (b.height || 0) - 1280 * 720))[0];
}
