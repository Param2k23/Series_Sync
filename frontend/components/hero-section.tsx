"use client"

import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic'

const SplineScene = dynamic(() => import('@/components/spline-scene'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading 3D Scene...</div>,
})

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* 3D Spline Scene - Full Screen / Large */}
      <div className="relative w-full h-[120vh] -mt-20"> {/* Increased height for "bigger phone" */}
        <div className="absolute inset-0 z-0">
          <SplineScene />
        </div>

        {/* Overlay to cover watermark (Bottom Right) */}
        <div className="absolute bottom-4 right-4 w-32 h-12 bg-background z-10 pointer-events-none" />

        {/* Content - Positioned below/overlaying bottom right */}
        <div className="absolute bottom-20 right-10 z-20 flex flex-col items-end gap-6 max-w-xl text-right p-6 pointer-events-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight text-balance">
            Connect with <span className="text-primary">ease</span>
          </h1>

          <p className="text-xl text-foreground/70 leading-relaxed">
            Instant group creation. Seamless messaging. Built for teams that value simplicity.
          </p>

          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 rounded-full font-semibold text-lg shadow-lg"
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  )
}
