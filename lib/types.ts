export type HslBandKey =
  | "red" | "orange" | "yellow" | "green"
  | "aqua" | "blue" | "purple" | "magenta";

export interface HslBand {
  h: number;
  s: number;
  l: number;
}
