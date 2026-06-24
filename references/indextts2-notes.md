# IndexTTS2 Notes

## Practical setup

- Default local checkout: `/Users/lizhigang/Library/index-tts`. Prefer this via `INDEXTTS_HOME` before cloning or installing another copy.
- This checkout has a `uv` environment, IndexTTS-2 checkpoints under `checkpoints/`, auxiliary models under `checkpoints/hf_cache/`, and has been validated on Apple MPS with a short synthesis test.
- Prefer the CLI over WebUI for production runs. WebUI can spend a long time initializing on Apple Silicon before it starts listening.
- Check import and device availability:

```bash
cd "${INDEXTTS_HOME:-/Users/lizhigang/Library/index-tts}"
uv run python -c "import torch, torchaudio, indextts; print(torch.__version__, torchaudio.__version__); print('mps', torch.backends.mps.is_available())"
```

- Use `--device mps` on Apple Silicon only after a short synthesis test succeeds. Fall back to CPU for unsupported MPS ops.
- For IndexTTS2, instantiate via CLI or `indextts.infer_v2.IndexTTS2` with `use_fp16=False`, `use_cuda_kernel=False`, and `use_deepspeed=False` on Mac.

## Model and cache layout

The main model normally lives under `checkpoints/` and includes files such as:

- `config.yaml`
- `gpt.pth`
- `s2mel.pth`
- `bpe.model`
- `qwen0.6bemo4-merge/model.safetensors`

Auxiliary files may be expected under `checkpoints/hf_cache/`, including:

- `semantic_codec_model.safetensors`
- `campplus_cn_common.bin`
- `w2v-bert-2.0/model.safetensors`
- `bigvgan/config.json`
- `bigvgan/bigvgan_generator.pt`

If downloads fail from one source, try the official Hugging Face repo, ModelScope, or the specific mirror used by the project. Validate `.safetensors` after interrupted downloads:

```bash
uv run python - <<'PY'
from safetensors import safe_open
for p in [
  "checkpoints/qwen0.6bemo4-merge/model.safetensors",
  "checkpoints/hf_cache/semantic_codec_model.safetensors",
  "checkpoints/hf_cache/w2v-bert-2.0/model.safetensors",
]:
    print("checking", p)
    with safe_open(p, framework="pt", device="cpu") as f:
        print("ok", len(f.keys()))
PY
```

If a large file is corrupted, move it aside rather than deleting it, then redownload. This avoids accidentally destroying a user-provided artifact.

## Voice reference behavior

IndexTTS may print warnings such as "Audio too long, truncating". This is expected when the reference voice file is long; the model extracts a usable prompt segment.

For production voiceover, keep the narration as one complete input file and generate one continuous WAV in a single IndexTTS run. Do not manually split text into segment files or concatenate generated chunks unless the user explicitly requests segmented output. Long narrations can be quiet for 30-60 seconds between progress bars; do not assume the process is hung if it is still alive and prior short synthesis succeeded.

## Duration alignment

The generated narration often differs from the video length. Use `ffprobe` for exact durations:

```bash
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 final_video.mp4
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 tts_narration.wav
```

Apply `atempo = audio_duration / video_duration` to make audio fit the video. A modest factor, such as 0.93 or 1.07, usually remains natural for narrated explainers.
