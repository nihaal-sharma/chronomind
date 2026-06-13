import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../hooks/useSidebar';

const sideItems = [
  { path: '/simulations', label: 'Active Sims', icon: 'hub' },
  { path: '/simulations', label: 'Saved Futures', icon: 'timeline' },
  { path: '/cortex', label: 'Memory Clusters', icon: 'psychology' },
  { path: '/comparison', label: 'System Logs', icon: 'terminal' },
];

export default function Sidebar() {
  const location = useLocation();
  const { isMinimized, toggle } = useSidebar();

  return (
    <aside className={`fixed left-0 top-16 bottom-0 z-40 hidden md:flex flex-col p-4 gap-6 bg-surface-low/40 backdrop-blur-3xl border-r border-primary-container/10 shadow-[5px_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 ${isMinimized ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center ${isMinimized ? 'justify-center flex-col' : 'justify-between'} mb-2`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden border border-primary-container/50 bg-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-container">hub</span>
          </div>
          {!isMinimized && (
            <div>
              <p className="text-label text-primary whitespace-nowrap">Nexus Hub</p>
              <p className="font-data text-xs text-on-surface-variant opacity-60">Sync: 99.8%</p>
            </div>
          )}
        </div>
        <button 
          onClick={toggle}
          className={`text-on-surface-variant hover:text-primary transition-all p-1 ${isMinimized ? 'mt-4' : ''}`}
          title={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
        >
          <span className="material-symbols-outlined">
            {isMinimized ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        {sideItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={i}
              to={item.path}
              title={isMinimized ? item.label : undefined}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:translate-x-1 cursor-pointer overflow-hidden ${
                isActive
                  ? 'bg-secondary-container/20 text-primary border-r-4 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-variant/30'
              } ${isMinimized ? 'justify-center' : ''}`}
            >
              <span className="material-symbols-outlined shrink-0">{item.icon}</span>
              {!isMinimized && <span className="text-label whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      <Link
        to="/simulations"
        className={`w-full py-3 rounded-full bg-primary-container text-on-primary-container text-label font-bold text-center shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center ${isMinimized ? 'px-0' : ''}`}
        title={isMinimized ? "New Simulation" : undefined}
      >
        {isMinimized ? <span className="material-symbols-outlined text-sm">add</span> : 'New Simulation'}
      </Link>

      <div className="pt-4 border-t border-primary-container/10 flex flex-col gap-1">
        <div className={`flex items-center gap-3 p-2 text-on-surface-variant hover:text-primary transition-all cursor-pointer overflow-hidden ${isMinimized ? 'justify-center' : ''}`} title={isMinimized ? "Settings" : undefined}>
          <span className="material-symbols-outlined shrink-0">settings</span>
          {!isMinimized && <span className="text-label whitespace-nowrap">Settings</span>}
        </div>
        <div className={`flex items-center gap-3 p-2 text-on-surface-variant hover:text-primary transition-all cursor-pointer overflow-hidden ${isMinimized ? 'justify-center' : ''}`} title={isMinimized ? "Power" : undefined}>
          <span className="material-symbols-outlined shrink-0">power_settings_new</span>
          {!isMinimized && <span className="text-label whitespace-nowrap">Power</span>}
        </div>
      </div>
    </aside>
  );
}
