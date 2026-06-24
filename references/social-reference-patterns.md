# Social Reference Patterns

Use this when the user provides a Douyin/TikTok/Bilibili/X/YouTube Shorts link as a style reference, asks to copy the structure of a social clip, or asks to extract elements from a short video before making a new video.

## Reference Extraction

Extract reusable production signals, not copyrighted media:

- Link and platform: original short URL, resolved canonical URL, item/video ID, uploader, visible publish time, and visible rights or AI-content labels.
- Format: aspect ratio, rendered size, duration, fps, audio duration, source quality, watermark status, and whether the clip is horizontal inside a vertical feed or native vertical.
- Hook: first 1-3 seconds, proof/result shown first, curiosity gap, visible claim, or creator positioning.
- Scene structure: timestamped beats, presenter shots, screen recordings, screenshots, product UI, text cards, b-roll, and ending CTA.
- Visual system: presenter placement, background, overlay positions, subtitle style, keyword colors, callouts, arrows, zooms, cursor movements, and watermarks.
- Audio system: voice type, music/SFX level, pauses, speech density, subtitle timing, and whether audio is original, TTS, dubbed, or lip-synced.
- Rebuild plan: legal replacement assets, user-owned screenshots, generated presenter/voice, fresh screen capture, new script, and new overlay graphics.

Record these in `sources.md` or `reference_breakdown.md`. If a platform blocks download, use the visible metadata, screenshots, and user-supplied observations; do not claim frame-level analysis was completed.

## Tool-Demo Digital Human Pattern

Use for short videos that teach an AI tool, coding workflow, app feature, prompt recipe, or creator automation through a presenter plus screen overlays.

Recommended structure for a 45-90 second clip:

1. Result-first hook, 3-6s: show the finished output or bold promise before explaining the process.
2. Credibility cue, 4-8s: show the presenter or digital human in a stable host shot, then name the exact tool/workflow.
3. Workflow steps, 20-45s: split into 3-5 beats; each beat gets one screen overlay, one keyword phrase, and one subtitle line.
4. Evidence shot, 8-15s: show the actual UI, prompt, terminal, search result, render, or draft timeline instead of describing it abstractly.
5. Compression recap, 5-8s: put the step names on screen together, then land on the main takeaway.
6. CTA, 3-6s: ask for follow, comment keyword, or next-step action only after the value is visible.

Visual recipe:

- Keep a stable presenter background for continuity; place screen overlays in the upper side or center, never over the mouth or subtitle baseline.
- Use bottom-center subtitles as the timing spine. Highlight only the 1-3 words that carry the current beat.
- Use large keyword cards sparingly for turning points, usually 2-4 times per minute.
- For screen overlays, crop to the decision area and enlarge text enough for mobile. Blur or mask irrelevant/private content.
- Alternate between presenter-only, presenter plus overlay, and full/near-full screen capture so the rhythm does not become static.
- Leave brand/platform watermarks only when they come from the reference during analysis; rebuilds should use original assets or licensed/user-owned captures.

Audio recipe:

- Treat narration as the master clock. Keep speech dense but leave short pauses at scene changes.
- Duck music under speech. Use light click, pop, or whoosh SFX only for overlay entrances or keyword hits.
- If the presenter is generated or dubbed, route visible-speaker lip-sync tasks through the InfiniteTalk sibling skill only when mouth synchronization matters.

## Extracted Reference: Douyin `7653757447386975529`

Source observed on 2026-06-22 from `https://v.douyin.com/4lU8L5LEmE0/`, resolved to `https://www.iesdouyin.com/share/video/7653757447386975529/`.

Visible metadata:

- Title/description: `Codex 视频制作拆解 这是我用codex做的数字人口播。选题->数字人口播->字幕效果->剪辑`
- Uploader: `Luoni_阿东Ai`
- Tags: `codex`, `codex安装`, `CCSWITCH`, `Codexplusplus`
- AI/content label: author declared the content is AI-generated.
- SSR video metadata: 1920x1080 source dimensions, about 70.264s video duration, original sound about 70s.
- Downloaded analysis stream: 1280x720, 30fps, about 73.28s, watermarked.

Reusable production elements:

- Digital-human host seated at a desk, medium shot, dark office/study background, stable camera.
- Opening line establishes that the speaker is not a real person, then pivots into how the video was made.
- The value promise is a workflow: topic selection, digital-human talking head, subtitles, and editing.
- Overlays include document/prompt screenshots, search or result pages, and app/tool interface cards.
- Subtitles are bottom-center, high contrast, with yellow emphasis on keywords.
- Larger cyan/green keyword cards appear for the main action words, such as preview, split-shot, and execution-style beats.
- The edit rhythm alternates presenter-only shots with presenter plus floating UI panels.
- Ending uses the Douyin profile/search follow card as CTA.

When recreating this style, do not reuse the downloaded clip. Rebuild the pattern with a new script, user-owned or freshly captured tool screens, original subtitles/overlays, and a generated or user-provided presenter/voice.
