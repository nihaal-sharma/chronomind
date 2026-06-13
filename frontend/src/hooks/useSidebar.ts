import { useState, useEffect } from 'react';

export function useSidebar() {
  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem('sidebarMinimized') === 'true';
  });

  useEffect(() => {
    const handleToggle = () => {
      setIsMinimized(localStorage.getItem('sidebarMinimized') === 'true');
    };
    window.addEventListener('sidebarToggle', handleToggle);
    return () => window.removeEventListener('sidebarToggle', handleToggle);
  }, []);

  const toggle = () => {
    const newState = !isMinimized;
    localStorage.setItem('sidebarMinimized', String(newState));
    window.dispatchEvent(new Event('sidebarToggle'));
    setIsMinimized(newState);
  };

  return { isMinimized, toggle };
}
