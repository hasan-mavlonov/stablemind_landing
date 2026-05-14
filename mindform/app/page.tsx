import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import Hero from "@/components/marketing/Hero";
import Pitch from "@/components/marketing/Pitch";
import CastRow from "@/components/marketing/CastRow";
import SystemPreview from "@/components/marketing/SystemPreview";
import UseCases from "@/components/marketing/UseCases";
import PricingTeaser from "@/components/marketing/PricingTeaser";

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <Pitch />
      <CastRow />
      <SystemPreview />
      <UseCases />
      <PricingTeaser />
      <Footer />
    </main>
  );
}
