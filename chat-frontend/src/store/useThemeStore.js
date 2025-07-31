import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        let newTheme;
        if (currentTheme === 'light') newTheme = 'dark';
        else if (currentTheme === 'dark') newTheme = 'system';
        else newTheme = 'light';
        get().setTheme(newTheme);
      },
      
      setTheme: (theme) => {
        // Immediately update the DOM for instant visual feedback
        if (theme === 'system') {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } else if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Update state after DOM change for immediate visual feedback
        set({ theme });
      },
      
      initializeTheme: () => {
        const theme = get().theme;
        
        // Apply theme immediately
        if (theme === 'system') {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } else if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Listen for system theme changes if 'system' is selected
        if (!get()._themeListenerAdded) {
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (get().theme === 'system') {
              if (e.matches) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            }
          });
          set({ _themeListenerAdded: true });
        }
      },
      _themeListenerAdded: false,
    }),
    {
      name: 'theme-storage',
    }
  )
); 