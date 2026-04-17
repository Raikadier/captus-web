import LandingNav from "./LandingNav";
import HeroSection from "./HeroSection";
import ProblemSection from "./ProblemSection";
import SolutionSection from "./SolutionSection";
import JustificationSection from "./JustificationSection";
import FeaturesSection from "./FeaturesSection";
import TechnologySection from "./TechnologySection";
import CTASection from "./CTASection";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <LandingNav />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <JustificationSection />
        <FeaturesSection />
        <TechnologySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
