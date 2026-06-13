export default function Footer() {
  return (
    <footer className="fixed bottom-0 w-full z-50 flex justify-between items-center px-6 md:px-16 py-2 bg-surface-lowest/90 border-t border-secondary/30 shadow-[0_-4px_20px_rgba(37,165,90,0.2)]">
      <div className="text-label text-secondary">© 2124 ChronoMind Neural Systems</div>
      <div className="hidden md:flex items-center gap-8 font-data text-sm text-on-surface-variant">
        <div className="flex items-center gap-2 hover:text-primary transition-all cursor-default">
          <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
          <span>Neural Activation: 84%</span>
        </div>
        <div className="flex items-center gap-2 hover:text-primary transition-all cursor-default">
          <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
          <span>Connection: 12ms</span>
        </div>
        <div className="flex items-center gap-2 hover:text-primary transition-all cursor-default">
          <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping" />
          <span>Uptime: ∞</span>
        </div>
      </div>
    </footer>
  );
}
