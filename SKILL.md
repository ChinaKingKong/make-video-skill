---
name: make-video
description: Create, edit, package, or repair videos. Use for videos, social clips, explainers, promos, product demos, montages, article-to-video narration scripts, subtitles/captions, voiceover, b-roll edits, animated text, audio replacement, lip-sync/talking-head clips, JianYing/剪映 drafts, HyperFrames/html-video motion layers, or final MP4. Supports sourcing, shot planning, spoken-script adaptation, IndexTTS/TTS, InfiniteTalk, captions, motion graphics, HyperFrames, FFmpeg, and JianYing. Exclude image-only, text-only writing with no video deliverable, generic advice, or research with no video deliverable.
---

# Make Video

This skill is also packaged as the `make-video` npm CLI. Users can run `npx make-video --help` for a general-purpose video production command line tool that creates project workspaces, generates scripts and shot plans with OpenAI, builds SRT subtitles, probes media, replaces or fits voiceover audio, and performs basic FFmpeg renders. IndexTTS is a required production voiceover backend; HyperFrames/html-video and JianYing are optional enhancement backends with documented fallback behavior. Treat the CLI as the public automation surface and the references below as the production knowledge base.

## Boundary

Use for video files, edited media, fitted audio, subtitles, layered renders, lip-sync/talking-head generation, article-to-video narration adaptation, or JianYing/剪映 drafts. Exclude standalone article writing, translation, source summaries, image-only generation, generic tool explanation, or brainstorming with no media output.

## Core Workflow

1. Capture only production-changing constraints: platform, ratio, duration, language, tone, assets, rights, voice, subtitles, export.
2. Choose local render, HyperFrames/html-video motion layer, JianYing/剪映, or hybrid. Local MP4 is the macOS source of truth unless JianYing export is verified.
3. Create a fresh project folder with `brief.md`; add `script.md`, `narration.txt`, `shot_plan.md`, `sources.md`, or `footage_manifest.md` only when needed. If the source is an article or written draft for narration, adapt it with `references/spoken-scriptwriting.md` before timing captions or TTS.
4. Prepare user assets first, then legal web/official/social footage, screenshots, generated visuals, music, SFX, and voice references.
5. Build visual, audio, captions, overlays, transitions, and layout. Use HyperFrames/html-video when polished HTML/CSS/GSAP motion, kinetic type, data cards, VFX text, title cards, or reusable animated frames are needed. Export `final.mp4`, sidecar subtitles, overlay assets, fitted audio, HyperFrames render assets, or JianYing draft.
6. Verify with `ffprobe` plus visual QC frames before final response.

## Reference Map

- CLI entrypoint: `bin/make-video.js`
- CLI implementation: `src/cli.js` and `src/commands/`
- FFmpeg media engine: `src/media/ffmpeg.js`
- OpenAI planning adapter: `src/ai/openai.js`
- Backend detection: `src/backends/detect.js` (IndexTTS required; HyperFrames/JianYing optional)
- Production/project layout: `references/production-workflows.md`
- Article/written draft to natural spoken narration: `references/spoken-scriptwriting.md`
- Footage and license-aware source routing: `references/sourcing.md`
- Social reference reverse-engineering and reusable short-video patterns: `references/social-reference-patterns.md`
- HyperFrames/html-video motion graphics and animated frame rendering: `references/hyperframes-motion.md`
- Subtitles, audio, IndexTTS, repair, muxing: `references/captions-audio.md`
- JianYing backend rules: `references/jianying-integration.md`
- Lip-sync backend: read sibling skill `../infinitetalk/SKILL.md` when a visible speaker must match new audio.
- Overlay fallback, final QC, downgrade rules: `references/qc-and-fallbacks.md`
- IndexTTS2 setup/debugging: `references/indextts2-notes.md`
- Local backend paths/env vars: `references/local-backends.md`
- Audio replacement helper: `scripts/mux_tts_voiceover.py`
- Route examples: `evals/trigger_cases.json`

## Quality Rules

- Produce files, not advice, when asked to make or edit a video.
- Treat each request as a fresh brief; do not reuse old footage, URLs, titles, timing, or project artifacts unless asked.
- Default to subtitles for narrated, dialogue-heavy, tutorial, educational, product-demo, social, or mobile-first videos.
- For article-to-video work, make the narration natural to say aloud before building TTS, subtitles, or shot timing; preserve core claims and do not invent facts.
- Record media source URLs, visible dates, license/permission notes, and reuse caveats.
- If blocked, label fallback output as preview-only or partial; do not call a simplified render finished when the brief asked for polished sourcing, motion, or JianYing packaging.

## Output Contract

Final responses include absolute paths. In Codex desktop, embed playable local video with Markdown image syntax.
