/**
 * EffectCraft Studio — .cube 3D LUT parser (Pro feature).
 * Handles standard Resolve/IRIDAS text cubes: LUT_3D_SIZE N then N³ RGB lines.
 */

export interface CubeLut {
  size: number;
  data: Float32Array; // [r,g,b] triples; red varies fastest
  title: string;
}

export interface CubeParseResult {
  ok: boolean;
  cube?: CubeLut;
  error?: string;
}

export function parseCube(text: string): CubeParseResult {
  const lines = text.split(/\r?\n/);
  let size = 0;
  let title = "";
  let need = 0;
  const triples: number[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("TITLE")) {
      title = line.slice(5).trim().replace(/^["']|["']$/g, "");
      continue;
    }
    if (/^(LUT_1D_SIZE|LUT_3D_INPUT_SIZE|DOMAIN_MAX|DOMAIN_MIN|LUT_INVERSE)/i.test(line)) {
      continue;
    }
    if (/^LUT_3D_SIZE/i.test(line)) {
      const m = /LUT_3D_SIZE\s+(\d+)/i.exec(line);
      if (!m || !m[1]) return { ok: false, error: "Invalid LUT_3D_SIZE line." };
      size = parseInt(m[1], 10);
      if (size < 2 || size > 128) return { ok: false, error: "Unsupported LUT size." };
      need = size * size * size;
      continue;
    }
    const nums = line.split(/\s+/).map(Number);
    if (nums.length === 3 && nums.every((n) => Number.isFinite(n))) {
      triples.push(nums[0] ?? 0, nums[1] ?? 0, nums[2] ?? 0);
    }
  }

  if (!size) return { ok: false, error: "Missing LUT_3D_SIZE header." };
  if (need && triples.length !== need * 3) {
    return { ok: false, error: `Expected ${need} colours, found ${triples.length / 3}.` };
  }

  const data = new Float32Array(triples);
  for (let i = 0; i < data.length; i++) {
    const v = data[i] ?? 0;
    data[i] = v < 0 ? 0 : v > 1 ? 1 : v;
  }
  return { ok: true, cube: { size, data, title: title || "Untitled" } };
}
