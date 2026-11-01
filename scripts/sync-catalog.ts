/**
 * Consolidate the real Effectcraft plugin projects into this web app.
 *
 * Source projects:
 *   - Sapphire-Style-Suite  (60 Prism WASM modules + rendered previews)
 *   - EffectCraft-Twixtor   (4 Twixtor WASM modules)
 *   - deep glow-Effectcraft (1 Deep Glow WASM module)
 *
 * Output:
 *   - private/plugins/*.wasm
 *   - public/media/prism/*.png
 *   - catalog.json
 *
 * Run with: bun run scripts/sync-catalog.ts
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type CatalogEntry = {
  id: string;
  name: string;
  category: string;
  imagePath: string;
  binaryPath: string;
};

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const documentsRoot = resolve(projectRoot, "..");

const sources = {
  sapphire: join(documentsRoot, "Sapphire-Style-Suite"),
  twixtor: join(documentsRoot, "EffectCraft-Twixtor"),
  deepGlow: join(documentsRoot, "deep glow-Effectcraft"),
};

const pluginOutDir = join(projectRoot, "private", "plugins");
const previewOutDir = join(projectRoot, "public", "media", "prism");
const catalogPath = join(projectRoot, "catalog.json");

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

// Windows source projects mark build/test output as hidden. Clear that flag on
// copied files so they behave like normal Next.js assets and repository files.
function unhide(path: string) {
  if (process.platform !== "win32") return;
  try {
    execFileSync("attrib", ["-H", path], { stdio: "ignore" });
  } catch {
    // Non-fatal: the file is still readable even if the attribute cannot change.
  }
}

function copyBinary(source: string, outputName: string): string {
  if (!existsSync(source)) fail(`Missing WASM binary: ${source}`);
  const output = join(pluginOutDir, outputName);
  copyFileSync(source, output);
  unhide(output);
  return output;
}

function relativeToProject(path: string): string {
  return path.slice(projectRoot.length + 1).replaceAll("\\", "/");
}

for (const [name, path] of Object.entries(sources)) {
  if (!existsSync(path)) fail(`Source folder for ${name} not found: ${path}`);
}

ensureDir(pluginOutDir);
ensureDir(previewOutDir);

// Remove previously synced binaries so the 65-file count stays deterministic.
for (const entry of readdirSync(pluginOutDir, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith(".wasm")) {
    rmSync(join(pluginOutDir, entry.name), { force: true });
  }
}

// ---------------------------------------------------------------------------
// 1. Prism Suite: read the Rust registry so effect names, categories, and
//    compiled module keys stay authoritative and cannot drift from filenames.
// ---------------------------------------------------------------------------

const sapphireReadmePath = join(sources.sapphire, "README.md");
if (!existsSync(sapphireReadmePath)) fail(`Missing Sapphire README: ${sapphireReadmePath}`);

const registryPath = join(sources.sapphire, "src", "registry.rs");
if (!existsSync(registryPath)) fail(`Missing Sapphire registry: ${registryPath}`);

const registrySource = readFileSync(registryPath, "utf8");
const definitionPattern =
  /key:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)"/g;

const prismDefinitions = Array.from(registrySource.matchAll(definitionPattern), (match) => ({
  key: match[1] ?? "",
  name: match[2] ?? "",
  category: match[3] ?? "",
}));

if (prismDefinitions.length !== 60) {
  fail(`Expected 60 Prism definitions in registry.rs, found ${prismDefinitions.length}`);
}

const prismEntries: CatalogEntry[] = prismDefinitions.map((definition) => {
  if (!definition.key || !definition.name || !definition.category) {
    fail("Found an incomplete Prism definition in registry.rs");
  }

  const binaryName = `prism-${definition.key.replaceAll("_", "-")}.wasm`;
  const sourceBinary = join(sources.sapphire, "dist", binaryName);
  const sourcePreview = join(
    sources.sapphire,
    "tests",
    "frames",
    `${definition.key}_p3.png`,
  );

  if (!existsSync(sourceBinary)) {
    fail(`Prism binary not found for ${definition.name}: ${sourceBinary}`);
  }
  if (!existsSync(sourcePreview)) {
    fail(`Prism preview not found for ${definition.name}: ${sourcePreview}`);
  }

  const outputBinary = copyBinary(sourceBinary, binaryName);

  return {
    id: `prism-${definition.key.replaceAll("_", "-")}`,
    name: definition.name,
    category: definition.category,
    imagePath: `/media/prism/${definition.key}_p3.png`,
    binaryPath: relativeToProject(outputBinary),
  };
});

// ---------------------------------------------------------------------------
// 2. Twixtor: four independently built WASM modules.
// ---------------------------------------------------------------------------

const twixtorReleaseDir = join(
  sources.twixtor,
  "target",
  "wasm32-unknown-unknown",
  "release",
);

const twixtorDefinitions = [
  {
    id: "twixtor-manual",
    name: "Twixtor Manual",
    category: "Time",
    source: "twixtor.wasm",
    output: "twixtor-manual.wasm",
    image: "motion_blur_p3.png",
  },
  {
    id: "twixtor-auto",
    name: "Twixtor Auto",
    category: "Time",
    source: "twixtor_auto.wasm",
    output: "twixtor-auto.wasm",
    image: "motion_blur_p3.png",
  },
  {
    id: "twixtor-tracking",
    name: "Twixtor Tracking",
    category: "Time",
    source: "twixtor_tracking.wasm",
    output: "twixtor-tracking.wasm",
    image: "motion_blur_p3.png",
  },
  {
    id: "twixtor-pro",
    name: "Twixtor Pro",
    category: "Time",
    source: "twixtor_pro.wasm",
    output: "twixtor-pro.wasm",
    image: "motion_blur_p3.png",
  },
] as const;

const twixtorEntries: CatalogEntry[] = twixtorDefinitions.map((definition) => {
  const outputBinary = copyBinary(
    join(twixtorReleaseDir, definition.source),
    definition.output,
  );

  return {
    id: definition.id,
    name: definition.name,
    category: definition.category,
    imagePath: `/media/prism/${definition.image}`,
    binaryPath: relativeToProject(outputBinary),
  };
});

// ---------------------------------------------------------------------------
// 3. Deep Glow.
// ---------------------------------------------------------------------------

const deepGlowSource = join(sources.deepGlow, "Deep Glow.wasm");
const deepGlowBinary = copyBinary(deepGlowSource, "deep-glow.wasm");

const deepGlowEntry: CatalogEntry = {
  id: "deep-glow",
  name: "Deep Glow",
  category: "Stylize",
  imagePath: "/media/prism/glow_p3.png",
  binaryPath: relativeToProject(deepGlowBinary),
};

// ---------------------------------------------------------------------------
// 4. Copy every rendered preview frame from the Sapphire test suite.
// ---------------------------------------------------------------------------

const previewSourceDir = join(sources.sapphire, "tests", "frames");
if (!existsSync(previewSourceDir)) fail(`Missing preview folder: ${previewSourceDir}`);

const previewFiles = readdirSync(previewSourceDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".png"))
  .map((entry) => entry.name);

if (previewFiles.length === 0) fail(`No PNG previews found in ${previewSourceDir}`);

for (const fileName of previewFiles) {
  const output = join(previewOutDir, fileName);
  copyFileSync(join(previewSourceDir, fileName), output);
  unhide(output);
}

// ---------------------------------------------------------------------------
// 5. Validate and write the manifest.
// ---------------------------------------------------------------------------

const catalog: CatalogEntry[] = [...prismEntries, ...twixtorEntries, deepGlowEntry];
const ids = new Set<string>();
const binaries = new Set<string>();

for (const entry of catalog) {
  if (ids.has(entry.id)) fail(`Duplicate catalog id: ${entry.id}`);
  ids.add(entry.id);
  if (binaries.has(entry.binaryPath)) fail(`Duplicate binary path: ${entry.binaryPath}`);
  binaries.add(entry.binaryPath);

  const absoluteBinary = join(projectRoot, entry.binaryPath);
  if (!existsSync(absoluteBinary)) fail(`Manifest binary missing: ${absoluteBinary}`);
  if (statSync(absoluteBinary).size === 0) fail(`Manifest binary is empty: ${absoluteBinary}`);

  const absoluteImage = join(projectRoot, "public", entry.imagePath.replace(/^\//, ""));
  if (!existsSync(absoluteImage)) fail(`Manifest image missing: ${absoluteImage}`);
}

const wasmFiles = readdirSync(pluginOutDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".wasm"));

if (wasmFiles.length !== 65) {
  fail(`Expected 65 copied WASM binaries, found ${wasmFiles.length}`);
}

writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

const totalBinaryBytes = wasmFiles.reduce(
  (total, entry) => total + statSync(join(pluginOutDir, entry.name)).size,
  0,
);

console.log("Effectcraft catalogue synced");
console.log("----------------------------------------");
console.log(`Prism libraries:   ${prismEntries.length}`);
console.log(`Twixtor libraries: ${twixtorEntries.length}`);
console.log(`Deep Glow:         ${deepGlowEntry ? 1 : 0}`);
console.log(`Total libraries:   ${catalog.length}`);
console.log(`WASM binaries:     ${wasmFiles.length} (${(totalBinaryBytes / 1024 / 1024).toFixed(2)} MB)`);
console.log(`Preview images:    ${previewFiles.length}`);
console.log(`Manifest:          ${basename(catalogPath)}`);
