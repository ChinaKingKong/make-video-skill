export function scriptToSrt(script, totalDurationSeconds) {
  const lines = splitScript(script);
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

export function splitScript(script) {
  return script
    .replace(/\r/g, "")
    .split(/(?<=[。？！!?；;])|\n+/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => splitLongLine(line));
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

function pad(value) {
  return String(value).padStart(2, "0");
}
