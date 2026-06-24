# QC And Fallbacks

## Visual Design Checks

Avoid flat slideshow-like output unless requested. Match motion and pacing to format:

- Title cards: kinetic entry and clean exit.
- Lower thirds: identify people, places, products, data, or sections.
- Captions/subtitles: readable line breaks, safe margins, subtle fades/wipes.
- Callouts: timed emphasis for numbers, dates, names, product features, or actions.
- Transitions: purposeful cuts, crossfades, dips, wipes, match cuts, or quick motion transitions; do not overuse one transition.
- Layout: adapt to 16:9, 9:16, 1:1, or 4:5. Keep text clear on mobile.
- Branding: use supplied brand assets and style. If absent, choose a restrained style that fits the subject.

## HyperFrames Motion Checks

When HyperFrames/html-video is used, also verify:

- Template intent matches the scene: title card, data card, VFX text, lower third, transition stinger, or outro.
- Rendered MP4 duration matches the slot in `motion_plan.md`.
- Early frames are not blank and do not show font loading jumps.
- Text remains readable after compositing over the base footage.
- Multi-engine renders or mixed HyperFrames/other segments are concat-filtered and full-decoded, not only checked for file existence.

## Programmatic Overlay Fallback

If HyperFrames/html-video is unavailable, FFmpeg lacks `ass`, `subtitles`, or `drawtext` filters, or ASS/subtitle path handling fails, render animated graphics and captions into a transparent overlay video instead of blocking the edit.

Reliable pattern:

1. Generate RGBA frames with PIL, Canvas, or another local renderer.
2. Pipe frames to FFmpeg.
3. Encode as an alpha-capable MOV such as `qtrle` or ProRes 4444.
4. Composite it over the base render with FFmpeg `overlay`.

Use this for title animation, lower thirds, keyword/data callouts, dynamic subtitles, progress accents, and transition flashes.

Keep project-specific overlay scripts in the project folder, not inside the skill. When the source video already contains visible captions or dense UI text, inspect contact sheets or screenshots first, then crop/reframe, choose cleaner segments, or add a dark translucent panel behind new text.

## Final Verification

Always verify final media:

- Run `ffprobe` for duration, resolution, codecs, audio stream, and file metadata.
- Extract early, middle, and late QC frames for longer videos.
- Inspect first frame when the user requested a cover or opening visual.
- Check subtitle readability, safe margins, overlap with faces/UI/product details, and caption sync.
- Confirm audio is present, intelligible, and not doubled.
- Confirm final response uses absolute paths and embeds playable video in Codex desktop when available.

## Downgrade Rules

If a blocker prevents the requested output:

- State the blocker concretely.
- Label any fallback as preview-only, partial, or local-render-only.
- Preserve layered assets so the requested finished version remains reachable.
- Do not call a simplified FFmpeg output finished when the user asked for sourced footage, motion graphics, JianYing draft, or polished edit.
