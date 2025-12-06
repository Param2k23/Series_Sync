export default function Navigation() {
  return (
    <nav className="fixed top-0 w-full bg-background z-50 border-b border-border/30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold">Series Sync</span>

        <div className="hidden sm:block">
          <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}
