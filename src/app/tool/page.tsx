import type { Metadata } from "next";
import ColorToolPage from "./ColorToolPage";

export const metadata: Metadata = {
  title: "Color Grading Tool — ColorGrade",
  description: "Professional color correction tool. Adjust LUTs, color wheels, HSL, and more.",
};

export default function Page() {
  return <ColorToolPage />;
}
