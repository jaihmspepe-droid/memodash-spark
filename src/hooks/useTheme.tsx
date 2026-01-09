import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ThemeContextType {
  isDarkMode: boolean;
  primaryColor: string;
  toggleDarkMode: () => void;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorPresets = [
  { name: 'Rouge', hsl: '0 75% 50%' },
  { name: 'Violet', hsl: '280 70% 50%' },
  { name: 'Bleu', hsl: '220 80% 50%' },
  { name: 'Vert', hsl: '142 70% 45%' },
  { name: 'Orange', hsl: '30 95% 55%' },
  { name: 'Rose', hsl: '320 70% 50%' },
];

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('memodeck-dark-mode');
    return saved === 'true';
  });
  const [primaryColor, setPrimaryColorState] = useState(() => {
    return localStorage.getItem('memodeck-primary-color') || '0 75% 50%';
  });

  // Apply theme on mount and changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('memodeck-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  // Apply primary color
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--primary-glow', primaryColor.replace(/(\d+)%\)$/, (_, p) => `${Math.min(100, parseInt(p) + 10)}%)`));
    root.style.setProperty('--ring', primaryColor);
    localStorage.setItem('memodeck-primary-color', primaryColor);
  }, [primaryColor]);

  // Load from profile when user logs in
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('dark_mode, primary_color')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        if (profile.dark_mode !== null) {
          setIsDarkMode(profile.dark_mode);
        }
        if (profile.primary_color) {
          setPrimaryColorState(profile.primary_color);
        }
      }
    };

    loadUserPreferences();
  }, [user]);

  const toggleDarkMode = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);

    if (user) {
      await supabase
        .from('profiles')
        .update({ dark_mode: newValue })
        .eq('user_id', user.id);
    }
  };

  const setPrimaryColor = async (color: string) => {
    setPrimaryColorState(color);

    if (user) {
      await supabase
        .from('profiles')
        .update({ primary_color: color })
        .eq('user_id', user.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, primaryColor, toggleDarkMode, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { colorPresets };
