# Production Workflows

## Project Layout

Use a fresh project folder. Include only artifacts needed for the job:

- `brief.md`: goal, format, constraints, style, deliverables
- `script.md` or `narration.txt`: script or voiceover text
- `shot_plan.md`: scene-by-scene plan for sourced or generated visuals
- `sources.md`: factual sources when research is used
- `footage_manifest.md`: media sources, license notes, and scene mapping
- `footage/`: clips, images, screenshots, brand assets, generated visuals
- `sfx/`: transition and emphasis sound effects
- `audio/`: narration, music, fitted voiceover, and final mix
- `subtitles.srt` and/or `subtitles.ass`: timed subtitles
- `base_composed.mp4`: edited visual track before final audio when useful
- `render/overlay.mov`: optional transparent motion graphics and caption overlay
- `motion_plan.md`: HyperFrames/html-video scenes, templates, variables, timings, and layer mapping when using animated HTML motion
- `render/hyperframes_<slug>.mp4`: rendered HyperFrames/html-video title cards, callouts, stingers, data scenes, or reusable motion layers
- `jianying_draft/`: JianYing project output when using that backend
- `final.mp4`: final user-facing video

## Brief To Edit

1. Identify the job type: create from scratch, edit existing footage, add voiceover, make a social cut, create a product/demo video, build a narrated explainer, assemble a montage, or package final media.
2. Clarify only missing constraints that materially change the result: aspect ratio, duration, language, tone, target platform, source assets, rights constraints, voice reference, subtitles, and export format.
3. If factual claims are required, research current sources and save `sources.md`. If the task is creative, promotional, or based on supplied assets, skip heavy research and focus on story, pacing, and visual treatment.
4. Build a script, outline, or shot plan appropriate to the job. If adapting an article or written draft into narration, read `spoken-scriptwriting.md` first and write `narration.txt` as a natural spoken script before timing subtitles or TTS. For narration-heavy 2 minute Chinese videos, 650-850 Chinese characters is a useful starting range.
5. Edit the visual track: trim, arrange, crop, stabilize if needed, add overlays, animated text, lower thirds, subtitles/captions, transitions, color adjustments, and scene pacing. Use `hyperframes-motion.md` for polished HTML/CSS/GSAP title cards, data cards, callouts, kinetic text, or transition stingers.
6. Build the audio track: TTS/voiceover, original audio cleanup, music, ambience, and sound effects. Duck music and SFX under speech.
7. Render, export, or mux. Copy streams only for simple audio replacement; re-encode when visual effects, overlays, subtitles, transitions, or resizing are added.

## Article To Spoken Narration

Use this pattern when the user provides an article, report, outline, transcript, or written draft and wants a video, voiceover, narrated explainer, short social clip, or TTS-ready script:

1. Read `spoken-scriptwriting.md` before rewriting the text.
2. Preserve the source's core viewpoint, examples, people, brands, and data. Do not add unsupported facts.
3. Convert written logic into spoken beats: hook, context, 2-4 key points, transition lines, conclusion, and optional call to action.
4. Write the result into `narration.txt` or `script.md` with paragraph breaks for breathing. Use the spoken script as the timing spine for TTS, subtitles, shot planning, and overlays.
5. If the source has many bullet points, merge them into the most important spoken sequence rather than reading a long list verbatim.
6. When numbers, symbols, or professional terms appear, make the spoken reading explicit so TTS and human voiceover do not need to guess pronunciation.

## Long Narrated Explainer Pattern

For 3-10 minute narrated explainers, especially Chinese technology/news analysis videos:

1. Write a tight narration script first, then create `shot_plan.md` from the argument structure. For about 5 minutes of Chinese narration, expect roughly 1,000-1,300 Chinese characters depending on voice speed and pauses.
2. Source b-roll as visual metaphors plus evidence shots: AI chips, terminals, data centers, networks, typing, dashboards, product pages, official press kit assets, or verified social clips.
3. Render the visual base without audio as `base_composed.mp4`. Keep it clean enough to stand alone under a transparent graphics layer.
4. Generate voiceover with IndexTTS or the selected TTS backend, then fit to target duration with a modest `atempo` adjustment. Treat the fitted narration as the timing source for all subtitles and overlays.
5. Render title animation, lower thirds, callouts, progress accents, and dynamic subtitles into `render/overlay.mov`; when these need richer motion or reusable templates, render HyperFrames/html-video scenes into `render/hyperframes_<slug>.mp4` and composite or insert them into the timeline.
6. Mux `base_composed.mp4` + `render/overlay.mov` + fitted narration into `final.mp4`.
7. If a JianYing draft is requested, create clean layered tracks: `Base_Footage`, `Animated_Captions`, and `Narration`. Avoid adding `final.mp4` plus narration again, which causes doubled audio.
8. After feedback on graphics positions or subtitle styling, change only the overlay script and re-render `overlay.mov` + `final.mp4`; do not re-download footage or re-synthesize speech unless the content changed.

## Social Tool Demo Pattern

For 45-90 second social clips that demonstrate AI tools, coding workflows, apps, prompt recipes, or creator automations:

1. Read `social-reference-patterns.md` when the user provides a Douyin/TikTok/Bilibili/Shorts reference or asks to imitate a short-video style.
2. Start with the finished result, then explain the workflow. A useful sequence is: result hook, host credibility cue, 3-5 workflow beats, evidence shot, recap, CTA.
3. Use narration as the timing spine. Build bottom-center subtitles first, then add keyword highlights, screen overlays, cursor/zoom emphasis, and SFX hits around the subtitles. Use HyperFrames for result-first title cards, typed command reveals, visual proof cards, and reusable transition stingers when the clip needs higher motion polish.
4. Prefer fresh screen capture or user-owned screenshots for tool evidence. Crop to the decision area, enlarge small UI text, and mask private content.
5. For digital-human or talking-head host clips, use a stable presenter shot plus floating UI overlays; route to InfiniteTalk only when visible mouth synchronization with new audio is required.
6. Keep a `reference_breakdown.md` when a source video drove the style, with metadata, timestamped beats, visual system, audio system, and legal rebuild notes.

## Layered Revision Pattern

Patch the smallest changed layer:

- User stills or screenshots: copy supplied images into `user_assets/`; use a cover image as the first visual segment when asked, and insert phone screenshots as centered picture-in-picture segments with a blurred/cropped background.
- Subtitle punctuation changes: keep original narration punctuation for timing, but strip punctuation only from displayed captions and sidecar SRT body lines. SRT timestamps contain punctuation by design.
- Voiceover dissatisfaction or TTS wording fixes: update the final narration text, back up the previous full `voiceover_raw.wav`, regenerate the entire voiceover as one continuous WAV, then rebuild mix, subtitles, overlays, and final mux.
- Treat the rebuilt voiceover duration as the timing source. If duration changed, rebuild the base visual timeline (`base_composed.mp4`) before regenerating overlays or final output.
- Cache invalidation: when assets, timing, subtitles, audio, or HyperFrames variables change, force rebuild stale `base_composed.mp4`, `render/overlay.mov`, `render/hyperframes_*.mp4`, `audio/final_mix.wav`, `render/with_graphics.mp4`, and `final.mp4`.
- JianYing sync: after local render changes, rebuild the editable draft so it points at the latest base video, narration mix, and subtitles.
- QC: extract and inspect first frame plus early/middle/late frames. For inserted vertical screenshots, also extract a timestamp inside each inserted segment.
