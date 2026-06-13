import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'PORTAL' },
    { path: '/simulations', label: 'SIMULATIONS' },
    { path: '/cortex', label: 'CORTEX' },
    { path: '/comparison', label: 'COMPARISON' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-16 h-16 bg-surface/80 backdrop-blur-2xl border-b border-primary-container/20 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
      <Link to="/" className="font-tech text-2xl font-bold text-primary tracking-widest">
        ChronoMind
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`text-label transition-colors ${
              location.pathname === item.path
                ? 'text-primary border-b-2 border-primary pb-1'
                : 'text-on-surface-variant/70 hover:text-primary'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button className="text-label text-primary hover:bg-primary/10 px-4 py-2 rounded-lg transition-all active:scale-95">
          Time Sync
        </button>
        <span className="material-symbols-outlined text-primary cursor-pointer hover:bg-primary/10 p-1 rounded transition-all">settings</span>
        <span className="material-symbols-outlined text-primary cursor-pointer hover:bg-primary/10 p-1 rounded transition-all">account_circle</span>
      </div>
    </nav>
  );
}
