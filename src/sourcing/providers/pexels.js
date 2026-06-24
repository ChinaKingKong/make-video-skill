export async function searchPexelsVideos({ query, count = 5, orientation }) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return { provider: "pexels", ok: false, missingKey: "PEXELS_API_KEY", results: [] };

  const url = new URL("https://api.pexels.com/videos/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(Math.min(count, 15)));
  if (orientation) url.searchParams.set("orientation", orientation);

  const response = await fetch(url, { headers: { Authorization: apiKey } });
  if (!response.ok) {
    return { provider: "pexels", ok: false, error: await response.text(), results: [] };
  }

  const data = await response.json();
  return {
    provider: "pexels",
    ok: true,
    results: (data.videos || []).map((video) => {
      const file = choosePexelsFile(video.video_files || []);
      return {
        provider: "pexels",
        id: String(video.id),
        title: video.url,
        pageUrl: video.url,
        downloadUrl: file?.link,
        width: file?.width,
        height: file?.height,
        duration: video.duration,
        author: video.user?.name || "Pexels contributor",
        license: "Pexels License; verify current terms before commercial reuse.",
      };
    }).filter((item) => item.downloadUrl),
  };
}

function choosePexelsFile(files) {
  return [...files]
    .filter((file) => file.file_type === "video/mp4" && file.link)
    .sort((a, b) => scoreFile(a) - scoreFile(b))[0];
}

function scoreFile(file) {
  const width = file.width || 0;
  const height = file.height || 0;
  const pixels = width * height;
  return Math.abs(pixels - 1280 * 720);
}
