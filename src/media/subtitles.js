export function scriptToSrt(script, totalDurationSeconds, options = {}) {
  const lines = splitScript(script, options);
  if (lines.length === 0) {
    throw new Error("No subtitle text was found in the script.");
  }

  const weights = lines.map((line) => Math.max(1, visualLength(line)));
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  let cursor = 0;

  return lines
    .map((line, index) => {
      const duration = Math.max(1.2, (weights[index] / totalWeight) * totalDurationSeconds);
      const start = cursor;
      const end = index === lines.length - 1 ? totalDurationSeconds : Math.min(totalDurationSeconds, cursor + duration);
      cursor = end;
      return `${index + 1}\n${formatSrtTime(start)} --> ${formatSrtTime(end)}\n${line}\n`;
    })
    .join("\n");
}

export function scriptToAss(script, totalDurationSeconds, options = {}) {
  const lines = splitScript(script, options);
  if (lines.length === 0) {
    throw new Error("No subtitle text was found in the script.");
  }

  const weights = lines.map((line) => Math.max(1, visualLength(line)));
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  const playRes = dimensionsForRatio(options.ratio);
  let cursor = 0;

  const events = lines.map((line, index) => {
    const duration = Math.max(1.2, (weights[index] / totalWeight) * totalDurationSeconds);
    const start = cursor;
    const end = index === lines.length - 1 ? totalDurationSeconds : Math.min(totalDurationSeconds, cursor + duration);
    cursor = end;
    return `Dialogue: 0,${formatAssTime(start)},${formatAssTime(end)},Default,,0,0,0,,{\\fad(120,120)\\an2}${escapeAss(line)}`;
  });

  return [
    "[Script Info]",
    "ScriptType: v4.00+",
    `PlayResX: ${playRes.width}`,
    `PlayResY: ${playRes.height}`,
    "ScaledBorderAndShadow: yes",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    "Style: Default,Arial,66,&H00FFFFFF,&H0000FFFF,&H00000000,&H66000000,-1,0,0,0,100,100,1,0,1,5,2,2,80,80,150,1",
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ...events,
    "",
  ].join("\n");
}

export function splitScript(script, options = {}) {
  return script
    .replace(/\r/g, "")
    .split(/(?<=[。？！!?；;])|\n+/u)
    .map((line) => cleanSubtitleText(line.trim(), options))
    .filter(Boolean)
    .flatMap((line) => splitLongLine(line).map((chunk) => cleanSubtitleText(chunk, options)).filter(Boolean));
}

export function stripSubtitlePunctuation(value) {
  return String(value || "")
    .replace(/[，。！？；：、“”‘’（）《》【】「」『』—…·,.!?;:"'()[\]{}<>]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitLongLine(line) {
  const target = containsCjk(line) ? 22 : 64;
  if (visualLength(line) <= target) return [line];

  const parts = line
    .split(/(?<=[，,:、])|(?<=\s)/u)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks = [];
  let current = "";
  for (const part of parts.length ? parts : [line]) {
    const next = current ? `${current}${containsCjk(current) ? "" : " "}${part}` : part;
    if (visualLength(next) > target && current) {
      chunks.push(current);
      current = part;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function visualLength(value) {
  return [...value].reduce((count, char) => count + (containsCjk(char) ? 1 : 0.55), 0);
}

function containsCjk(value) {
  return /[\u3400-\u9fff]/u.test(value);
}

function formatSrtTime(seconds) {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const wholeSeconds = Math.floor(safe % 60);
  const millis = Math.round((safe - Math.floor(safe)) * 1000);
  return `${pad(hours)}:${pad(minutes)}:${pad(wholeSeconds)},${String(millis).padStart(3, "0")}`;
}

function formatAssTime(seconds) {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const wholeSeconds = Math.floor(safe % 60);
  const centiseconds = Math.round((safe - Math.floor(safe)) * 100);
  return `${hours}:${pad(minutes)}:${pad(wholeSeconds)}.${String(centiseconds).padStart(2, "0")}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function cleanSubtitleText(value, options) {
  return options.stripPunctuation ? stripSubtitlePunctuation(value) : value;
}

function escapeAss(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("{", "\\{").replaceAll("}", "\\}");
}

function dimensionsForRatio(ratio) {
  if (ratio === "9:16") return { width: 1080, height: 1920 };
  if (ratio === "1:1") return { width: 1080, height: 1080 };
  if (ratio === "4:5") return { width: 1080, height: 1350 };
  return { width: 1920, height: 1080 };
}
