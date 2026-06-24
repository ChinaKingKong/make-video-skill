#!/usr/bin/env python3
"""Fit a TTS wav to a video's duration and mux it as the only audio track."""

from __future__ import annotations

import argparse
import json
import math
import subprocess
from pathlib import Path


def run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=True, text=True, capture_output=True)


def duration(path: Path) -> float:
    result = run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nk=1:nw=1",
            str(path),
        ]
    )
    return float(result.stdout.strip())


def atempo_chain(factor: float) -> str:
    parts: list[float] = []
    remaining = factor
    while remaining > 2.0:
        parts.append(2.0)
        remaining /= 2.0
    while remaining < 0.5:
        parts.append(0.5)
        remaining /= 0.5
    parts.append(remaining)
    return ",".join(f"atempo={p:.6f}" for p in parts)


def ffprobe_json(path: Path) -> dict:
    result = run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "stream=index,codec_type,codec_name,width,height,sample_rate,channels",
            "-show_entries",
            "format=duration,size",
            "-of",
            "json",
            str(path),
        ]
    )
    return json.loads(result.stdout)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", required=True, type=Path)
    parser.add_argument("--audio", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--audio-bitrate", default="160k")
    parser.add_argument("--tolerance", type=float, default=0.25)
    args = parser.parse_args()

    video = args.video.resolve()
    audio = args.audio.resolve()
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)

    video_duration = duration(video)
    audio_duration = duration(audio)
    fitted = output.with_name(output.stem + "_fit.wav")

    if math.isclose(video_duration, audio_duration, abs_tol=args.tolerance):
        fitted = audio
        print(f"Audio already fits: audio={audio_duration:.3f}s video={video_duration:.3f}s")
    else:
        factor = audio_duration / video_duration
        chain = atempo_chain(factor)
        print(
            f"Fitting audio: audio={audio_duration:.3f}s video={video_duration:.3f}s "
            f"factor={factor:.6f} filter={chain}"
        )
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(audio),
                "-filter:a",
                chain,
                str(fitted),
            ],
            check=True,
        )

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(video),
            "-i",
            str(fitted),
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            args.audio_bitrate,
            "-shortest",
            str(output),
        ],
        check=True,
    )

    print(json.dumps(ffprobe_json(output), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
