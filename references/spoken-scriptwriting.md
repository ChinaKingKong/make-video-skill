# Spoken Scriptwriting

Use this reference when converting articles, reports, outlines, dense notes, or written drafts into narration for videos, TTS, voiceover, subtitles, or talking-head clips.

## Goal

Make the script natural to say aloud and comfortable to hear. A narrator should not need to stop, guess a pronunciation, or mentally rewrite the sentence while reading.

## Rewrite Rules

- Convert written language to spoken language. Replace formal connectors with everyday speech: `此外` -> `另外` or `还有`; `然而` -> `但是` or `不过`; `已然` -> `已经`; `鉴于此` -> `所以`.
- Replace awkward or hard-to-say words with spoken equivalents. Examples: `发心` -> `初衷` or `出发点`; `审计` -> `财务检查（审计）`; `极大地减小` -> `大幅降低`; `赋能` -> `帮助` or `让...能够`.
- Split long sentences. If a Chinese sentence is over about 25 characters or has multiple clauses, break it into shorter complete sentences and connect them with spoken transitions.
- Expand numbers and symbols into how they should be read. Examples: `2024年` -> `二〇二四年`; `50%` -> `百分之五十`; `3倍` -> `三倍`; `$100` -> `一百美元`. Replace `/`, `&`, `@`, `#`, and similar symbols with Chinese words or remove them when they are not meant to be spoken.
- Explain professional terms on first use with a short spoken parenthetical, such as `ROI（也就是投资回报率）`. After the first explanation, use the established short name.
- Add natural transitions between sections, such as `好，`, `那么，`, `说到这里，`, `接下来，`, and `你可能会问，`.
- Add interaction when it fits the format: `你`, `咱们`, `你有没有发现`, `你可能也遇到过`. Use a hook at the beginning when the video needs curiosity, and use a concise recap or call to action at the end when appropriate.
- Delete written-only filler such as `上文提到的`, `如前所述`, `综上所述`, and `由此可见`. Replace with spoken phrasing like `刚才说的`, `前面提到`, `所以`, or `你看`.
- Convert lists into spoken enumeration: `第一...第二...最后...`. If there are more than four items, merge related items or keep the most important three unless the brief requires exhaustive coverage.
- Mark pacing only when useful. Use `——` for a clear pause or breath and `……` for a softer trailing pause. Mark emphasis with Chinese brackets, such as `这才是【真正的关键】`. Do not use bold or italic markup in narration text.

## Guardrails

- Do not change the source's core viewpoint or information.
- Do not invent facts, data, cases, or causal claims that are not in the source.
- Do not remove important evidence, examples, people, brands, or caveats.
- Do not confuse names of people, companies, products, or platforms.
- Keep the narration speakable before optimizing for subtitles. Captions can be split later; the voice script must sound natural first.

## Output Style

- Write the spoken script body directly into `narration.txt` or `script.md`.
- Use blank lines between paragraphs so a human narrator can see breathing points.
- If the source has obvious sections, preserve the section flow with spoken headings such as `好，我们先来说第一点——`.
- For TTS workflows, keep punctuation intentional: punctuation controls rhythm, pauses, and caption splitting.
