# Captions And Audio

## Subtitles And Captions

Include subtitles by default for narrated, dialogue-heavy, educational, social, tutorial, voiceover, interview, product-demo, or mobile-first videos. Skip only when the user asks for a clean no-subtitle version or the video is intentionally visual-only.

Choose the subtitle form by delivery:

- Burned-in subtitles: best for social media, preview sharing, vertical videos, and muted viewing.
- Sidecar subtitles: create `.srt` for broad compatibility and `.ass` for styling, positioning, karaoke timing, or animation.
- Dynamic captions: use animated chunks, keyword emphasis, or phrase-by-phrase reveals for short-form social clips.
- Bilingual subtitles: use two-line layout or alternating captions when requested.

Rules:

- Time captions to the final voiceover/audio, not to an early draft script.
- Keep each caption short enough to read comfortably. Prefer one-line captions by default.
- For Chinese narration, split on clause punctuation such as `，：；。？！` and phrase boundaries. Convert long sentences into sequential one-line caption chunks. Aim for 12-18 Chinese characters per caption for dynamic/social subtitles and 18-24 for calmer documentary subtitles.
- Preserve English terms and spaces in mixed Chinese/English scripts. Do not split product names, model names, or code identifiers unless unavoidable.
- Merge very short fragments into adjacent captions when possible.
- When exact word timestamps are unavailable for TTS, distribute caption durations by read length plus punctuation pause weight, then scale the full caption timeline to fitted narration duration.
- Preserve safe margins, especially for 9:16 videos with platform UI overlays.
- Use a legible font with stroke/shadow or a subtle backing layer over busy footage.
- Avoid covering faces, product details, UI actions, lower thirds, or important footage.
- Check final render visually for wrapping, clipping, overlap, and sync. If a caption wraps, split it into two timed captions.

Use FFmpeg subtitle filters for simple burned-in captions or generate animated text in the composition script. If FFmpeg subtitle filters are unavailable, use the transparent overlay fallback in `references/qc-and-fallbacks.md`.

## Sound Design

- Use TTS/IndexTTS, a supplied narration track, recorded audio, or original clip audio depending on the brief.
- Add light sound effects for title reveals, transitions, clicks, hits, risers, data highlights, or UI actions.
- Add ambience or music only when it supports the tone.
- Keep narration intelligible. Duck music and SFX under speech.
- Normalize or limit the final mix enough to avoid harsh peaks.

## IndexTTS Voiceover

Use IndexTTS/IndexTTS2 when the user asks for text-to-speech, reference-voice cloning, or a narrated version. Use an existing checkout if the user gives one and it works; if the path is missing or broken, create or reuse a local checkout in the project workspace and say so.

First inspect `INDEXTTS_HOME`, defaulting to `~/Library/index-tts`, before rebuilding or recloning IndexTTS. This checkout already has the `uv` environment, IndexTTS-2 checkpoints, auxiliary cache, and Apple MPS validation. Unless the user changes it, `~/Downloads/Voices/新闻-铿锵.mp3` is the default voice reference for similar Chinese news/explainer runs.

Recommended IndexTTS2 CLI pattern:

```bash
cd "${INDEXTTS_HOME:-~/Library/index-tts}"
uv run python indextts/cli_v2.py synth \
  --text-file /abs/path/narration.txt \
  --voice /abs/path/reference_voice.mp3 \
  --output /abs/path/tts_narration.wav \
  --model-dir checkpoints \
  --device mps \
  --no-fp16 --no-deepspeed --no-cuda-kernel --force --verbose
```

First synthesize a short test sentence with the same voice reference. If MPS fails, retry with `--device cpu`. Do not start the WebUI unless the user specifically wants it.

For production narration, pass the final narration text as one complete `--text-file` and generate one continuous WAV in a single IndexTTS run. Do not manually split the narration into segment WAVs, concatenate chunks, or rebuild voiceover from partial TTS files unless the user explicitly asks for segmented audio. Long runs can take much longer than the final audio duration and may only write the WAV at the end; if progress logs keep advancing, treat the job as alive rather than hung.

If the synthesized narration is slightly too short or too long, use a moderate FFmpeg `atempo` adjustment, usually within `0.85-1.15`, to fit the target duration. Time subtitles and overlay beats to the fitted audio, not raw synthesis.

## Voiceover Repair

When the user says the voiceover has unnatural pauses, hard joins, or poor flow, treat it as audio reconstruction, not cosmetic crossfade work.

Preferred repair pattern:

1. Return to the final narration text and revise punctuation, sentence rhythm, or wording so one-pass synthesis flows better.
2. Re-synthesize the full narration as one continuous WAV with the same voice reference. Do not repair by cutting the script into chunks and stitching generated files.
3. Post-process the single WAV: trim leading/trailing mechanical silence, preserve natural pauses, level-match, and avoid edits that cut through syllables.
4. Fit rebuilt narration to visual duration with a modest `atempo` ratio. If outside roughly `0.85-1.15`, revise script length or visual duration.
5. Normalize fitted narration, for example with `loudnorm=I=-16:TP=-1.5:LRA=10`.
6. Verify with `ffprobe` and spot-check playback around early, middle, and late narration points.
7. Rebuild any JianYing draft so its `Narration` track and final-video reference point at repaired audio.

Operational lessons from long-form repair runs:

- Keep the TTS source text optimized for speech: natural punctuation, paragraph breaks, and pauses are allowed and often required. Generate display captions from the same final text, but strip punctuation only from caption body text. Do not feed punctuation-stripped captions to IndexTTS.
- Before replacing the main audio, preserve the unsatisfactory render and raw/final mix audio with versioned backup names.
- After one-pass IndexTTS succeeds, probe the new WAV duration and make it the timing spine. If it differs from the current visual track, rebuild `base_composed.mp4`; otherwise the video may cut off, freeze, or drift.
- Recreate `audio/final_mix.wav` from the new narration before rendering overlays. A stale final mix can silently put old speech under new captions.
- Regenerate SRT/ASS and dynamic caption overlays from the final text and the new duration, then mux `base_composed.mp4`, overlay media, and `final_mix.wav`.
- For "no punctuation" checks, inspect only SRT body lines; ignore numeric indices and `-->` timestamp lines because SRT timecodes contain commas and colons by design.
- Rebuild JianYing drafts after the local final is correct so draft tracks reference the repaired media.

## Audio Duration Fitting And Muxing

Use the bundled helper when replacing or fitting voiceover to an existing video:

```bash
python3 /path/to/skill/scripts/mux_tts_voiceover.py \
  --video /abs/path/base_video.mp4 \
  --audio /abs/path/voiceover.wav \
  --output /abs/path/final_video.mp4
```

The helper computes durations with `ffprobe`, applies an `atempo` chain when needed, writes a fitted WAV next to the output, muxes AAC audio with copied video, and prints final metadata.

For full edits with overlays/transitions, render the final visual track first, then use the helper only if audio still needs fitting.
