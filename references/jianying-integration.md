# JianYing Integration

Use the installed `jianying-editor` skill as backend when the user asks for 剪映/JianYing automation, an editable 剪映草稿, JianYing-native subtitles/effects/transitions/music, automated draft assembly, screen recording plus smart zoom, or workflows that benefit from editing inside JianYing Pro.

Before using this backend, read the sibling skill at `../jianying-editor/SKILL.md`, then load only the relevant rule files it points to:

- Media import, cloud videos, and timeline assembly: `rules/media.md`
- Subtitles, text, and captions: `rules/text.md`
- TTS, BGM, and narrated subtitles: `rules/audio-voice.md`
- Filters, effects, and transitions: `rules/effects.md`
- Keyframe animation: `rules/keyframes.md`
- Screen recording and smart zoom: `rules/recording.md`
- Draft saving, export, and project management: `rules/core.md` and `rules/cli.md`
- Generative or movie-commentary editing: `rules/generative.md`

## Integration Rules

- Do not create business editing scripts inside the `jianying-editor` skill directory. Put project-specific Python scripts in the current project folder, such as `scripts/`.
- On macOS, treat JianYing export as experimental. Draft creation and path probing may work, but final export may require opening JianYing and exporting manually.
- On Windows with supported JianYing Pro versions, use `jianying-editor` export tools when the user wants automated export.
- If the user wants a direct final MP4 and does not need an editable JianYing draft, local FFmpeg/programmatic rendering may be faster and more predictable.
- For hybrid workflows, create assets, subtitles, voiceover, and SFX locally, then import them into a JianYing draft for native effects or manual finishing.
- If diagnostics, import, or export fail because of local dependencies such as missing `pymediainfo`, or because macOS export support is blocked/experimental, continue with a local render when a final MP4 is acceptable. Document the limitation and provide layered assets or a draft package when useful.

## Practical Failure Memory

- Verify `pymediainfo` and other required Python dependencies before promising JianYing draft generation.
- If IndexTTS or `uv` cache writes fail due to unwritable app-support/cache directories, redirect config/model/cache paths to project-local writable folders before long synthesis jobs.
- A simple FFmpeg fallback can be useful for preview, but do not present it as finished when the brief asked for real b-roll, animated subtitles, lower thirds, callouts, and polished motion design.
