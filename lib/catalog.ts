import rawCatalog from "../catalog.json";

export interface PrismPlugin {
  id: string;
  name: string;
  category: string;
  imagePath: string;
  binaryPath: string;
}

export const plugins = rawCatalog as PrismPlugin[];

export const pluginCount = plugins.length;

export const pluginCategories: string[] = Array.from(
  new Set(plugins.map((p) => p.category)),
).sort();

export function pluginsForCategory(category: string): PrismPlugin[] {
  if (category === "All") return plugins;
  return plugins.filter((p) => p.category === category);
}

export function pluginById(id: string): PrismPlugin | null {
  return plugins.find((p) => p.id === id) ?? null;
}

export function pluginBinaryFile(plugin: PrismPlugin): string {
  return plugin.binaryPath.split("/").at(-1) ?? `${plugin.id}.wasm`;
}
