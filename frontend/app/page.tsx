"use client"

import { useState, useCallback } from "react"
import HeroSection from "@/components/hero-section"
import Navigation from "@/components/navigation"
import { HeroScrollDemo } from "@/components/hero-scroll-demo"
import LoadingScreen from "@/components/loading-screen"

export default function Home() {
  const [showContent, setShowContent] = useState(false)

  const handleLoadingComplete = useCallback(() => {
    // Loading screen has fully exited, now show and start the content
    setShowContent(true)
  }, [])

  return (
    <>
      <LoadingScreen 
        isLoading={false}  // No external loading dependency - just run the animation
        onLoadingComplete={handleLoadingComplete}
      />
      <main 
        className="w-full bg-background text-foreground"
        style={{
          opacity: showContent ? 1 : 0,
          visibility: showContent ? "visible" : "hidden",
          transition: "opacity 0.5s ease-out",
        }}
      >
        <Navigation />
        {/* Only render 3D scene after loading screen exits */}
        {showContent && <HeroSection />}
        <HeroScrollDemo />
      </main>
    </>
  )
}
