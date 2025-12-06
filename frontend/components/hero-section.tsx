"use client"

import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic'

const SplineScene = dynamic(() => import('@/components/spline-scene'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading 3D Scene...</div>,
})

export default function HeroSection() {
  return (
    <section className="pt-32 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - 3D Animation */}
          <div className="w-full h-[400px] rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 relative">
             <SplineScene />
          </div>

          {/* Right - Content */}
          <div className="flex flex-col gap-6">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight text-balance">
              Connect with <span className="text-primary">ease</span>
            </h1>

            <p className="text-lg text-foreground/70 max-w-md leading-relaxed">
              Instant group creation. Seamless messaging. Built for teams that value simplicity.
            </p>

            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 rounded-full font-semibold w-fit text-base"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
