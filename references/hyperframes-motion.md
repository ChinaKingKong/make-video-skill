# HyperFrames Motion

Use HyperFrames through the local `html-video` checkout when the edit needs polished animated HTML/CSS/GSAP visuals instead of only FFmpeg filters or static overlays.

## Trigger Cases

Route here for:

- Kinetic title cards, section cards, end cards, logo outros, glitch/typewriter text, light leaks, or visual transition stingers.
- Animated subtitles, keyword hits, lower thirds, callouts, progress accents, UI labels, timeline markers, or data cards.
- Explainer or promo scenes that benefit from reusable HTML video templates.
- Link/article/repo-to-video drafts where `html-video` can create multi-frame animated storyboards.
- Local motion assets that will later be composited into a larger `make-video` edit or placed into a JianYing draft.

Do not route here for simple cuts, audio-only replacement, basic burned-in captions, lip-sync, or tasks that already require JianYing-native editable effects.

## Local Backend

Prefer the local project:

```bash
cd ~/Documents/Works/Agents/Handle/html-video
pnpm install
pnpm -r build
node packages/cli/dist/bin.js doctor
node packages/cli/dist/bin.js search-templates --intent "kinetic title card" --top 5
```

If the CLI is already built, skip install/build unless commands fail or package files changed. Treat this checkout as a backend dependency, not as a place for one-off project outputs.

Useful commands:

```bash
node packages/cli/dist/bin.js project-create --name "motion-layer" --intent "animated title and callouts" --aspect 16:9
node packages/cli/dist/bin.js project-set-template <project_id> --template <template_id>
node packages/cli/dist/bin.js project-set-var <project_id> --key headline --value '"Main headline"'
node packages/cli/dist/bin.js project-preview <project_id>
node packages/cli/dist/bin.js project-render <project_id> --output /absolute/path/to/render/hyperframes_scene.mp4
```

Use `node packages/cli/dist/bin.js studio --port 3071` only when interactive template choice or visual inspection is useful.

## Integration Pattern

For a normal `make-video` project:

1. Keep the main video project folder separate from the `html-video` repository.
2. Add `motion_plan.md` when HyperFrames is part of the work. List each animated scene/overlay, timing, template id, input variables, and where it lands in the edit.
3. Render HyperFrames scenes to `render/hyperframes_<slug>.mp4`.
4. If the asset must overlay footage, prefer an alpha-capable HyperFrames output such as WebM-alpha or PNG sequence when the backend exposes it, then composite with FFmpeg. If the available CLI path only returns MP4, render a solid keyable background or alpha-ready design, key it carefully, and verify edges after compositing.
5. For standalone animated sections, insert the rendered MP4 directly into the base visual timeline.
6. For JianYing projects, import HyperFrames renders as separate tracks named `HyperFrames_Title`, `HyperFrames_Callouts`, or `HyperFrames_Stingers` instead of baking them into a duplicated final video.

## Timing Rules

- Treat final narration or fitted audio as the timing spine.
- Time HyperFrames beats to subtitle/callout timestamps, not to rough script paragraphs.
- For multi-scene renders, verify exact duration with `ffprobe`; mixed-engine concat can drift if timestamps are not rebuilt.
- If combining HyperFrames with Remotion or other rendered segments, use FFmpeg concat filter with separate inputs to rebuild the timeline, then run full decode verification.

## Design Rules

- Use HyperFrames for motion with a clear job: orient, emphasize, transition, explain, or brand.
- Keep animated text readable on the target ratio, especially 9:16 mobile safe areas.
- Avoid stacking HyperFrames captions over dense source captions or small UI text. Reframe the footage or add a backing panel.
- Keep source, template id, variables, rendered output path, and license/provenance notes in `motion_plan.md` or `footage_manifest.md`.

## QC

After rendering:

- Run `ffprobe` on every HyperFrames MP4.
- Extract early/middle/late frames and inspect for blank frames, font jumps, text overflow, wrong safe margins, and timing mismatch.
- For opening title cards, inspect around 0.1s as well as the first full second; exported MP4 can reveal font/timing issues hidden by browser preview caches.
- When composited over footage, inspect the final composite, not only the standalone HyperFrames render.

## Fallback

If HyperFrames/html-video is unavailable, fails to build, or renders blank output:

- Use the programmatic overlay fallback in `references/qc-and-fallbacks.md` for captions, lower thirds, callouts, and simple motion.
- Label the result as local-render or preview-only when the brief asked for polished HyperFrames motion.
- Preserve `motion_plan.md`, template choices, and input variables so the HyperFrames layer can be regenerated later.
