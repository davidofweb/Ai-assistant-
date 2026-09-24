import { useEffect, useState } from 'react';
import { Settings } from '../types';
import { storage } from '../services/storage';

export function useTheme() {
  const [theme, setThemeState] = useState<Settings['theme']>(() => {
    return storage.getSettings().theme || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (targetTheme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(targetTheme);
      // Also apply style attributes if required
      root.style.colorScheme = targetTheme;
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      applyTheme(systemTheme);

      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  const setTheme = (newTheme: Settings['theme']) => {
    setThemeState(newTheme);
    const settings = storage.getSettings();
    storage.saveSettings({ ...settings, theme: newTheme });
  };

  return { theme, setTheme };
}
