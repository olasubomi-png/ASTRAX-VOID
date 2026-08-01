import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { GamesShowcase } from "@/components/home/GamesShowcase";
import { Categories } from "@/components/home/Categories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { DiscordCTA } from "@/components/home/DiscordCTA";
import { FAQ } from "@/components/home/FAQ";
import { Newsletter } from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <GamesShowcase />
      <Categories />
      <FeaturedProducts />
      <HowItWorks />
      <Testimonials />
      <DiscordCTA />
      <FAQ />
      <Newsletter />
    </>
  );
}
