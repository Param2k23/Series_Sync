import HeroSection from "@/components/hero-section"
import Navigation from "@/components/navigation"
import { HeroScrollDemo } from "@/components/hero-scroll-demo"

export default function Home() {
  return (
    <main className="w-full bg-background text-foreground">
      <Navigation />
      <HeroSection />
      <HeroScrollDemo />
    </main>
  )
}
