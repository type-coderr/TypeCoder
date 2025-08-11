// Update this page (the content is just a fallback if you fail to update the page)

import Navigation from "@/components/layout/Navigation";
import HeroSection from "@/components/ui/hero-section";
import Footer from "@/components/layout/Footer";
import ParticleBackground from "@/components/layout/ParticleBackground";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <div className="relative z-10">
        <Navigation />
        <HeroSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
