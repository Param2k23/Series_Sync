
import HeroSection from "@/components/hero-section"
import Navigation from "@/components/navigation"

export default function Home() {
  return (
    <main className="w-full bg-background text-foreground">
      <Navigation />
      <HeroSection />
    </main>
  )
}
