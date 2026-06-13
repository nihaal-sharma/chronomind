import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ShaderBackground from '../components/shared/ShaderBackground';
import ParticleField from '../components/shared/ParticleField';
import HeroPortal from '../components/landing/HeroPortal';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-void">
      {/* Scanline */}
      <div className="scanline-effect" />

      {/* Backgrounds */}
      <ShaderBackground />
      <ParticleField count={40} />

      {/* Top Nav - Simplified for landing */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-16 h-16 bg-surface/80 backdrop-blur-2xl border-b border-primary-container/20 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
        <div className="font-tech text-2xl font-bold text-primary tracking-widest">ChronoMind</div>
        <div className="hidden md:flex items-center gap-8">
          <span className="text-label text-primary border-b-2 border-primary pb-1 cursor-pointer">PORTAL</span>
          <span onClick={() => navigate('/simulations')} className="text-label text-on-surface-variant/70 hover:text-primary transition-colors cursor-pointer">SIMULATIONS</span>
          <span onClick={() => navigate('/cortex')} className="text-label text-on-surface-variant/70 hover:text-primary transition-colors cursor-pointer">CORTEX</span>
          <span onClick={() => navigate('/comparison')} className="text-label text-on-surface-variant/70 hover:text-primary transition-colors cursor-pointer">COMPARISON</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-label text-primary hover:bg-primary/10 px-4 py-2 rounded-lg transition-all">Time Sync</button>
          <span className="material-symbols-outlined text-primary cursor-pointer hover:bg-primary/10 p-1 rounded transition-all">settings</span>
          <span className="material-symbols-outlined text-primary cursor-pointer hover:bg-primary/10 p-1 rounded transition-all">account_circle</span>
        </div>
      </nav>

      {/* HUD - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="fixed top-24 left-6 md:left-16 z-40"
      >
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-primary/10" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="2" />
              <circle className="text-primary neural-glow" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125.6" strokeDashoffset="20" strokeWidth="2" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-data text-[10px] text-primary">84%</div>
          </div>
          <div>
            <div className="text-label text-primary/60">NEURAL ACTIVATION</div>
            <div className="font-data text-primary">CALIBRATING...</div>
          </div>
        </div>
      </motion.div>

      {/* HUD - Top Right */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="fixed top-24 right-6 md:right-16 z-40 text-right"
      >
        <div className="glass-panel p-4 rounded-xl inline-block border-r-4 border-primary">
          <div className="text-label text-primary/60">TEMPORAL SYNC</div>
          <div className="font-data text-primary flex items-center justify-end gap-2">
            <span>STABLE</span>
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
          </div>
          <div className="mt-1 font-data text-[10px] text-on-surface-variant/40">DRIFT: 0.00003ms</div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="relative h-screen flex flex-col items-center justify-center px-4 md:px-0">
        {/* Three.js Portal */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[40rem] h-[40rem] max-w-full aspect-square opacity-80" style={{ perspective: '1000px' }}>
            <HeroPortal />
          </div>
        </div>

        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative z-10 text-center max-w-4xl mt-16"
        >
          <h1 className="font-display text-[64px] md:text-[120px] text-primary neural-glow leading-tight tracking-tighter italic">
            ChronoMind
          </h1>
          <p className="font-tech text-sm md:text-xl text-primary/70 tracking-[0.4em] uppercase mt-2">
            Explore Thousands of Possible Futures
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="pt-10"
          >
            <button
              onClick={() => navigate('/simulations')}
              className="group relative px-10 py-5 bg-transparent border border-primary/40 rounded-full text-label text-primary overflow-hidden transition-all duration-700 hover:scale-105 active:scale-95 pulse-aura cursor-pointer"
            >
              <span className="relative z-10 tracking-widest">ENTER THE TIME NEXUS</span>
              <div className="absolute inset-0 bg-primary/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              <div className="absolute inset-0 rounded-full border border-primary/0 group-hover:border-primary/40 group-hover:scale-110 transition-all duration-700" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-3xl mx-auto"
          >
            {[
              { icon: 'hub', label: 'SYNAPTIC MESH' },
              { icon: 'timeline', label: 'EVENT HORIZON' },
              { icon: 'psychology', label: 'NEURAL CORE' },
            ].map((item) => (
              <div key={item.label} className="text-center group cursor-crosshair">
                <span className="material-symbols-outlined text-primary text-3xl mb-2 block group-hover:scale-125 transition-transform">
                  {item.icon}
                </span>
                <h3 className="text-label text-[10px] text-primary/50 tracking-widest">{item.label}</h3>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Side HUD */}
      <aside className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-8 pl-6">
        <div className="w-px h-24 bg-gradient-to-t from-primary/40 to-transparent mx-auto" />
        <div className="font-data text-[10px] text-primary/40 tracking-[0.5em] rotate-180" style={{ writingMode: 'vertical-rl' }}>
          SYSTEM_REV:2124.A
        </div>
        <div className="w-px h-24 bg-gradient-to-b from-primary/40 to-transparent mx-auto" />
      </aside>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full z-50 flex justify-between items-center px-6 md:px-16 py-2 bg-surface-lowest/90 border-t border-secondary/30 shadow-[0_-4px_20px_rgba(37,165,90,0.2)]">
        <div className="text-label text-secondary">© 2124 ChronoMind Neural Systems</div>
        <div className="hidden md:flex items-center gap-8 font-data text-sm text-on-surface-variant">
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-secondary rounded-full" /><span>Neural Activation: 84%</span></div>
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-secondary rounded-full" /><span>Connection: 12ms</span></div>
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping" /><span>Uptime: ∞</span></div>
        </div>
      </footer>
    </div>
  );
}
