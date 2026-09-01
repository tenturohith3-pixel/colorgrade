import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Gallery from "@/components/Gallery";
import Pricing from "@/components/Pricing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThreeBackground from "@/components/ThreeBackground";
import SmoothScroll from "@/components/SmoothScroll";
import GSAPAnimations from "@/components/GSAPAnimations";

export default function Home() {
  return (
    <SmoothScroll>
      <GSAPAnimations>
        <ThreeBackground />
        <Navbar />
        <main>
          <Hero />
          <Features />
          <Gallery />
          <Pricing />
        </main>
        <Footer />
      </GSAPAnimations>
    </SmoothScroll>
  );
}
