import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Gallery from "@/components/Gallery";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import GSAPAnimations from "@/components/GSAPAnimations";

export default function Home() {
  return (
    <SmoothScroll>
      <GSAPAnimations>
        <Navbar />
        <main>
          <Hero />
          <Features />
          <Gallery />
          <Testimonials />
          <Pricing />
          <CTASection />
        </main>
        <Footer />
      </GSAPAnimations>
    </SmoothScroll>
  );
}
